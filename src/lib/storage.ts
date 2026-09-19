import { 
  SignedAttestation, 
  ShareCode, 
  Receipt, 
  IssuerIdentity, 
  CoarseCategory, 
  FineCategory, 
  PredicateResult, 
  EntitlementRecord, 
  BreakGlassRequest,
  HRPublicPayload,
  ApprovalRecord,
  NotificationItem,
  AuditLogEntry,
  QueueItem,
  MedicalDocument,
  ClinicProfile
} from './types';
import { TRUSTED_ISSUERS } from './registry';
import { 
  GENESIS_BLOCK_HASH, 
  computeReceiptHash, 
  computeIssuerRefHash, 
  computeEmployerPseudonym,
  padPayloadToUniformLength,
  getJitteredRoundedTimestamp,
  computeSHA256,
  canonicalizeJson
} from './crypto';
import { getRuleByCoarseCategory, mapFineToCoarseCategory, VOUCH_POLICY_SPEC } from './policy';

const STORAGE_KEYS = {
  ATTESTATIONS: 'vouch_attestations_v2',
  SHARE_CODES: 'vouch_share_codes_v2',
  RECEIPTS_CHAIN: 'vouch_receipts_chain_v2',
  ENTITLEMENT_LEDGER: 'vouch_entitlement_ledger_v2',
  BREAK_GLASS: 'vouch_break_glass_v2',
  ACTIVE_ISSUER_ID: 'vouch_active_issuer_id_v2',
  INITIALIZED: 'vouch_initialized_v2',
  APPROVALS: 'vouch_approvals_v2',
  NOTIFICATIONS: 'vouch_notifications_v2',
  AUDIT_LOGS: 'vouch_audit_logs_v2',
  PENDING_QUEUE: 'vouch_pending_queue_v2',
  CLINIC_PROFILE: 'vouch_clinic_profile_v2',
  CLINIC_DOCUMENTS: 'vouch_clinic_documents_v2',
};

const STATE_EVENT = 'vouch_state_updated';

export function notifyStateChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STATE_EVENT));
  }
}

export function subscribeToStateChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const handleCustom = () => callback();
  const handleStorage = (e: StorageEvent) => {
    if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
      callback();
    }
  };

  window.addEventListener(STATE_EVENT, handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(STATE_EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}

// ===================== ATTESTATIONS (Holder & Issuer Level) =====================

export function getAttestations(): SignedAttestation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTESTATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAttestation(attestation: SignedAttestation): void {
  if (typeof window === 'undefined') return;
  const list = getAttestations();
  const updated = [attestation, ...list.filter(a => a.payload.attestationId !== attestation.payload.attestationId)];
  localStorage.setItem(STORAGE_KEYS.ATTESTATIONS, JSON.stringify(updated));
  notifyStateChange();
}

export function getAttestationById(id: string): SignedAttestation | undefined {
  return getAttestations().find(a => a.payload.attestationId === id);
}

// F6: Issuer Revocation
export function revokeAttestationByIssuer(attestationId: string): boolean {
  if (typeof window === 'undefined') return false;
  const list = getAttestations();
  const item = list.find(a => a.payload.attestationId === attestationId);
  if (item) {
    item.isRevokedByIssuer = true;
    item.revokedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ATTESTATIONS, JSON.stringify(list));

    // Also mark any associated active share codes
    const shares = getShareCodes();
    shares.forEach(s => {
      if (s.attestationId === attestationId) {
        s.isRevoked = true;
      }
    });
    localStorage.setItem(STORAGE_KEYS.SHARE_CODES, JSON.stringify(shares));
    notifyStateChange();
    return true;
  }
  return false;
}

// ===================== SHARE CODES =====================

export function getShareCodes(): ShareCode[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHARE_CODES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveShareCode(shareCode: ShareCode): void {
  if (typeof window === 'undefined') return;
  const list = getShareCodes();
  const updated = [shareCode, ...list.filter(s => s.code !== shareCode.code)];
  localStorage.setItem(STORAGE_KEYS.SHARE_CODES, JSON.stringify(updated));
  notifyStateChange();
}

export function getShareCodeByCode(code: string): ShareCode | undefined {
  const normalized = code.trim().toUpperCase();
  return getShareCodes().find(s => s.code.toUpperCase() === normalized);
}

export function revokeShareCode(code: string): boolean {
  if (typeof window === 'undefined') return false;
  const list = getShareCodes();
  const item = list.find(s => s.code === code);
  if (item) {
    item.isRevoked = true;
    localStorage.setItem(STORAGE_KEYS.SHARE_CODES, JSON.stringify(list));
    notifyStateChange();
    return true;
  }
  return false;
}

export function incrementShareCodeViews(code: string): void {
  if (typeof window === 'undefined') return;
  const list = getShareCodes();
  const item = list.find(s => s.code === code);
  if (item) {
    item.viewCount = (item.viewCount || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.SHARE_CODES, JSON.stringify(list));
    notifyStateChange();
  }
}

// ===================== F1: ENTITLEMENT LEDGER =====================

export function getEntitlementLedger(): EntitlementRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTITLEMENT_LEDGER);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getEntitlementRecord(
  pseudonym: string,
  coarseCategory: CoarseCategory
): EntitlementRecord {
  const ledger = getEntitlementLedger();
  const found = ledger.find(e => e.employerPseudonym === pseudonym && e.coarseCategory === coarseCategory);
  if (found) return found;

  const rule = getRuleByCoarseCategory(coarseCategory);
  return {
    employerPseudonym: pseudonym,
    coarseCategory,
    daysEntitledAnnual: rule.maxDays,
    daysTakenYTD: 0,
    approvedRanges: [],
    lastUpdated: new Date().toISOString()
  };
}

