import { NextResponse } from 'next/server';
import { dbSaveShareCode, dbGetShareCode } from '@/lib/db/service';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing code query parameter' }, { status: 400 });
  }

  const share = await dbGetShareCode(code);
  if (!share) {
    return NextResponse.json({ error: 'Share code not found' }, { status: 404 });
  }

  return NextResponse.json(share);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.code || !body.attestationId || !body.hrPayload) {
      return NextResponse.json(
        { error: 'Missing required share code fields: code, attestationId, hrPayload' },
        { status: 400 }
      );
    }

    await dbSaveShareCode({
      code: body.code,
      attestationId: body.attestationId,
      policyVersion: body.policyVersion || 'VOUCH-2026.1',
      policyRuleId: body.policyRuleId || 'statutory-medical-esi',
      hrPayload: body.hrPayload,
      signedAttestation: body.signedAttestation,
      isRevoked: !!body.isRevoked,
      viewCount: body.viewCount || 0,
      paddedByteLength: body.paddedByteLength || 1024,
      intendedRecipient: body.intendedRecipient,
      expiresAt: body.expiresAt,
      createdAt: body.createdAt || new Date().toISOString(),
    });

    return NextResponse.json({ success: true, code: body.code }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
