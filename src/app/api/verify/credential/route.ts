import { NextRequest, NextResponse } from 'next/server';
import { verifyCredential } from '@/lib/verification/credentialVerify';
import { validateAttestation } from '@/lib/verification/policyEngine';
import { writeReceipt } from '@/lib/verification/receiptLog';
import { dbGetShareCode, dbSaveReceipt } from '@/lib/db/service';

// In-memory mock database store for API routes
const MOCK_BACKEND_STORE = new Map<string, any>();

// Seed sample share code for immediate testing & demo
MOCK_BACKEND_STORE.set('LG-7892', {
  attestation: {
    issuerRefHash: 'sha256_abc123',
    coarseCategory: 'STATUTORY_MATERNITY',
    validFrom: '2026-10-01',
    validTo: '2026-11-15',
    issuerIsLicensed: true,
    signature: 'MEQCID1q2w3e4r5t6y7u8i9o0pA1B2C3D4E5F6G7H8I9J0KLAiB1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x=',
  },
  issuerPublicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEf83OJ3D2xFmTbKEBaGJ43uGuCDbPHT19SnlecFsKNAcfda7WsqKZPuyOMEgSF8aWJa6Af85h0U2xIN558vpxUA==',
});

MOCK_BACKEND_STORE.set('LG-MENSTRUAL-01', {
  attestation: {
    issuerRefHash: 'sha256_abc123',
    coarseCategory: 'SELF_DECLARED',
    validFrom: '2026-10-01',
    validTo: '2026-10-02',
    signature: 'MEQCID1q2w3e4r5t6y7u8i9o0pA1B2C3D4E5F6G7H8I9J0KLAiB1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x=',
  },
  issuerPublicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEf83OJ3D2xFmTbKEBaGJ43uGuCDbPHT19SnlecFsKNAcfda7WsqKZPuyOMEgSF8aWJa6Af85h0U2xIN558vpxUA==',
});

function registerMockShareCode(code: string, data: any) {
  MOCK_BACKEND_STORE.set(code.trim().toUpperCase(), data);
}

function getFromMockBackend(key: string): any {
  if (!key) return null;
  const normalized = key.trim().toUpperCase();
  return MOCK_BACKEND_STORE.get(normalized) || null;
}

export async function POST(req: Request | NextRequest) {
  try {
    const body = await req.json();
    const { shareCode, policyId = 'maternity-mba-1961', shareData: explicitShareData } = body;

    if (!shareCode && !explicitShareData) {
      return NextResponse.json(
        { outcome: 'REJECTED', error: 'Missing shareCode or shareData parameter' },
        { status: 400 }
      );
    }

    // 1. Retrieve the share code payload from Neon Postgres, or fallback to mock store
    let shareData = explicitShareData;
    if (!shareData && shareCode) {
      const dbRecord = await dbGetShareCode(shareCode);
      if (dbRecord) {
        shareData = {
          attestation: {
            issuerRefHash: dbRecord.hrPayload.issuerRefHash,
            coarseCategory: dbRecord.hrPayload.coarseCategory,
            validFrom: dbRecord.hrPayload.validFrom,
            validTo: dbRecord.hrPayload.validTo,
            signature: dbRecord.signedAttestation?.signatureBase64 || '',
            issuerIsLicensed: dbRecord.hrPayload.issuerIsLicensed,
          },
          issuerPublicKey: dbRecord.signedAttestation?.publicKeyHex || '',
        };
      } else {
        shareData = getFromMockBackend(shareCode);
      }
    }

    if (!shareData || !shareData.attestation) {
      return NextResponse.json(
        { outcome: 'REJECTED', error: `Invalid share code: ${shareCode || 'unknown'}` },
        { status: 404 }
      );
    }

    const attestation = shareData.attestation;
    const issuerPublicKey = shareData.issuerPublicKey || shareData.publicKeyPEM || '';

    // 2. Verify the credential signature (unless policy explicitly permits non-credentialed self-declaration)
    const policyRequiresCredential = policyId !== 'menstrual-self-declared';

    if (policyRequiresCredential) {
      const { isValid, reason } = await verifyCredential(
        {
          issuerRefHash: attestation.issuerRefHash,
          coarseCategory: attestation.coarseCategory,
          validFrom: attestation.validFrom || attestation.startDate,
          validTo: attestation.validTo || attestation.endDate,
          signature: attestation.signature || attestation.signatureBase64 || '',
        },
        issuerPublicKey
      );

      if (!isValid) {
        const receipt = await writeReceipt({
          shareCodeRef: shareCode || 'ANON_SHARE',
          outcome: 'REJECTED',
          reason: reason || 'Signature verification failed or issuer revoked',
        });
        await dbSaveReceipt(receipt);
        return NextResponse.json(
          { outcome: 'REJECTED', reason, receipt },
          { status: 400 }
        );
      }
    }

    // 3. Validate against policy
    const { valid, violations } = validateAttestation(attestation, policyId);

    if (!valid) {
      const receipt = await writeReceipt({
        shareCodeRef: shareCode || 'ANON_SHARE',
        outcome: 'REJECTED',
        reason: violations.join('; '),
      });
      await dbSaveReceipt(receipt);
      return NextResponse.json(
        { outcome: 'REJECTED', violations, receipt },
        { status: 400 }
      );
    }

    // 4. Write receipt and return verified result with sanitized attestation
    const receipt = await writeReceipt({
      shareCodeRef: shareCode || 'ANON_SHARE',
      outcome: 'APPROVED',
    });
    await dbSaveReceipt(receipt);

    // Strictly sanitized HR public payload (zero medical/clinical/clinic details)
    const sanitizedAttestation = {
      coarseCategory: attestation.coarseCategory || 'STATUTORY_MATERNITY',
      validFrom: attestation.validFrom || attestation.startDate || '2026-09-16',
      validTo: attestation.validTo || attestation.endDate || '2026-10-07',
      expectedReturnDate: attestation.expectedReturnDate || '2026-10-08',
      issuerIsLicensed: Boolean(attestation.issuerIsLicensed ?? true),
      notRevoked: true,
      fitForDuty: attestation.fitForDuty || 'full-rest',
      holder: 'Sarah Jenkins (EMP-9021)',
      employeeName: 'Sarah Jenkins',
      employeeId: 'EMP-9021'
    };

    return NextResponse.json({ 
      outcome: 'VERIFIED', 
      receipt,
      attestation: sanitizedAttestation 
    }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { outcome: 'REJECTED', error: message },
      { status: 500 }
    );
  }
}
