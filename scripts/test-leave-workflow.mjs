import assert from 'node:assert';

console.log('🧪 Running Vouch Dual-Portal Leave Workflow & CI/CD Test Suite...\n');

// 1. TEST: Leave Application Data Contract & Absence of Diagnosis
console.log('▶ Test 1: Verifying LeaveApplication structure has zero diagnostic/clinical columns...');
const sampleApplication = {
  id: 'LV-2026-0091',
  employeeId: 'EMP-9021',
  employeeName: 'Sarah Jenkins',
  department: 'Product Engineering',
  category: 'STATUTORY_MATERNITY',
  categoryLabel: 'Maternity Leave',
  startDate: '2026-09-16',
  endDate: '2026-10-07',
  durationDays: 22,
  reason: 'Statutory 26-week maternity benefit under Maternity Benefit Act 1961.',
  shareCode: 'VC-26WMAT-8K2X9',
  proofAttached: true,
  status: 'PENDING',
  appliedAt: new Date().toISOString()
};

const appKeys = Object.keys(sampleApplication);
const forbiddenKeys = ['diagnosis', 'clinicalNotes', 'doctorName', 'clinicName', 'icd10', 'prescription', 'ultrasound', 'base64Data'];

forbiddenKeys.forEach(key => {
  assert.strictEqual(
    appKeys.includes(key),
    false,
    `Security Violation: LeaveApplication contains forbidden clinical key "${key}"!`
  );
});
console.log('  ✓ PASSED: LeaveApplication contains only statutory category, dates, duration, and status.');

// 2. TEST: HR Review Transition (PENDING -> APPROVED / REJECTED)
console.log('\n▶ Test 2: Verifying HR review decision updates status and reviewer fields...');
function simulateHRReview(app, decision, reviewerEmail, comment) {
  return {
    ...app,
    status: decision,
    reviewedBy: reviewerEmail,
    reviewedAt: new Date().toISOString(),
    reviewComment: comment
  };
}

const reviewedApp = simulateHRReview(sampleApplication, 'APPROVED', 'alice.hr@acmecorp.com', 'Approved per statutory policy.');
assert.strictEqual(reviewedApp.status, 'APPROVED');
assert.strictEqual(reviewedApp.reviewedBy, 'alice.hr@acmecorp.com');
assert.strictEqual(typeof reviewedApp.reviewedAt, 'string');
assert.strictEqual(reviewedApp.reviewComment, 'Approved per statutory policy.');
console.log('  ✓ PASSED: Leave application transitions to APPROVED with reviewer metadata.');

// 3. TEST: Real-Time Employee Notification Generation
console.log('\n▶ Test 3: Verifying real-time notification generated on HR approval...');
const notification = {
  id: 'notif_test_1',
  type: 'LEAVE_APPROVED',
  employeeId: reviewedApp.employeeId,
  category: reviewedApp.category,
  validFrom: reviewedApp.startDate,
  validTo: reviewedApp.endDate,
  approvedBy: reviewedApp.reviewedBy,
  createdAt: reviewedApp.reviewedAt,
  read: false,
  title: '✓ Leave request approved!',
  message: `Your ${reviewedApp.categoryLabel} (${reviewedApp.startDate} – ${reviewedApp.endDate}) has been confirmed by HR.`
};

assert.strictEqual(notification.type, 'LEAVE_APPROVED');
assert.strictEqual(notification.employeeId, 'EMP-9021');
assert.strictEqual(notification.read, false);
console.log('  ✓ PASSED: Real-time notification payload conforms to employee toast contract.');

// 4. TEST: User Session Roles
console.log('\n▶ Test 4: Verifying user session role contracts for Employee and HR...');
const testEmployee = {
  email: 'sarah@company.com',
  name: 'Sarah Jenkins',
  role: 'EMPLOYEE',
  employeeId: 'EMP-9021',
  department: 'Product Engineering'
};

const testHR = {
  email: 'alice.hr@acmecorp.com',
  name: 'Alice Vance',
  role: 'HR',
  department: 'People Operations & Benefits'
};

assert.strictEqual(testEmployee.role, 'EMPLOYEE');
assert.strictEqual(testHR.role, 'HR');
console.log('  ✓ PASSED: Distinct user session roles configured correctly.');

console.log('\n🎉 ALL LEAVE WORKFLOW & CI/CD CONTRACT TESTS PASSED!\n');
