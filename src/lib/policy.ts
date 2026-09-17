import { PolicySpec, PolicyRule, CoarseCategory, FineCategory } from './types';

export const VOUCH_POLICY_SPEC: PolicySpec = {
  policyVersion: 'VOUCH-2026.1',
  rules: [
    {
      id: 'maternity-mba-1961',
      source: 'Maternity Benefit Act 1961 (amended 2017)',
      coarseCategory: 'STATUTORY_MATERNITY',
      maxDays: 182, // 26 weeks statutory maximum
      requiresCredential: true,
      requiredClaims: ['issuerIsLicensed', 'coarseCategory', 'validFrom', 'validTo'],
      forbiddenClaims: ['fineCategory', 'issuerName', 'regNo', 'doctorName', 'diagnosis', 'clinicName', 'medicalNotes'],
      description: 'Covers pre and post-natal maternity leave under statutory entitlement. Prohibits disclosure of gestation age, IVF status, or clinical notes.'
    },
    {
      id: 'statutory-medical-esi',
      source: 'Employees\' State Insurance Act (Section 46/49) & Model Standing Orders',
      coarseCategory: 'STATUTORY_MEDICAL',
      maxDays: 91, // Standard statutory sickness duration limit
      requiresCredential: true,
      requiredClaims: ['issuerIsLicensed', 'coarseCategory', 'validFrom', 'validTo'],
      forbiddenClaims: ['fineCategory', 'issuerName', 'regNo', 'doctorName', 'diagnosis', 'clinicName', 'medicalNotes', 'prescription'],
      description: 'Covers medical, post-surgical, or psychological leave. Prevents workplace discrimination by masking psychiatric, oncology, or surgical details.'
    },
    {
      id: 'caregiving-framework',
      source: 'Family & Dependent Caregiving Framework',
      coarseCategory: 'CAREGIVING',
      maxDays: 30,
      requiresCredential: true,
      requiredClaims: ['issuerIsLicensed', 'coarseCategory', 'validFrom', 'validTo'],
      forbiddenClaims: ['fineCategory', 'issuerName', 'regNo', 'doctorName', 'diagnosis', 'clinicName', 'medicalNotes'],
      description: 'Covers care for dependent family members under certified medical necessity with zero family health records disclosed.'
    },
    {
      id: 'menstrual-self-declared',
      source: 'State & Workplace Policy — Deliberate Self-Declaration Standard',
      coarseCategory: 'SELF_DECLARED',
      maxDays: 1, // 1 day per month (or 12 annually)
      requiresCredential: false, // ZERO clinician certificate required
      requiredClaims: ['coarseCategory', 'validFrom', 'validTo'],
      forbiddenClaims: ['fineCategory', 'issuerName', 'regNo', 'doctorName', 'diagnosis', 'clinicName', 'medicalNotes', 'doctorSignature'],
      description: 'Deliberately bypasses medical certificate requirements to prevent reproductive surveillance and doctor fees for recurring menstrual rest.'
    }
  ]
};

// Map fine category (doctor/wallet level) to statutory coarse category (HR level)
export function mapFineToCoarseCategory(fine: FineCategory): CoarseCategory {
  switch (fine) {
    case 'pregnancy':
      return 'STATUTORY_MATERNITY';
    case 'mental-health':
    case 'surgery':
    case 'general-medical':
    case 'other':
      return 'STATUTORY_MEDICAL';
    case 'bereavement':
      return 'CAREGIVING';
    case 'menstrual':
      return 'SELF_DECLARED';
    default:
      return 'STATUTORY_MEDICAL';
  }
}

export function getRuleByCoarseCategory(category: CoarseCategory): PolicyRule {
  const rule = VOUCH_POLICY_SPEC.rules.find(r => r.coarseCategory === category);
  return rule || VOUCH_POLICY_SPEC.rules[1];
}

export function getRuleById(ruleId: string): PolicyRule {
  const rule = VOUCH_POLICY_SPEC.rules.find(r => r.id === ruleId);
  return rule || VOUCH_POLICY_SPEC.rules[1];
}

export class PolicyEnforcementError extends Error {
  constructor(message: string, public forbiddenKeysFound: string[] = []) {
    super(message);
    this.name = 'PolicyEnforcementError';
  }
}

/**
 * F5 Runtime Enforcement:
 * Validates that an HR-destined payload contains all required claims
 * and STRICTLY REJECTS if any forbidden claim key is present.
 */
export function validateAndEnforcePolicy(
  payload: Record<string, unknown>,
  rule: PolicyRule
): { isValid: boolean; error?: string } {
  // 1. Check for forbidden claims (STRICT RUNTIME PROHIBITION)
  const forbiddenKeysFound = rule.forbiddenClaims.filter(key => {
    return Object.prototype.hasOwnProperty.call(payload, key) && payload[key] !== undefined;
  });

  if (forbiddenKeysFound.length > 0) {
    throw new PolicyEnforcementError(
      `Protocol Violation under policy ${VOUCH_POLICY_SPEC.policyVersion} (${rule.id}): Payload contains forbidden sensitive claims: [${forbiddenKeysFound.join(', ')}]. Minimal disclosure requires these fields to remain in the wallet.`,
      forbiddenKeysFound
    );
  }

  // 2. Check for required claims
  const missingClaims = rule.requiredClaims.filter(key => {
    return !Object.prototype.hasOwnProperty.call(payload, key) || payload[key] === undefined;
  });

  if (missingClaims.length > 0) {
    throw new PolicyEnforcementError(
      `Protocol Violation under policy ${VOUCH_POLICY_SPEC.policyVersion} (${rule.id}): Payload is missing required minimal claim: [${missingClaims.join(', ')}].`
    );
  }

  return { isValid: true };
}
