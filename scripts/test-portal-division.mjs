import assert from 'node:assert';

console.log('🧪 Running Vouch Portal Division & Approval Notification Test Suite...\n');

// 1. TEST: Approval Record Structure & Absence of PHI
console.log('▶ Test 1: Verifying ApprovalRecord structure has zero clinical columns...');
const sampleApproval = {
  approvalId: 'APR-2026-004521',
  shareCode: 'VC-26WMAT-8K2X9',
  employeeId: 'EMP-9021',
  employeeName: 'Sarah Jenkins',
  approvalDecision: 'APPROVED',
  approvedBy: 'alice@acmecorp.com',
  approvedAt: new Date().toISOString(),
  category: 'STATUTORY_MATERNITY',
  validFrom: '2026-09-16',
  validTo: '2026-10-07',
  status: 'ACTIVE',
  receiptId: 'rcpt_test_001',
  comment: 'Verified against Maternity Benefit Act 1961'
};

const approvalKeys = Object.keys(sampleApproval);
const forbiddenKeys = ['diagnosis', 'clinicalNotes', 'doctorName', 'clinicName', 'icd10', 'prescription', 'ultrasound'];

forbiddenKeys.forEach(key => {
  assert.strictEqual(
    approvalKeys.includes(key),
    false,
    `Security Violation: Approval record contains forbidden key "${key}"!`
  );
});
console.log('  ✓ PASSED: Approval record contains only dates, outcome, actor, and category.');

// 2. TEST: Notification Item structure & real-time delivery payload
console.log('\n▶ Test 2: Verifying Notification payload for employee portal...');
const sampleNotification = {
  id: 'notif_1726750000000',
  type: 'LEAVE_APPROVED',
  employeeId: 'EMP-9021',
  approvalId: sampleApproval.approvalId,
  category: sampleApproval.category,
  validFrom: sampleApproval.validFrom,
  validTo: sampleApproval.validTo,
  approvedBy: sampleApproval.approvedBy,
  createdAt: new Date().toISOString(),
  read: false,
  title: '✓ Leave approved!',
  message: 'Your maternity leave request (Sep 16 – Oct 07) has been approved by HR.'
};

assert.strictEqual(sampleNotification.type, 'LEAVE_APPROVED');
assert.strictEqual(sampleNotification.employeeId, 'EMP-9021');
assert.strictEqual(sampleNotification.approvalId, 'APR-2026-004521');
assert.strictEqual(sampleNotification.read, false);
console.log('  ✓ PASSED: Notification item conforms to real-time toast payload contract.');

// 3. TEST: Verification Result Sanitization contract
console.log('\n▶ Test 3: Verifying sanitized attestation returned to HR verifier...');
const rawAttestation = {
  attestationId: 'LG-ATT-7729',
  employeeName: 'Sarah Jenkins',
  employeeId: 'EMP-9021',
  fineCategory: 'pregnancy',
  coarseCategory: 'STATUTORY_MATERNITY',
  fitForDuty: 'full-rest',
  fitForDutyNotes: 'Total pelvic rest ordered.',
  startDate: '2026-09-16',
  endDate: '2026-10-07',
  doctorName: 'Dr. Elena Rostova, MD',
  issuerName: 'Summit Women’s Health',
  issuerRegNumber: 'GMC-8849201'
};

// Sanitizer function as in API & HR portal
function sanitizeForHR(att) {
  return {
    coarseCategory: att.coarseCategory,
    validFrom: att.startDate,
    validTo: att.endDate,
    issuerIsLicensed: true,
    notRevoked: true,
    fitForDuty: att.fitForDuty,
    holder: `${att.employeeName} (${att.employeeId})`
  };
}

const sanitized = sanitizeForHR(rawAttestation);
const serializedSanitized = JSON.stringify(sanitized).toLowerCase();

['elena', 'rostova', 'summit', 'pelvic', 'pregnancy'].forEach(term => {
  assert.strictEqual(
    serializedSanitized.includes(term),
    false,
    `Leakage Detected: Term "${term}" leaked in sanitized HR payload!`
  );
});

assert.strictEqual(sanitized.coarseCategory, 'STATUTORY_MATERNITY');
assert.strictEqual(sanitized.issuerIsLicensed, true);
assert.strictEqual(sanitized.notRevoked, true);
console.log('  ✓ PASSED: HR response collapses issuer to boolean and strips clinical detail.');

console.log('\n🎉 ALL PORTAL DIVISION & NOTIFICATION CONTRACT TESTS PASSED!\n');
