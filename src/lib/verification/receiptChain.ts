export type ReceiptOutcome = 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'REVOKED' | 'UNSEALED';

export interface Receipt {
  id: string;
  shareCodeRef: string;
  verifiedAt: string;
  outcome: ReceiptOutcome;
  proofHash: string;
  prevHash: string;
  hash: string; // sha256(prevHash + canonical JSON)
  reason?: string;
  policyVersion?: string;
  predicateResult?: any;
  actorRole?: string;
}

export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  const subtle = (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle)
    ? globalThis.crypto.subtle
    : (typeof window !== 'undefined' ? window.crypto?.subtle : undefined);

  if (subtle) {
    const digest = await subtle.digest('SHA-256', data.buffer as ArrayBuffer);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Validates the chronological integrity of a hash-chained receipt ledger.
 * Returns valid: true if every block correctly links to the preceding hash.
 */
export async function verifyChainIntegrity(receipts: Receipt[]): Promise<{
  valid: boolean;
  firstBrokenAt?: number;
  reason?: string;
}> {
  if (!receipts || receipts.length === 0) {
    return { valid: true };
  }

  let prevHash = '0'.repeat(64); // genesis hash

  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];

    if (receipt.prevHash !== prevHash) {
      return {
        valid: false,
        firstBrokenAt: i,
        reason: `Chain break at receipt ${i}: prevHash mismatch. Expected ${prevHash.substring(0, 12)}..., found ${receipt.prevHash.substring(0, 12)}...`,
      };
    }

    // Recompute canonical hash
    const payload = {
      id: receipt.id,
      shareCodeRef: receipt.shareCodeRef,
      verifiedAt: receipt.verifiedAt,
      outcome: receipt.outcome,
      proofHash: receipt.proofHash,
    };
    const canonical = JSON.stringify(payload, Object.keys(payload).sort());
    const computed = await sha256(prevHash + canonical);

    if (computed !== receipt.hash) {
      return {
        valid: false,
        firstBrokenAt: i,
        reason: `Chain break at receipt ${i}: hash mismatch. Computed ${computed.substring(0, 12)}..., stored ${receipt.hash.substring(0, 12)}...`,
      };
    }

    prevHash = receipt.hash;
  }

  return { valid: true };
}