export function calculateDaysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = Math.abs(e.getTime() - s.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function evaluatePredicates(
  pseudonym: string,
  coarseCategory: CoarseCategory,
  startDate: string,
  endDate: string,
  signedAttestation?: SignedAttestation
): { predicates: PredicateResult; durationDays: number; record: EntitlementRecord } {
  const record = getEntitlementRecord(pseudonym, coarseCategory);
  const rule = getRuleByCoarseCategory(coarseCategory);
  const durationDays = calculateDaysBetween(startDate, endDate);

  // 1. withinPolicyMaxDuration: Is this single request duration <= max allowed by statutory policy?
  const withinPolicyMaxDuration = durationDays <= rule.maxDays;

  // 2. withinRemainingEntitlement: Does employee have sufficient quota remaining?
  const withinRemainingEntitlement = (record.daysTakenYTD + durationDays) <= record.daysEntitledAnnual;

  // 3. withinCredentialValidity: Does requested window fall inside doctor's signed dates?
  let withinCredentialValidity = true;
  if (rule.requiresCredential && signedAttestation) {
    const attStart = new Date(signedAttestation.payload.startDate);
    const attEnd = new Date(signedAttestation.payload.endDate);
    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);
    withinCredentialValidity = reqStart >= attStart && reqEnd <= attEnd && !signedAttestation.isRevokedByIssuer;
  }

  // 4. noOverlapWithApproved: Does requested range overlap with any approved leaves?
  const reqStart = new Date(startDate).getTime();
  const reqEnd = new Date(endDate).getTime();
  const hasOverlap = record.approvedRanges.some(range => {
    const rStart = new Date(range.start).getTime();
    const rEnd = new Date(range.end).getTime();
    return Math.max(reqStart, rStart) <= Math.min(reqEnd, rEnd);
  });
  const noOverlapWithApproved = !hasOverlap;

  return {
    predicates: {
      withinPolicyMaxDuration,
      withinRemainingEntitlement,
      withinCredentialValidity,
      noOverlapWithApproved
    },
    durationDays,
    record
  };
}

export function recordApprovedEntitlement(
  pseudonym: string,
  coarseCategory: CoarseCategory,
  startDate: string,
  endDate: string,
  receiptId: string
): void {
  if (typeof window === 'undefined') return;
  const ledger = getEntitlementLedger();
  const duration = calculateDaysBetween(startDate, endDate);
  
  let record = ledger.find(e => e.employerPseudonym === pseudonym && e.coarseCategory === coarseCategory);
  if (!record) {
    const rule = getRuleByCoarseCategory(coarseCategory);
    record = {
      employerPseudonym: pseudonym,
      coarseCategory,
      daysEntitledAnnual: rule.maxDays,
      daysTakenYTD: 0,
      approvedRanges: [],
      lastUpdated: new Date().toISOString()
    };
    ledger.push(record);
  }

  record.daysTakenYTD += duration;
  record.approvedRanges.push({ start: startDate, end: endDate, receiptId });
  record.lastUpdated = new Date().toISOString();

  localStorage.setItem(STORAGE_KEYS.ENTITLEMENT_LEDGER, JSON.stringify(ledger));
  notifyStateChange();
}

// ===================== F3: TAMPER-EVIDENT HASH-CHAINED RECEIPT LOG =====================

export function getReceipts(): Receipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECEIPTS_CHAIN);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Append-only guarantee (no updates, no deletions)
export async function appendReceipt(receiptData: {
  shareCodeRef: string;
  policyVersion: string;
  outcome: 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'REVOKED' | 'UNSEALED';
  proofPayload: Record<string, unknown>;
  predicateResult: PredicateResult;
  actorRole?: string;
}): Promise<Receipt> {
  const currentChain = getReceipts();
  // If chain exists, previous hash is the latest receipt's hash. If empty, genesis hash.
  const prevHash = currentChain.length > 0 ? currentChain[0].hash : GENESIS_BLOCK_HASH;

  const id = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const verifiedAt = getJitteredRoundedTimestamp(new Date());
  const proofHash = await computeSHA256(canonicalizeJson(receiptData.proofPayload));

  const baseData: Omit<Receipt, 'hash'> = {
    id,
    shareCodeRef: receiptData.shareCodeRef,
    policyVersion: receiptData.policyVersion,
    verifiedAt,
    outcome: receiptData.outcome,
    proofHash,
    predicateResult: receiptData.predicateResult,
    prevHash,
    actorRole: receiptData.actorRole || 'HR_BENEFITS_VERIFIER'
  };

  const hash = await computeReceiptHash(prevHash, baseData);

  const fullReceipt: Receipt = {
    ...baseData,
    hash
  };

  // Prepend to chain (newest at index 0)
  const updatedChain = [fullReceipt, ...currentChain];
  localStorage.setItem(STORAGE_KEYS.RECEIPTS_CHAIN, JSON.stringify(updatedChain));
  notifyStateChange();
  return fullReceipt;
}

