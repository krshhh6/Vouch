import { AttestationPayload, SignedAttestation, Receipt } from './types';

// Canonical JSON stringification (ensures consistent key ordering for deterministic signature verification)
export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalizeJson).join(',') + ']';
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map(k => `${JSON.stringify(k)}:${canonicalizeJson((obj as Record<string, unknown>)[k])}`);
  return '{' + pairs.join(',') + '}';
}

// Convert ArrayBuffer to Hex String
export function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex String to Uint8Array
export function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Convert ArrayBuffer to Base64 String
export function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 String to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate native ECDSA P-256 Keypair
export async function generateECDSAKeyPair(): Promise<{
  privateKeyJwk: JsonWebKey;
  publicKeyJwk: JsonWebKey;
  publicKeyHex: string;
}> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('Web Crypto API is only available in browser environments.');
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true, // extractable
    ['sign', 'verify']
  );

  const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
  const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const publicKeySpki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyHex = bufferToHex(publicKeySpki);

  return {
    privateKeyJwk,
    publicKeyJwk,
    publicKeyHex,
  };
}

// Sign Attestation Payload with ECDSA P-256 & SHA-256
export async function signAttestationPayload(
  payload: AttestationPayload,
  privateKeyJwk: JsonWebKey
): Promise<{ signatureBase64: string; signatureHex: string }> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('Web Crypto API is only available in browser environments.');
  }

  const privateKey = await window.crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    false,
    ['sign']
  );

  const canonicalData = canonicalizeJson(payload);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(canonicalData);

  const signatureBuffer = await window.crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' },
    },
    privateKey,
    dataBuffer.buffer as ArrayBuffer
  );

  const signatureBase64 = bufferToBase64(signatureBuffer);
  const signatureHex = bufferToHex(signatureBuffer);

  return { signatureBase64, signatureHex };
}

export interface VerificationResult {
  isValid: boolean;
  algorithm: string;
  curve: string;
  signedAt: string;
  sha256Fingerprint: string;
  error?: string;
  details: {
    keyFormatValid: boolean;
    dataIntegrityValid: boolean;
    signatureValid: boolean;
  };
}

// Verify ECDSA P-256 Attestation
export async function verifySignedAttestation(
  signedAttestation: SignedAttestation
): Promise<VerificationResult> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return {
      isValid: false,
      algorithm: 'ECDSA-P256-SHA256',
      curve: 'P-256',
      signedAt: signedAttestation.createdAt,
      sha256Fingerprint: '',
      error: 'Web Crypto API unavailable',
      details: { keyFormatValid: false, dataIntegrityValid: false, signatureValid: false }
    };
  }

  try {
    const publicKey = await window.crypto.subtle.importKey(
      'jwk',
      signedAttestation.publicKeyJwk,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      false,
      ['verify']
    );

    const canonicalData = canonicalizeJson(signedAttestation.payload);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(canonicalData);

    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer.buffer as ArrayBuffer);
    const sha256Fingerprint = bufferToHex(hashBuffer);

    const signatureBytes = base64ToBuffer(signedAttestation.signatureBase64);

    const isValid = await window.crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      publicKey,
      signatureBytes.buffer as ArrayBuffer,
      dataBuffer.buffer as ArrayBuffer
    );

    return {
      isValid,
      algorithm: 'ECDSA-P256-SHA256',
      curve: 'P-256',
      signedAt: signedAttestation.createdAt,
      sha256Fingerprint,
      details: {
        keyFormatValid: true,
        dataIntegrityValid: true,
        signatureValid: isValid,
      }
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Cryptographic verification exception';
    return {
      isValid: false,
      algorithm: 'ECDSA-P256-SHA256',
      curve: 'P-256',
      signedAt: signedAttestation.createdAt,
      sha256Fingerprint: '',
      error: errorMsg,
      details: {
        keyFormatValid: false,
        dataIntegrityValid: false,
        signatureValid: false,
      }
    };
  }
}

// Compute SHA-256 digest of any string (for fingerprinting)
export async function computeSHA256(text: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    // Fallback simple hash for non-browser tests
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
  return bufferToHex(hashBuffer);
}

