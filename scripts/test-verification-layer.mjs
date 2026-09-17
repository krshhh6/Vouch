import assert from 'node:assert';
import { webcrypto } from 'node:crypto';

// Polyfill crypto if needed
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

console.log('\n======================================================');
console.log('--- VOUCH DOCUMENT VERIFICATION LAYER TEST SUITE ---');
console.log('======================================================\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // --- 1. Trusted Issuer Registry ---
  const { isIssuerTrusted, revokeIssuer, TRUSTED_ISSUERS } = await import('../src/lib/data/issuers.ts');

  test('Registry: Active issuer is trusted', () => {
    assert.strictEqual(isIssuerTrusted('sha256_abc123'), true);
  });

  test('Registry: Revoked issuer is untrusted', () => {
    assert.strictEqual(isIssuerTrusted('sha256_xyz789'), false);
  });

  test('Registry: Unknown issuer is untrusted', () => {
    assert.strictEqual(isIssuerTrusted('unknown_hash_999'), false);
  });

  test('Registry: Can dynamically revoke issuer', () => {
    const testHash = 'test_revoke_hash';
    TRUSTED_ISSUERS.push({
      issuerRefHash: testHash,
      regNo: 'TEST-123',
      clinicName: 'Test Clinic',
      status: 'ACTIVE',
      addedAt: new Date().toISOString(),
      revokedAt: null,
    });
    assert.strictEqual(isIssuerTrusted(testHash), true);
    revokeIssuer(testHash);
    assert.strictEqual(isIssuerTrusted(testHash), false);
  });

  // --- 2. Policy Engine ---
  const { validateAttestation } = await import('../src/lib/verification/policyEngine.ts');

  test('PolicyEngine: Maternity leave with valid claims passes', () => {
    const result = validateAttestation(
      {
        issuerIsLicensed: true,
        coarseCategory: 'STATUTORY_MATERNITY',
        validFrom: '2026-10-01',
        validTo: '2026-11-01',
      },
      'maternity-mba-1961'
    );
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.violations.length, 0);
  });

  test('PolicyEngine: Missing required claim fails', () => {
    const result = validateAttestation(
      {
        coarseCategory: 'STATUTORY_MATERNITY',
        validFrom: '2026-10-01',
        validTo: '2026-11-01',
      },
      'maternity-mba-1961'
    );
    assert.strictEqual(result.valid, false);
    assert.ok(result.violations.some((v) => v.includes('Missing required claim: issuerIsLicensed')));
  });

  test('PolicyEngine: Forbidden claim present fails strictly', () => {
    const result = validateAttestation(
      {
        issuerIsLicensed: true,
        coarseCategory: 'STATUTORY_MATERNITY',
        validFrom: '2026-10-01',
        validTo: '2026-11-01',
        diagnosis: 'Threatened Miscarriage',
        issuerName: 'Sunrise Clinic',
      },
      'maternity-mba-1961'
    );
    assert.strictEqual(result.valid, false);
    assert.ok(result.violations.some((v) => v.includes('Forbidden claim present: diagnosis')));
    assert.ok(result.violations.some((v) => v.includes('Forbidden claim present: issuerName')));
  });

  test('PolicyEngine: Duration exceeding maxDays fails', () => {
    const result = validateAttestation(
      {
        issuerIsLicensed: true,
        coarseCategory: 'STATUTORY_MATERNITY',
        validFrom: '2026-01-01',
        validTo: '2026-10-01', // ~273 days > 182
      },
      'maternity-mba-1961'
    );
    assert.strictEqual(result.valid, false);
    assert.ok(result.violations.some((v) => v.includes('exceeds policy maximum')));
  });

  test('PolicyEngine: Menstrual self-declared requires zero doctor credentials', () => {
    const result = validateAttestation(
      {
        validFrom: '2026-10-01',
        validTo: '2026-10-02',
      },
      'menstrual-self-declared'
    );
    assert.strictEqual(result.valid, true);
  });

  // --- 3. Document Redaction ---
  const { redactMedicalReport } = await import('../src/lib/verification/documentRedact.ts');

  test('Redaction: Scrubs ICD-10, medications, dosages, and patient ID', () => {
    const raw = 'Patient MRN: #W-90218 diagnosed with O20.0. Prescribed Progesterone 200mg daily.';
    const result = redactMedicalReport(raw);
    assert.ok(result.redactionCount >= 3, `Expected at least 3 redactions, got ${result.redactionCount}`);
    assert.ok(!result.redacted.includes('O20.0'));
    assert.ok(!result.redacted.includes('Progesterone'));
    assert.ok(!result.redacted.includes('200mg'));
    assert.ok(!result.redacted.includes('#W-90218'));
    assert.ok(result.redacted.includes('[REDACTED]'));
  });

  // --- 4. Receipt Chain Verification ---
  const { verifyChainIntegrity, sha256 } = await import('../src/lib/verification/receiptChain.ts');

  await testAsync('ReceiptChain: Valid sequential chain passes integrity verification', async () => {
    let prevHash = '0'.repeat(64);
    const chain = [];

    for (let i = 0; i < 3; i++) {
      const payload = {
        id: `rcpt_${i}`,
        shareCodeRef: `LG-TEST-${i}`,
        verifiedAt: '2026-10-01T00:00:00.000Z',
        outcome: 'APPROVED',
        proofHash: `proof_${i}`,
      };
      const canonical = JSON.stringify(payload, Object.keys(payload).sort());
      const hash = await sha256(prevHash + canonical);

      chain.push({
        ...payload,
        prevHash,
        hash,
      });

      prevHash = hash;
    }

    const verification = await verifyChainIntegrity(chain);
    assert.strictEqual(verification.valid, true);
  });

  await testAsync('ReceiptChain: Tampered receipt hash is detected and broken link identified', async () => {
    let prevHash = '0'.repeat(64);
    const chain = [];

    for (let i = 0; i < 3; i++) {
      const payload = {
        id: `rcpt_${i}`,
        shareCodeRef: `LG-TEST-${i}`,
        verifiedAt: '2026-10-01T00:00:00.000Z',
        outcome: 'APPROVED',
        proofHash: `proof_${i}`,
      };
      const canonical = JSON.stringify(payload, Object.keys(payload).sort());
      const hash = await sha256(prevHash + canonical);

      chain.push({
        ...payload,
        prevHash,
        hash,
      });

      prevHash = hash;
    }

    // Tamper with receipt 1
    chain[1].outcome = 'REJECTED'; // alters payload without updating hash

    const verification = await verifyChainIntegrity(chain);
    assert.strictEqual(verification.valid, false);
    assert.strictEqual(verification.firstBrokenAt, 1);
    assert.ok(verification.reason.includes('hash mismatch'));
  });

  // --- 5. Credential Verification (Native ECDSA P-256 Web Crypto) ---
  const { verifyCredential } = await import('../src/lib/verification/credentialVerify.ts');

  await testAsync('CredentialVerify: Genuine ECDSA P-256 signature is verified successfully', async () => {
    // Generate an ECDSA P-256 keypair
    const keyPair = await webcrypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );

    const spkiBuffer = await webcrypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyBase64 = Buffer.from(spkiBuffer).toString('base64');

    const attestationData = {
      issuerRefHash: 'sha256_abc123', // Active in TRUSTED_ISSUERS
      coarseCategory: 'STATUTORY_MATERNITY',
      validFrom: '2026-10-01',
      validTo: '2026-11-01',
    };

    const message = JSON.stringify(attestationData);
    const signatureBuffer = await webcrypto.subtle.sign(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      keyPair.privateKey,
      Buffer.from(message)
    );

    const signatureBase64 = Buffer.from(signatureBuffer).toString('base64');

    const verification = await verifyCredential(
      {
        ...attestationData,
        signature: signatureBase64,
      },
      publicKeyBase64
    );

    assert.strictEqual(verification.isValid, true);
  });

  await testAsync('CredentialVerify: Revoked issuer fails verification', async () => {
    const keyPair = await webcrypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );

    const spkiBuffer = await webcrypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyBase64 = Buffer.from(spkiBuffer).toString('base64');

    const attestationData = {
      issuerRefHash: 'sha256_xyz789', // REVOKED in TRUSTED_ISSUERS
      coarseCategory: 'STATUTORY_MATERNITY',
      validFrom: '2026-10-01',
      validTo: '2026-11-01',
    };

    const message = JSON.stringify(attestationData);
    const signatureBuffer = await webcrypto.subtle.sign(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      keyPair.privateKey,
      Buffer.from(message)
    );

    const signatureBase64 = Buffer.from(signatureBuffer).toString('base64');

    const verification = await verifyCredential(
      {
        ...attestationData,
        signature: signatureBase64,
      },
      publicKeyBase64
    );

    assert.strictEqual(verification.isValid, false);
    assert.ok(verification.reason.includes('revoked'));
  });

  await testAsync('CredentialVerify: Tampered payload fails signature check', async () => {
    const keyPair = await webcrypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );

    const spkiBuffer = await webcrypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyBase64 = Buffer.from(spkiBuffer).toString('base64');

    const attestationData = {
      issuerRefHash: 'sha256_abc123',
      coarseCategory: 'STATUTORY_MATERNITY',
      validFrom: '2026-10-01',
      validTo: '2026-11-01',
    };

    const message = JSON.stringify(attestationData);
    const signatureBuffer = await webcrypto.subtle.sign(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      keyPair.privateKey,
      Buffer.from(message)
    );

    const signatureBase64 = Buffer.from(signatureBuffer).toString('base64');

    // Tamper with validTo date
    const verification = await verifyCredential(
      {
        ...attestationData,
        validTo: '2026-12-31', // Tampered date
        signature: signatureBase64,
      },
      publicKeyBase64
    );

    assert.strictEqual(verification.isValid, false);
  });

  console.log('\n======================================================');
  console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