// Compliance CSV Export (Guaranteed Zero Health Fields)
export function exportReceiptsAsCSV(): string {
  const receipts = getReceipts();
  const headers = [
    'Receipt_ID',
    'Share_Code_Ref',
    'Policy_Version',
    'Verified_At_Jittered',
    'Verification_Outcome',
    'Proof_Hash_SHA256',
    'Predicate_Max_Duration',
    'Predicate_Remaining_Entitlement',
    'Predicate_Validity',
    'Predicate_No_Overlap',
    'Prev_Block_Hash',
    'Block_Hash_SHA256',
    'Auditor_Role'
  ];

  const rows = receipts.map(r => [
    r.id,
    r.shareCodeRef,
    r.policyVersion,
    r.verifiedAt,
    r.outcome,
    r.proofHash,
    r.predicateResult.withinPolicyMaxDuration ? 'PASS' : 'FAIL',
    r.predicateResult.withinRemainingEntitlement ? 'PASS' : 'FAIL',
    r.predicateResult.withinCredentialValidity ? 'PASS' : 'FAIL',
    r.predicateResult.noOverlapWithApproved ? 'PASS' : 'FAIL',
    r.prevHash,
    r.hash,
    r.actorRole
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// ===================== F7: DUAL-CONSENT BREAK-GLASS =====================

export function getBreakGlassRequests(): BreakGlassRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BREAK_GLASS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createBreakGlassRequest(
  shareCode: string,
  attestationId: string,
  reason: string,
  grievanceOfficerName: string
): BreakGlassRequest {
  const requests = getBreakGlassRequests();
  const newReq: BreakGlassRequest = {
    id: `bg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    shareCode,
    attestationId,
    reason,
    grievanceOfficerName,
    grievanceOfficerSigned: true,
    grievanceOfficerSignatureTime: new Date().toISOString(),
    employeeSigned: false,
    isUnsealed: false
  };

  const updated = [newReq, ...requests];
  localStorage.setItem(STORAGE_KEYS.BREAK_GLASS, JSON.stringify(updated));
  notifyStateChange();
  return newReq;
}

export async function signBreakGlassByEmployee(requestId: string): Promise<BreakGlassRequest | null> {
  const requests = getBreakGlassRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req) return null;

  req.employeeSigned = true;
  req.employeeSignatureTime = new Date().toISOString();
  req.isUnsealed = true;
  req.unsealedAt = new Date().toISOString();
  // Time-boxed 2 hours access
  req.expiresAt = new Date(Date.now() + 2 * 3600 * 1000).toISOString();

  // Append UNSEALED receipt to the hash chain
  const receipt = await appendReceipt({
    shareCodeRef: req.shareCode,
    policyVersion: VOUCH_POLICY_SPEC.policyVersion,
    outcome: 'UNSEALED',
    proofPayload: {
      action: 'DUAL_CONSENT_BREAK_GLASS_UNSEAL',
      requestId: req.id,
      reason: req.reason,
      grievanceOfficer: req.grievanceOfficerName
    },
    predicateResult: {
      withinPolicyMaxDuration: true,
      withinRemainingEntitlement: true,
      withinCredentialValidity: true,
      noOverlapWithApproved: true
    },
    actorRole: 'DUAL_CONSENT_GRIEVANCE_BOARD'
  });

  req.receiptId = receipt.id;
  localStorage.setItem(STORAGE_KEYS.BREAK_GLASS, JSON.stringify(requests));
  notifyStateChange();
  return req;
}

// ===================== APPROVALS (HR Decision Records) =====================

export function getApprovals(employeeId?: string): ApprovalRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPROVALS);
    const list: ApprovalRecord[] = raw ? JSON.parse(raw) : [];
    if (employeeId) {
      return list.filter(a => !a.employeeId || a.employeeId === employeeId);
    }
    return list;
  } catch {
    return [];
  }
}

export function saveApproval(record: ApprovalRecord): void {
  if (typeof window === 'undefined') return;
  const list = getApprovals();
  const updated = [record, ...list.filter(a => a.approvalId !== record.approvalId)];
  localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(updated));
  notifyStateChange();
}

export function getApprovalById(id: string): ApprovalRecord | undefined {
  return getApprovals().find(a => a.approvalId === id);
}

// ===================== NOTIFICATIONS (Real-Time Notification Flow) =====================

export function getNotifications(employeeId?: string): NotificationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: NotificationItem[] = raw ? JSON.parse(raw) : [];
    if (employeeId) {
      return list.filter(n => !n.employeeId || n.employeeId === employeeId);
    }
    return list;
  } catch {
    return [];
  }
}

export function saveNotification(notif: NotificationItem): void {
  if (typeof window === 'undefined') return;
  const list = getNotifications();
  const updated = [notif, ...list.filter(n => n.id !== notif.id)];
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  notifyStateChange();
}

export function markNotificationRead(id: string): void {
  if (typeof window === 'undefined') return;
  const list = getNotifications();
  const item = list.find(n => n.id === id);
  if (item) {
    item.read = true;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    notifyStateChange();
  }
}

export function markAllNotificationsRead(employeeId?: string): void {
  if (typeof window === 'undefined') return;
  const list = getNotifications();
  list.forEach(n => {
    if (!employeeId || n.employeeId === employeeId) {
      n.read = true;
    }
  });
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  notifyStateChange();
}

// ===================== PERSONAL AUDIT LOG =====================

export function getAuditLogs(attestationId?: string): AuditLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const list: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
    if (attestationId) {
      return list.filter(a => a.attestationId === attestationId);
    }
    return list;
  } catch {
    return [];
  }
}

export function logAuditView(entry: AuditLogEntry): void {
  if (typeof window === 'undefined') return;
  const list = getAuditLogs();
  const updated = [entry, ...list];
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  notifyStateChange();
}

// ===================== PENDING HR QUEUE =====================

export function getPendingQueue(): QueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQueueItem(item: QueueItem): void {
  if (typeof window === 'undefined') return;
  const list = getPendingQueue();
  const updated = [item, ...list.filter(q => q.shareCode !== item.shareCode)];
  localStorage.setItem(STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(updated));
  notifyStateChange();
}

export function updateQueueItemStatus(
  shareCode: string,
  status: QueueItem['status'],
  statusNote?: string
): void {
  if (typeof window === 'undefined') return;
  const list = getPendingQueue();
  const normalized = shareCode.trim().toUpperCase();
  const item = list.find(q => q.shareCode.toUpperCase() === normalized);
  if (item) {
    item.status = status;
    if (statusNote) item.statusNote = statusNote;
    localStorage.setItem(STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(list));
    notifyStateChange();
  }
}

// ===================== ISSUER STORAGE =====================

export function getActiveIssuer(): IssuerIdentity {
  if (typeof window === 'undefined') return TRUSTED_ISSUERS[0];
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_ISSUER_ID);
    const found = TRUSTED_ISSUERS.find(i => i.id === id);
    return found || TRUSTED_ISSUERS[0];
  } catch {
    return TRUSTED_ISSUERS[0];
  }
}

export function setActiveIssuer(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_ISSUER_ID, id);
  notifyStateChange();
}

// ===================== SEED HACKATHON DEMO DATA =====================

export async function seedDemoData(force = false): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!force && localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    return;
  }

  const issuerRefHash1 = await computeIssuerRefHash('GMC-8849201');
  const issuerRefHash2 = await computeIssuerRefHash('GMC-9120448');
  const sarahPseudonym = await computeEmployerPseudonym('EMP-9021');
  const davidPseudonym = await computeEmployerPseudonym('EMP-8834');

  const sampleAttestation1: SignedAttestation = {
    payload: {
      attestationId: 'LG-ATT-7729',
      employeeName: 'Sarah Jenkins',
      employeeId: 'EMP-9021',
      fineCategory: 'pregnancy',
      coarseCategory: 'STATUTORY_MATERNITY',
      categoryLabel: 'Pregnancy & Gestation Care',
      fitForDuty: 'full-rest',
      fitForDutyNotes: 'Total pelvic rest ordered.',
      startDate: '2026-09-16',
      endDate: '2026-10-07',
      expectedReturnDate: '2026-10-08',
      issuerId: 'clinic-summit-wh',
      issuerName: 'Summit Women’s Health & Reproductive Medicine',
      doctorName: 'Dr. Elena Rostova, MD, FACOG',
      issuerRegNumber: 'GMC-8849201',
      issuedAt: '2026-09-15T09:30:00.000Z'
    },
    signatureBase64: 'MEQCID6NfL2eR44sO18pL0Z+yS1b9uKvF87w91d2X7a8c3d9AiB5j8K7l6m5n4o3p2q1r0s9t8u7v6w5x4y3z2a1b0c9d==',
    signatureHex: '304402203e8d7cbd9e478e2c3b5f292d5bf642ad17f3bd3a0c5bdeee7757765fb6bc7c370220798bc0b6e99e67890123456789abcdef0123456789abcdef0123456789abcdef',
    publicKeyJwk: TRUSTED_ISSUERS[0].publicKeyJwk,
    publicKeyHex: TRUSTED_ISSUERS[0].publicKeyHex,
    createdAt: '2026-09-15T09:30:00.000Z'
  };

  const sampleAttestation2: SignedAttestation = {
    payload: {
      attestationId: 'LG-ATT-5412',
      employeeName: 'David Chen',
      employeeId: 'EMP-8834',
      fineCategory: 'surgery',
      coarseCategory: 'STATUTORY_MEDICAL',
      categoryLabel: 'Post-Operative Orthopedic Recovery',
      fitForDuty: 'fit-post-leave',
      fitForDutyNotes: 'Ergonomic sit/stand desk upon return.',
      startDate: '2026-09-11',
      endDate: '2026-10-23',
      expectedReturnDate: '2026-10-24',
      issuerId: 'clinic-st-jude',
      issuerName: 'St. Jude Regional Medical Center',
      doctorName: 'Dr. Aris Thorne, MD, FACS',
      issuerRegNumber: 'GMC-9120448',
      issuedAt: '2026-09-10T14:15:00.000Z'
    },
    signatureBase64: 'MEQCID4kJ0p9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1AiB8s7t6u5v4w3x2y1z0a9b8c7d6e5f4g3h2i1j0k9l8m==',
    signatureHex: '304402204a9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p4q3r2s1t0u9v8w7x6y5z4a3b2c1d0e9f02201a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    publicKeyJwk: TRUSTED_ISSUERS[1].publicKeyJwk,
    publicKeyHex: TRUSTED_ISSUERS[1].publicKeyHex,
    createdAt: '2026-09-10T14:15:00.000Z'
  };

  // FIX 0a & FIX 0b: HR Public payload containing ONLY coarseCategory, boolean issuer, and refHash
  const hrPayload1: HRPublicPayload = {
    attestationId: 'LG-ATT-7729',
    coarseCategory: 'STATUTORY_MATERNITY',
    validFrom: '2026-09-16',
    validTo: '2026-10-07',
    expectedReturnDate: '2026-10-08',
    issuerIsLicensed: true,
    issuerRefHash: issuerRefHash1,
    fitForDuty: 'full-rest',
    fitForDutyAccommodationsPresent: true
  };
  const paddedHrPayload1 = padPayloadToUniformLength(hrPayload1);

  const sampleShareCode1: ShareCode = {
    code: 'LG-7892',
    attestationId: 'LG-ATT-7729',
    signedAttestation: sampleAttestation1,
    policyVersion: 'VOUCH-2026.1',
    policyRuleId: 'maternity-mba-1961',
    hrPayload: paddedHrPayload1,
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    expiresAt: new Date(Date.now() + 3600 * 1000 * 48).toISOString(),
    isRevoked: false,
    viewCount: 1,
    intendedRecipient: 'Acme Corp People & Culture Team',
    paddedByteLength: 1024
  };

  // Entitlement ledger pre-population
  const sampleEntitlement1: EntitlementRecord = {
    employerPseudonym: sarahPseudonym,
    coarseCategory: 'STATUTORY_MATERNITY',
    daysEntitledAnnual: 182,
    daysTakenYTD: 22,
    approvedRanges: [{ start: '2026-09-16', end: '2026-10-07', receiptId: 'rcpt_seed_1' }],
    lastUpdated: new Date().toISOString()
  };

  const sampleEntitlement2: EntitlementRecord = {
    employerPseudonym: davidPseudonym,
    coarseCategory: 'STATUTORY_MEDICAL',
    daysEntitledAnnual: 91,
    daysTakenYTD: 43,
    approvedRanges: [{ start: '2026-09-11', end: '2026-10-23', receiptId: 'rcpt_seed_2' }],
    lastUpdated: new Date().toISOString()
  };

  // Receipt Genesis and Seed
  const proofHash1 = await computeSHA256(canonicalizeJson(paddedHrPayload1));
  const receiptData1: Omit<Receipt, 'hash'> = {
    id: 'rcpt_seed_1',
    shareCodeRef: 'LG-7892',
    policyVersion: 'VOUCH-2026.1',
    verifiedAt: getJitteredRoundedTimestamp(new Date()),
    outcome: 'APPROVED',
    proofHash: proofHash1,
    predicateResult: {
      withinPolicyMaxDuration: true,
      withinRemainingEntitlement: true,
      withinCredentialValidity: true,
      noOverlapWithApproved: true
    },
    prevHash: GENESIS_BLOCK_HASH,
    actorRole: 'HR_BENEFITS_VERIFIER'
  };
  const receiptHash1 = await computeReceiptHash(GENESIS_BLOCK_HASH, receiptData1);
  const sampleReceipt1: Receipt = { ...receiptData1, hash: receiptHash1 };

  // Sample Approvals
  const sampleApproval1: ApprovalRecord = {
    approvalId: 'APR-2026-004521',
    shareCode: 'LG-7892',
    employeeId: 'EMP-9021',
    employeeName: 'Sarah Jenkins',
    approvalDecision: 'APPROVED',
    approvedBy: 'alice@acmecorp.com',
    approvedAt: '2026-09-16T10:30:00.000Z',
    category: 'STATUTORY_MATERNITY',
    validFrom: '2026-09-16',
    validTo: '2026-10-07',
    status: 'ACTIVE',
    receiptId: 'rcpt_seed_1',
    comment: 'Statutory 3-week block verified against MBA-1961'
  };

  const sampleApproval2: ApprovalRecord = {
    approvalId: 'APR-2026-004110',
    shareCode: 'VC-26MED-3341',
    employeeId: 'EMP-9021',
    employeeName: 'Sarah Jenkins',
    approvalDecision: 'APPROVED',
    approvedBy: 'alice@acmecorp.com',
    approvedAt: '2026-08-02T09:15:00.000Z',
    category: 'STATUTORY_MEDICAL',
    validFrom: '2026-08-02',
    validTo: '2026-08-09',
    status: 'ACTIVE',
    receiptId: 'rcpt_seed_2',
    comment: 'Post-viral recovery leave certified by licensed practitioner'
  };

  // Sample Notifications
  const sampleNotif1: NotificationItem = {
    id: 'notif_seed_001',
    type: 'LEAVE_APPROVED',
    employeeId: 'EMP-9021',
    approvalId: 'APR-2026-004521',
    category: 'STATUTORY_MATERNITY',
    validFrom: '2026-09-16',
    validTo: '2026-10-07',
    approvedBy: 'alice@acmecorp.com',
    createdAt: '2026-09-16T10:30:00.000Z',
    read: false,
    title: '✓ Leave approved!',
    message: 'Your maternity leave request (Sep 16 – Oct 07) has been approved by HR.'
  };

  const sampleNotif2: NotificationItem = {
    id: 'notif_seed_002',
    type: 'LEAVE_APPROVED',
    employeeId: 'EMP-9021',
    approvalId: 'APR-2026-004110',
    category: 'STATUTORY_MEDICAL',
    validFrom: '2026-08-02',
    validTo: '2026-08-09',
    approvedBy: 'alice@acmecorp.com',
    createdAt: '2026-08-02T09:15:00.000Z',
    read: true,
    title: '✓ Leave approved!',
    message: 'Your medical leave request (Aug 02 – Aug 09) has been approved by HR.'
  };

  // Sample Pending HR Queue
  const sampleQueue: QueueItem[] = [
    {
      id: 'q_001',
      employeeName: 'S. Jenkins',
      employeeId: 'EMP-9021',
      category: 'STATUTORY_MATERNITY',
      shareCode: 'LG-7892',
      submissionTime: 'Sep 16, 10:00 UTC',
      status: 'VERIFIED',
      statusNote: '✓ Ready to approve'
    },
    {
      id: 'q_002',
      employeeName: 'M. Patel',
      employeeId: 'EMP-8834',
      category: 'STATUTORY_MEDICAL',
      shareCode: 'LG-3341',
      submissionTime: 'Sep 15, 14:22 UTC',
      status: 'WAITING',
      statusNote: 'Awaiting HR verification'
    },
    {
      id: 'q_003',
      employeeName: 'R. Kumar',
      employeeId: 'EMP-7712',
      category: 'CAREGIVING',
      shareCode: 'LG-5520',
      submissionTime: 'Sep 14, 09:00 UTC',
      status: 'APPROVED',
      statusNote: '✓ Complete'
    }
  ];

  // Sample Audit Logs
  const sampleAuditLogs: AuditLogEntry[] = [
    {
      id: 'audit_001',
      attestationId: 'LG-ATT-7729',
      shareCode: 'LG-7892',
      viewerEmail: 'alice@acmecorp.com',
      viewedAt: '2026-09-16T10:30:00.000Z',
      outcome: 'APPROVED'
    },
    {
      id: 'audit_002',
      attestationId: 'LG-ATT-7729',
      shareCode: 'LG-7892',
      viewerEmail: 'alice@acmecorp.com',
      viewedAt: '2026-09-16T10:00:15.000Z',
      outcome: 'VERIFIED'
    }
  ];

  localStorage.setItem(STORAGE_KEYS.ATTESTATIONS, JSON.stringify([sampleAttestation1, sampleAttestation2]));
  localStorage.setItem(STORAGE_KEYS.SHARE_CODES, JSON.stringify([sampleShareCode1]));
  localStorage.setItem(STORAGE_KEYS.ENTITLEMENT_LEDGER, JSON.stringify([sampleEntitlement1, sampleEntitlement2]));
  localStorage.setItem(STORAGE_KEYS.RECEIPTS_CHAIN, JSON.stringify([sampleReceipt1]));
  localStorage.setItem(STORAGE_KEYS.BREAK_GLASS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify([sampleApproval1, sampleApproval2]));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([sampleNotif1, sampleNotif2]));
  localStorage.setItem(STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(sampleQueue));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(sampleAuditLogs));

  // Seed sample local medical record for Sarah Jenkins (stays in clinic browser only)
  const sampleClinicDoc: MedicalDocument = {
    id: 'doc_demo_7729',
    attestationId: sampleAttestation1.payload.attestationId,
    fileName: 'maternity-ultrasound-report.pdf',
    fileType: 'application/pdf',
    fileSize: 245760,
    base64Data: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAFjYGBgYGJg',
    uploadedAt: new Date(Date.now() - 3600 * 1000 * 24 * 3).toISOString(),
    notes: 'Pelvic scan confirming gestational age and statutory maternity leave rest requirement.'
  };
  localStorage.setItem(STORAGE_KEYS.CLINIC_DOCUMENTS, JSON.stringify({ [sampleAttestation1.payload.attestationId]: sampleClinicDoc }));
  localStorage.setItem(`medical_doc_for_attestation_${sampleAttestation1.payload.attestationId}`, JSON.stringify(sampleClinicDoc));

  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  notifyStateChange();
}

export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ATTESTATIONS);
  localStorage.removeItem(STORAGE_KEYS.SHARE_CODES);
  localStorage.removeItem(STORAGE_KEYS.ENTITLEMENT_LEDGER);
  localStorage.removeItem(STORAGE_KEYS.RECEIPTS_CHAIN);
  localStorage.removeItem(STORAGE_KEYS.BREAK_GLASS);
  localStorage.removeItem(STORAGE_KEYS.APPROVALS);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  localStorage.removeItem(STORAGE_KEYS.PENDING_QUEUE);
  localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  localStorage.removeItem(STORAGE_KEYS.CLINIC_DOCUMENTS);
  localStorage.removeItem(STORAGE_KEYS.CLINIC_PROFILE);
  localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
  seedDemoData(true);
}

export const resetDemoData = resetAllData;

export async function createShareCode(
  attestation: SignedAttestation,
  policyRuleId = 'maternity-mba-1961',
  expiryHours = 24
): Promise<ShareCode> {
  const code = `VC-26WMAT-${Math.floor(1000 + Math.random() * 9000)}`;
  const expiresAt = new Date(Date.now() + expiryHours * 3600 * 1000).toISOString();
  const issuerRefHash = await computeIssuerRefHash(attestation.payload.issuerRegNumber);

  const hrPayload: HRPublicPayload = {
    attestationId: attestation.payload.attestationId,
    coarseCategory: attestation.payload.coarseCategory,
    validFrom: attestation.payload.startDate,
    validTo: attestation.payload.endDate,
    expectedReturnDate: attestation.payload.expectedReturnDate,
    fitForDuty: attestation.payload.fitForDuty,
    fitForDutyAccommodationsPresent: Boolean(attestation.payload.fitForDutyNotes && attestation.payload.fitForDutyNotes.length > 0),
    issuerIsLicensed: true,
    issuerRefHash,
  };

  const paddedHrPayload = padPayloadToUniformLength(hrPayload);

  const shareCode: ShareCode = {
    code,
    attestationId: attestation.payload.attestationId,
    signedAttestation: attestation,
    policyVersion: VOUCH_POLICY_SPEC.policyVersion,
    policyRuleId,
    hrPayload: paddedHrPayload,
    createdAt: new Date().toISOString(),
    expiresAt,
    viewCount: 0,
    isRevoked: false,
    paddedByteLength: 512,
    employeeId: attestation.payload.employeeId || 'EMP-9021',
    approvalStatus: 'WAITING'
  };

  saveShareCode(shareCode);

  // Automatically enqueue in HR pending queue for seamless live demo
  saveQueueItem({
    id: `q_${Date.now()}`,
    employeeName: attestation.payload.employeeName || 'Sarah Jenkins',
    employeeId: attestation.payload.employeeId || 'EMP-9021',
    category: attestation.payload.coarseCategory,
    shareCode: code,
    submissionTime: 'Just now',
    status: 'WAITING',
    statusNote: 'Awaiting HR verification'
  });

  return shareCode;
}

export async function approveLeaveRequest(params: {
  shareCode: string;
  employeeId: string;
  employeeName?: string;
  category: CoarseCategory;
  validFrom: string;
  validTo: string;
  approvalDecision: 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  comment?: string;
}): Promise<{ approval: ApprovalRecord; notification: NotificationItem; receipt: Receipt }> {
  const approvalId = `APR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const approvedAt = new Date().toISOString();
  const approvedBy = params.approvedBy || 'alice@acmecorp.com';

  // 1. Append Receipt (Tamper-evident append-only chain)
  const receipt = await appendReceipt({
    shareCodeRef: params.shareCode,
    policyVersion: VOUCH_POLICY_SPEC.policyVersion,
    outcome: params.approvalDecision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
    proofPayload: {
      action: params.approvalDecision === 'APPROVED' ? 'LEAVE_APPROVAL' : 'LEAVE_REJECTION',
      approvalId,
      shareCode: params.shareCode,
      category: params.category,
      validFrom: params.validFrom,
      validTo: params.validTo,
      comment: params.comment || ''
    },
    predicateResult: {
      withinPolicyMaxDuration: true,
      withinRemainingEntitlement: true,
      withinCredentialValidity: true,
      noOverlapWithApproved: true
    },
    actorRole: 'HR_BENEFITS_VERIFIER'
  });

  // 2. Save Approval Record
  const approval: ApprovalRecord = {
    approvalId,
    shareCode: params.shareCode,
    employeeId: params.employeeId,
    employeeName: params.employeeName || 'Sarah Jenkins',
    approvalDecision: params.approvalDecision,
    approvedBy,
    approvedAt,
    category: params.category,
    validFrom: params.validFrom,
    validTo: params.validTo,
    status: 'ACTIVE',
    receiptId: receipt.id,
    comment: params.comment
  };
  saveApproval(approval);

  // 3. Update Share Code Status
  const shares = getShareCodes();
  const share = shares.find(s => s.code.toUpperCase() === params.shareCode.toUpperCase());
  if (share) {
    share.approvalStatus = params.approvalDecision;
    saveShareCode(share);
  }

  // 4. Update Queue Item
  updateQueueItemStatus(
    params.shareCode,
    params.approvalDecision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
    params.approvalDecision === 'APPROVED' ? '✓ Complete' : '✗ Request Denied'
  );

  // 5. Create Real-Time Notification for Employee
  const categoryTitle = params.category === 'STATUTORY_MATERNITY' 
    ? 'maternity leave' 
    : params.category === 'STATUTORY_MEDICAL' 
    ? 'medical leave' 
    : 'caregiving leave';

  const notification: NotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: params.approvalDecision === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
    employeeId: params.employeeId,
    approvalId,
    category: params.category,
    validFrom: params.validFrom,
    validTo: params.validTo,
    approvedBy,
    createdAt: approvedAt,
    read: false,
    title: params.approvalDecision === 'APPROVED' ? '✓ Leave approved!' : '✗ Leave request rejected',
    message: params.approvalDecision === 'APPROVED'
      ? `Your ${categoryTitle} request (${params.validFrom} – ${params.validTo}) has been approved by HR.`
      : `Your ${categoryTitle} request (${params.validFrom} – ${params.validTo}) was not approved.`
  };
  saveNotification(notification);

  // 6. Log Personal Audit View
  if (share) {
    logAuditView({
      id: `audit_${Date.now()}`,
      attestationId: share.attestationId,
      shareCode: params.shareCode,
      viewerEmail: approvedBy,
      viewedAt: approvedAt,
      outcome: params.approvalDecision === 'APPROVED' ? 'APPROVED' : 'REJECTED'
    });
  }

  return { approval, notification, receipt };
}

// ===================== CLINIC SETUP & MEDICAL DOCUMENTS (LOCAL-ONLY) =====================

export const DEFAULT_CLINIC_PROFILE: ClinicProfile = {
  doctorName: 'Dr. Elena Rostova',
  clinicName: "Summit Women's Health Center",
  regNumber: 'GMC-6849201',
  email: 'dr.elena@summit-health.com',
  isSetup: false
};

export function getClinicProfile(): ClinicProfile {
  if (typeof window === 'undefined') return DEFAULT_CLINIC_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLINIC_PROFILE);
    if (!raw) return DEFAULT_CLINIC_PROFILE;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CLINIC_PROFILE;
  }
}

export function saveClinicProfile(profile: ClinicProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CLINIC_PROFILE, JSON.stringify(profile));
  notifyStateChange();
}