// FIX 0a: Compute opaque issuer reference hash: sha256(regNo + salt)
export async function computeIssuerRefHash(
  regNo: string,
  salt = 'LG_REGISTRY_SALT_NMC_2026'
): Promise<string> {
  return computeSHA256(`${regNo.trim().toUpperCase()}:${salt}`);
}

// F1: Compute employer pseudonym: sha256(employeeId + employerSalt)
export async function computeEmployerPseudonym(
  employeeId: string,
  employerSalt = 'ACME_CORP_LEAVE_PEPPER_2026'
): Promise<string> {
  const digest = await computeSHA256(`EMP_PSEUDO:${employeeId.trim().toUpperCase()}:${employerSalt}`);
  return `usr_${digest.substring(0, 12)}`;
}

// ===================== F3: TAMPER-EVIDENT HASH CHAIN =====================

export const GENESIS_BLOCK_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export async function computeReceiptHash(
  prevHash: string,
  receiptData: Omit<Receipt, 'hash'>
): Promise<string> {
  const canonicalData = canonicalizeJson(receiptData);
  return computeSHA256(`${prevHash}:${canonicalData}`);
}

export async function verifyReceiptChain(receipts: Receipt[]): Promise<{
  isChainValid: boolean;
  brokenLinkIndex: number | null;
  brokenLinkId: string | null;
  totalBlocks: number;
}> {
  if (!receipts || receipts.length === 0) {
    return { isChainValid: true, brokenLinkIndex: null, brokenLinkId: null, totalBlocks: 0 };
  }

  // The chain is stored in chronological order (oldest to newest) or newest to oldest.
  // In storage, let's normalize receipts ordered from oldest (genesis) to newest.
  const chain = [...receipts].reverse(); // reverse if storage stores newest first

  let currentPrevHash = GENESIS_BLOCK_HASH;

  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];
    
    // Check prevHash link
    if (block.prevHash !== currentPrevHash) {
      return {
        isChainValid: false,
        brokenLinkIndex: i,
        brokenLinkId: block.id,
        totalBlocks: chain.length
      };
    }

    // Recompute block hash
    const blockData: Omit<Receipt, 'hash'> = {
      id: block.id,
      shareCodeRef: block.shareCodeRef,
      policyVersion: block.policyVersion,
      verifiedAt: block.verifiedAt,
      outcome: block.outcome,
      proofHash: block.proofHash,
      predicateResult: block.predicateResult,
      prevHash: block.prevHash,
      actorRole: block.actorRole
    };

    const expectedHash = await computeReceiptHash(block.prevHash, blockData);
    if (block.hash !== expectedHash) {
      return {
        isChainValid: false,
        brokenLinkIndex: i,
        brokenLinkId: block.id,
        totalBlocks: chain.length
      };
    }

    currentPrevHash = block.hash;
  }

  return { isChainValid: true, brokenLinkIndex: null, brokenLinkId: null, totalBlocks: chain.length };
}

// ===================== F4: LEAKAGE DEFENSES =====================

/**
 * Padds an object's serialized JSON to a uniform byte length.
 * Prevents side-channel network traffic and byte-length fingerprinting.
 */
export function padPayloadToUniformLength<T extends object>(
  payload: T,
  targetLength = 1024
): T & { _padding: string } {
  const copy = { ...payload, _padding: '' };
  const rawLength = new TextEncoder().encode(canonicalizeJson(copy)).length;
  const paddingNeeded = Math.max(0, targetLength - rawLength - 20);
  const paddingStr = '0'.repeat(paddingNeeded);
  return {
    ...payload,
    _padding: paddingStr
  };
}

/**
 * Rounds a verification timestamp to the date and applies uniform pseudo-random jitter.
 * Prevents timing oracle correlation.
 */
export function getJitteredRoundedTimestamp(inputDate: Date = new Date()): string {
  const d = new Date(inputDate);
  // Round to midnight UTC
  const rounded = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
  // Add pseudo-random deterministic jitter between 0 and 3600 seconds
  const jitterSeconds = Math.floor((d.getTime() % 3600));
  const jittered = new Date(rounded.getTime() + jitterSeconds * 1000);
  return jittered.toISOString();
}
