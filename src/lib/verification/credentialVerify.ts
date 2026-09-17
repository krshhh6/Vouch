export interface AttestationVerificationInput {
  issuerRefHash: string;
  coarseCategory: string;
  validFrom: string;
  validTo: string;
  signature: string; // base64-encoded
}

export interface VerificationOutcome {
  isValid: boolean;
  reason?: string;
}

// Internal helper to get Web Crypto SubtleCrypto across Node and Browser
async function getSubtleCrypto(): Promise<SubtleCrypto> {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    return window.crypto.subtle;
  }
  // Node.js environment fallback
  const nodeCrypto = await import('node:crypto');
  return (nodeCrypto.webcrypto as unknown as { subtle: SubtleCrypto }).subtle;
}

// Convert Base64 or PEM to ArrayBuffer
function pemOrBase64ToArrayBuffer(pemOrBase64: string): ArrayBuffer {
  // Strip PEM headers, footers, newlines, and whitespace
  const clean = pemOrBase64
    .replace(/-----BEGIN [A-Z ]+-----/g, '')
    .replace(/-----END [A-Z ]+-----/g, '')
    .replace(/\s+/g, '');

  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(clean, 'base64');
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } else {
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Convert base64 string to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const clean = base64.replace(/\s+/g, '');
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(clean, 'base64'));
  } else {
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

/**
 * Verifies ECDSA P-256 signature and checks trusted issuer registry status
 */
export async function verifyCredential(
  attestation: AttestationVerificationInput,
  publicKeyPEM: string
): Promise<VerificationOutcome> {
  try {
    // 1. Check if issuer is in registry + not revoked
    const issuerValid = await checkIssuerRegistry(attestation.issuerRefHash);
    if (!issuerValid) {
      return { isValid: false, reason: 'Issuer not found or revoked' };
    }

    // 2. Reconstruct the signed message (deterministic order matching signer)
    const message = JSON.stringify({
      issuerRefHash: attestation.issuerRefHash,
      coarseCategory: attestation.coarseCategory,
      validFrom: attestation.validFrom,
      validTo: attestation.validTo,
    });

    const subtle = await getSubtleCrypto();
    const messageBytes = new TextEncoder().encode(message);

    // 3. Import ECDSA P-256 Public Key (SPKI)
    const keyData = pemOrBase64ToArrayBuffer(publicKeyPEM);
    const publicKey = await subtle.importKey(
      'spki',
      keyData,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );

    // 4. Verify signature
    const signatureBytes = base64ToUint8Array(attestation.signature);

    const isValid = await subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      publicKey,
      signatureBytes.buffer as ArrayBuffer,
      messageBytes.buffer as ArrayBuffer
    );

    return {
      isValid,
      reason: isValid ? undefined : 'Signature does not match public key or signed payload',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { isValid: false, reason: message };
  }
}

/**
 * Registry verification helper
 */
export async function checkIssuerRegistry(issuerRefHash: string): Promise<boolean> {
  if (!issuerRefHash) return false;
  try {
    const mod = await import('../data/issuers');
    if (mod && typeof mod.isIssuerTrusted === 'function') {
      return mod.isIssuerTrusted(issuerRefHash);
    }
  } catch {
    // Fallback if environment does not resolve extensionless imports
  }

  // Pre-seeded fallback map for hackathon scope
  const FALLBACK_ISSUERS: Record<string, { status: string }> = {
    'sha256_abc123': { status: 'ACTIVE' },
    'hash_abc123': { status: 'ACTIVE' },
    'sha256_xyz789': { status: 'REVOKED' },
    'hash_xyz789': { status: 'REVOKED' },
  };

  const issuer = FALLBACK_ISSUERS[issuerRefHash.toLowerCase()];
  return issuer?.status === 'ACTIVE';
}