export function resetClinicProfile(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CLINIC_PROFILE, JSON.stringify(DEFAULT_CLINIC_PROFILE));
  notifyStateChange();
}

export function getClinicDocuments(): Record<string, MedicalDocument> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLINIC_DOCUMENTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getClinicDocument(attestationId: string): MedicalDocument | null {
  if (typeof window === 'undefined') return null;
  try {
    // Check specific direct key first as per spec
    const direct = localStorage.getItem(`medical_doc_for_attestation_${attestationId}`);
    if (direct) return JSON.parse(direct);

    // Fallback to map
    const map = getClinicDocuments();
    return map[attestationId] || null;
  } catch {
    return null;
  }
}

export function saveClinicDocument(doc: MedicalDocument): void {
  if (typeof window === 'undefined') return;
  const map = getClinicDocuments();
  map[doc.attestationId] = doc;
  localStorage.setItem(STORAGE_KEYS.CLINIC_DOCUMENTS, JSON.stringify(map));
  // Store direct keys for spec compliance
  localStorage.setItem(`medical_doc_${doc.id}`, JSON.stringify(doc));
  localStorage.setItem(`medical_doc_for_attestation_${doc.attestationId}`, JSON.stringify(doc));
  notifyStateChange();
}

export function deleteClinicDocument(attestationId: string): boolean {
  if (typeof window === 'undefined') return false;
  const map = getClinicDocuments();
  const existing = map[attestationId];
  if (existing) {
    delete map[attestationId];
    localStorage.setItem(STORAGE_KEYS.CLINIC_DOCUMENTS, JSON.stringify(map));
    localStorage.removeItem(`medical_doc_${existing.id}`);
    localStorage.removeItem(`medical_doc_for_attestation_${attestationId}`);
    notifyStateChange();
    return true;
  }
  localStorage.removeItem(`medical_doc_for_attestation_${attestationId}`);
  notifyStateChange();
  return false;
}

