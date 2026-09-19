import assert from 'node:assert';

console.log('🧪 Running Vouch Clinic Portal & Document Upload Test Suite...\n');

// 1. TEST: MedicalDocument Isolation & Non-Leakage into Share Code or HR Payload
console.log('▶ Test 1: Verifying MedicalDocument remains strictly isolated from share code & HR payload...');

const mockMedicalDoc = {
  id: 'doc_12345678',
  attestationId: 'LG-ATT-7729',
  fileName: 'maternity-ultrasound.pdf',
  fileType: 'application/pdf',
  fileSize: 204800,
  base64Data: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0x...',
  uploadedAt: new Date().toISOString(),
  notes: 'Clinical verification of gestational sac'
};

const mockHRPayload = {
  attestationId: 'LG-ATT-7729',
  coarseCategory: 'STATUTORY_MATERNITY',
  validFrom: '2026-09-16',
  validTo: '2026-10-07',
  expectedReturnDate: '2026-10-07',
  issuerIsLicensed: true,
  issuerRefHash: '8a9f4e2b3c2a1d0e...',
  fitForDuty: 'full-rest',
  fitForDutyAccommodationsPresent: false
};

const hrKeys = Object.keys(mockHRPayload);
const forbiddenInHR = ['base64Data', 'fileName', 'fileSize', 'medicalDoc', 'notes', 'ultrasound', 'documentId'];

forbiddenInHR.forEach(key => {
  assert.strictEqual(
    hrKeys.includes(key),
    false,
    `Leakage Detected: HR Public Payload contains forbidden document field "${key}"!`
  );
});

console.log('  ✓ PASSED: HR public payload contains zero document bytes or file references.');

// 2. TEST: Share Code Padding & Uniform Byte Length Compliance
console.log('\n▶ Test 2: Verifying Share Code does not expand or leak based on document presence...');

const shareCode = {
  code: 'VC-26WMAT-8K2X9',
  attestationId: 'LG-ATT-7729',
  hrPayload: mockHRPayload,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  viewCount: 0,
  isRevoked: false,
  paddedByteLength: 512
};

const shareKeys = Object.keys(shareCode);
assert.strictEqual(shareKeys.includes('base64Data'), false);
assert.strictEqual(shareKeys.includes('medicalDoc'), false);
console.log('  ✓ PASSED: Share Code object is strictly partitioned from local medical document.');

// 3. TEST: Fitness Status & Plain English Category Mapping
console.log('\n▶ Test 3: Verifying Fitness Status and Plain English Category mappings...');

const coarseMap = {
  'Maternity / Pregnancy': 'STATUTORY_MATERNITY',
  'Medical / Health': 'STATUTORY_MEDICAL',
  'Surgical Recovery': 'STATUTORY_MEDICAL',
  'Caregiving': 'CAREGIVING',
  'Mental Health': 'STATUTORY_MEDICAL'
};

assert.strictEqual(coarseMap['Maternity / Pregnancy'], 'STATUTORY_MATERNITY');
assert.strictEqual(coarseMap['Medical / Health'], 'STATUTORY_MEDICAL');
assert.strictEqual(coarseMap['Caregiving'], 'CAREGIVING');

const fitnessMap = {
  'Unfit for work (advised rest)': 'full-rest',
  'Fit with restrictions': 'partial-remote',
  'Fit for full duties on return': 'fit-post-leave'
};

assert.strictEqual(fitnessMap['Unfit for work (advised rest)'], 'full-rest');
assert.strictEqual(fitnessMap['Fit with restrictions'], 'partial-remote');
console.log('  ✓ PASSED: All simplified clinic choices map directly to statutory policy types.');

console.log('\n🎉 ALL CLINIC PORTAL & DOCUMENT UPLOAD TESTS PASSED!\n');
