// Fine-grained clinical categories (retained in the employee wallet only; never shared with HR)
export type FineCategory = 
  | 'pregnancy' 
  | 'mental-health' 
  | 'surgery' 
  | 'general-medical' 
  | 'bereavement' 
  | 'menstrual'
  | 'other';

// FIX 0b: Public coarse category enum crossing the trust boundary to HR
export type CoarseCategory =
  | 'STATUTORY_MATERNITY'
  | 'STATUTORY_MEDICAL'
  | 'CAREGIVING'
  | 'SELF_DECLARED';

// Legacy alias for backwards compatibility in UI helpers
export type LeaveCategory = FineCategory;

export type FitForDutyStatus = 
  | 'full-rest' // Totally unfit for duty during leave
  | 'partial-remote' // Fit for modified/remote duty only
  | 'fit-post-leave'; // Unfit now, confirmed fit to resume on return date

export interface IssuerIdentity {
  id: string; // e.g. 'clinic-summit-wh'
  name: string; // e.g. 'Summit Women’s Health & Fertility'
  doctorName: string; // e.g. 'Dr. Elena Rostova, MD'
  regNumber: string; // e.g. 'GMC-8849201'
  specialty: string;
  publicKeyJwk: JsonWebKey;
  publicKeyHex: string;
  isRegistered: boolean;
  location?: string;
}

// Minimal Attestation signed by clinician (Doctor & Wallet level)
export interface AttestationPayload {
  attestationId: string;
  employeeName: string;
  employeeId?: string;
  // Non-disclosed fine category for the employee's personal wallet
  fineCategory: FineCategory;
  // Coarse category for policy matching
  coarseCategory: CoarseCategory;
  categoryLabel?: string;
  fitForDuty: FitForDutyStatus;
  fitForDutyNotes?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  expectedReturnDate: string; // YYYY-MM-DD
  // Issuer details (Wallet level)
  issuerId: string;
  issuerName: string;
  doctorName: string;
  issuerRegNumber: string;
  issuedAt: string; // ISO String
}

export interface SignedAttestation {
  payload: AttestationPayload;
  signatureBase64: string;
  signatureHex: string;
  publicKeyJwk: JsonWebKey;
  publicKeyHex: string;
  createdAt: string;
  isRevokedByIssuer?: boolean;
  revokedAt?: string;
}

// FIX 0a: HR-Visible Minimal Disclosed Payload (Zero Clinic Names, Zero Diagnosis Strings)
export interface HRPublicPayload {
  attestationId: string;
  coarseCategory: CoarseCategory;
  validFrom: string; // YYYY-MM-DD
  validTo: string; // YYYY-MM-DD
  expectedReturnDate: string;
  // FIX 0a: Replaces issuer name & regNo
  issuerIsLicensed: boolean; // boolean registry check result only
  issuerRefHash: string; // sha256(regNo + salt) for dispute/revocation checks, opaque to HR
  fitForDuty: FitForDutyStatus;
  fitForDutyAccommodationsPresent: boolean;
  // F4: Padding to enforce uniform byte length
  _padding?: string;
}

// F1: Predicate Result (HR sees 4 booleans only; counters rendered in employee wallet only)
export interface PredicateResult {
  withinPolicyMaxDuration: boolean;
  withinRemainingEntitlement: boolean;
  withinCredentialValidity: boolean;
  noOverlapWithApproved: boolean;
}

export interface EntitlementRecord {
  employerPseudonym: string; // hash(employeeId + employerSalt)
  coarseCategory: CoarseCategory;
  daysEntitledAnnual: number;
  daysTakenYTD: number;
  approvedRanges: Array<{ start: string; end: string; receiptId: string }>;
  lastUpdated: string;
}

export interface ShareCode {
  code: string; // e.g. "LG-7892"
  attestationId: string;
  signedAttestation: SignedAttestation;
  // F5: Policy rule governing this share
  policyVersion: string;
  policyRuleId: string;
  // Sanitized payload crossing to HR
  hrPayload: HRPublicPayload;
  createdAt: string;
  expiresAt: string;
  isRevoked: boolean;
  viewCount: number;
  intendedRecipient?: string;
  // F4: Uniform padded length metadata
  paddedByteLength: number;
}

// F3: Tamper-Evident Hash-Chained Receipt Log
export interface Receipt {
  id: string;
  shareCodeRef: string;
  policyVersion: string;
  verifiedAt: string; // rounded to date + jittered (F4)
  outcome: 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'REVOKED' | 'UNSEALED';
  proofHash: string; // SHA-256 of the HR-visible payload
  predicateResult: PredicateResult;
  prevHash: string; // Hash of previous receipt (GENESIS_BLOCK_HASH for first)
  hash: string; // sha256(prevHash + canonicalJSON(receiptData))
  actorRole: string; // e.g. "HR_BENEFITS_VERIFIER" or "GRIEVANCE_OFFICER"
}

// F5: Policy Compiler Rule Spec
export interface PolicyRule {
  id: string;
  source: string;
  coarseCategory: CoarseCategory;
  maxDays: number;
  requiresCredential: boolean;
  requiredClaims: string[];
  forbiddenClaims: string[];
  description: string;
}

export interface PolicySpec {
  policyVersion: string;
  rules: PolicyRule[];
}

// F7: Dual-Consent Break-Glass Unseal
export interface BreakGlassRequest {
  id: string;
  shareCode: string;
  attestationId: string;
  reason: string;
  grievanceOfficerName: string;
  grievanceOfficerSigned: boolean;
  grievanceOfficerSignatureTime?: string;
  employeeSigned: boolean;
  employeeSignatureTime?: string;
  isUnsealed: boolean;
  unsealedAt?: string;
  expiresAt?: string; // e.g. 2 hours after unsealing
  receiptId?: string;
}

export interface RedactionEntity {
  id: string;
  text: string;
  type: 'diagnosis' | 'medication' | 'lab_value' | 'icd_code' | 'personal_vitals' | 'procedure';
  reason: string;
  startIndex: number;
  endIndex: number;
}
