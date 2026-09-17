export type PolicyRule = {
  id: string;
  source: string;
  maxDays: number;
  requiresCredential: boolean;
  requiredClaims: string[];
  forbiddenClaims: string[];
};

export const POLICIES: Record<string, PolicyRule> = {
  'maternity-mba-1961': {
    id: 'maternity-mba-1961',
    source: 'Maternity Benefit Act 1961',
    maxDays: 182,
    requiresCredential: true,
    requiredClaims: ['issuerIsLicensed', 'coarseCategory', 'validFrom', 'validTo'],
    forbiddenClaims: ['issuerName', 'regNo', 'doctorName', 'diagnosis', 'fineCategory', 'clinicName', 'medicalNotes'],
  },
  'statutory-medical-esi': {
    id: 'statutory-medical-esi',
    source: 'Employees\' State Insurance Act & Model Standing Orders',
    maxDays: 91,
    requiresCredential: true,
    requiredClaims: ['issuerIsLicensed', 'coarseCategory', 'validFrom', 'validTo'],
    forbiddenClaims: ['issuerName', 'regNo', 'doctorName', 'diagnosis', 'fineCategory', 'clinicName', 'medicalNotes', 'prescription'],
  },
  'caregiving-framework': {
    id: 'caregiving-framework',
    source: 'Family & Dependent Caregiving Framework',
    maxDays: 30,
    requiresCredential: true,
    requiredClaims: ['issuerIsLicensed', 'coarseCategory', 'validFrom', 'validTo'],
    forbiddenClaims: ['issuerName', 'regNo', 'doctorName', 'diagnosis', 'fineCategory', 'clinicName', 'medicalNotes'],
  },
  'menstrual-self-declared': {
    id: 'menstrual-self-declared',
    source: 'State/employer policy',
    maxDays: 1,
    requiresCredential: false,
    requiredClaims: [],
    forbiddenClaims: ['issuerName', 'regNo', 'doctorName', 'diagnosis', 'fineCategory', 'medicalNotes', 'doctorSignature'],
  },
};

export function validateAttestation(
  attestation: Record<string, any>,
  policyId: string
): { valid: boolean; violations: string[] } {
  const policy = POLICIES[policyId];
  if (!policy) {
    return { valid: false, violations: [`Policy not found: ${policyId}`] };
  }

  const violations: string[] = [];

  // Check required claims are present
  policy.requiredClaims.forEach((claim) => {
    if (attestation[claim] === undefined || attestation[claim] === null || attestation[claim] === '') {
      violations.push(`Missing required claim: ${claim}`);
    }
  });

  // Check forbidden claims are absent
  policy.forbiddenClaims.forEach((claim) => {
    if (claim in attestation && attestation[claim] !== undefined && attestation[claim] !== null) {
      violations.push(`Forbidden claim present: ${claim}`);
    }
  });

  // Check duration limit
  const startDateStr = attestation.validFrom || attestation.startDate;
  const endDateStr = attestation.validTo || attestation.endDate;

  if (startDateStr && endDateStr) {
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr).getTime();
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));

    if (days > policy.maxDays) {
      violations.push(
        `Duration ${days} days exceeds policy maximum of ${policy.maxDays} days`
      );
    }
  }

  return { valid: violations.length === 0, violations };
}
