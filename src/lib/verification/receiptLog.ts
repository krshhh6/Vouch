import { Receipt, ReceiptOutcome, sha256 } from './receiptChain';

// In-memory receipt log for server-side API routes & fallback
const IN_MEMORY_RECEIPTS: Receipt[] = [];

export interface WriteReceiptInput {
  shareCodeRef: string;
  outcome: ReceiptOutcome;
  reason?: string;
  proofHash?: string;
  verifiedAt?: string;
}

/**
 * Creates and appends a tamper-evident, hash-chained receipt block to the ledger.
 */
export async function writeReceipt(input: WriteReceiptInput): Promise<Receipt> {
  // Determine previous block hash
  let prevHash = '0'.repeat(64);
  if (IN_MEMORY_RECEIPTS.length > 0) {
    prevHash = IN_MEMORY_RECEIPTS[IN_MEMORY_RECEIPTS.length - 1].hash;
  }

  const id = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const verifiedAt = input.verifiedAt || new Date().toISOString();
  const proofHash = input.proofHash || (await sha256(`PROOF:${input.shareCodeRef}:${verifiedAt}`));

  const payload = {
    id,
    shareCodeRef: input.shareCodeRef,
    verifiedAt,
    outcome: input.outcome,
    proofHash,
  };

  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const hash = await sha256(prevHash + canonical);

  const receipt: Receipt = {
    ...payload,
    prevHash,
    hash,
    reason: input.reason,
  };

  IN_MEMORY_RECEIPTS.push(receipt);

  // If running in browser environment with localStorage, sync to local storage ledger
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const existing = window.localStorage.getItem('vouch_receipt_chain_v2');
      const chain = existing ? JSON.parse(existing) : [];
      chain.push(receipt);
      window.localStorage.setItem('vouch_receipt_chain_v2', JSON.stringify(chain));
    } catch {
      // Ignore localStorage sync issues in non-browser
    }
  }

  return receipt;
}

/**
 * Returns all logged receipts in chronological order
 */
export function getReceipts(): Receipt[] {
  return [...IN_MEMORY_RECEIPTS];
}

/**
 * Clears receipt log (useful for testing)
 */
export function clearReceipts(): void {
  IN_MEMORY_RECEIPTS.length = 0;
}
