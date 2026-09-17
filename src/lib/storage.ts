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
  HRPublicPayload
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

  localStorage.setItem(STORAGE_KEYS.ATTESTATIONS, JSON.stringify([sampleAttestation1, sampleAttestation2]));
  localStorage.setItem(STORAGE_KEYS.SHARE_CODES, JSON.stringify([sampleShareCode1]));
  localStorage.setItem(STORAGE_KEYS.ENTITLEMENT_LEDGER, JSON.stringify([sampleEntitlement1, sampleEntitlement2]));
  localStorage.setItem(STORAGE_KEYS.RECEIPTS_CHAIN, JSON.stringify([sampleReceipt1]));
  localStorage.setItem(STORAGE_KEYS.BREAK_GLASS, JSON.stringify([]));
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
    paddedByteLength: 512
  };

  saveShareCode(shareCode);
  return shareCode;
}
