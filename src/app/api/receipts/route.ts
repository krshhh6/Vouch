import { NextResponse } from 'next/server';
import { dbGetReceipts } from '@/lib/db/service';
import { getReceipts } from '@/lib/verification/receiptLog';
import { verifyChainIntegrity } from '@/lib/verification/receiptChain';

export async function GET() {
  // Query Neon Postgres first
  let receipts = await dbGetReceipts();

  // Fallback to in-memory receipts if DB is empty or not configured
  if (!receipts || receipts.length === 0) {
    receipts = getReceipts();
  }

  const integrity = await verifyChainIntegrity(receipts);

  return NextResponse.json({
    totalReceipts: receipts.length,
    isChainValid: integrity.valid,
    integrityBreakReason: integrity.reason,
    receipts,
  });
}
