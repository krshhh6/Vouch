import { NextRequest, NextResponse } from 'next/server';
import { writeReceipt } from '@/lib/verification/receiptLog';
import { dbSaveReceipt } from '@/lib/db/service';

// In-memory server-side approvals store
const APPROVALS_STORE = new Map<string, any>();
const NOTIFICATIONS_STORE = new Map<string, any[]>();

export async function POST(req: Request | NextRequest) {
  try {
    const body = await req.json();
    const { 
      shareCode, 
      approvalDecision = 'APPROVED', 
      comment = '', 
      employeeId = 'EMP-9021',
      category = 'STATUTORY_MATERNITY',
      validFrom = '2026-09-16',
      validTo = '2026-10-07',
      approvedBy = 'alice@acmecorp.com'
    } = body;

    if (!shareCode) {
      return NextResponse.json(
        { error: 'Missing shareCode parameter' },
        { status: 400 }
      );
    }

    const approvalId = `APR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    // 1. Append tamper-evident receipt
    const receipt = await writeReceipt({
      shareCodeRef: shareCode,
      outcome: approvalDecision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      reason: comment || undefined,
    });
    await dbSaveReceipt(receipt);

    // 2. Build approval record
    const approvalRecord = {
      approvalId,
      shareCode,
      employeeId,
      approvalDecision,
      approvedBy,
      approvedAt: nowIso,
      category,
      validFrom,
      validTo,
      status: 'ACTIVE',
      comment,
      receiptId: receipt.id
    };
    APPROVALS_STORE.set(approvalId, approvalRecord);

    // 3. Create real-time notification
    const categoryTitle = category === 'STATUTORY_MATERNITY' 
      ? 'maternity leave' 
      : category === 'STATUTORY_MEDICAL' 
      ? 'medical leave' 
      : 'caregiving leave';

    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: approvalDecision === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      employeeId,
      approvalId,
      category,
      validFrom,
      validTo,
      approvedBy,
      createdAt: nowIso,
      read: false,
      title: approvalDecision === 'APPROVED' ? '✓ Leave approved!' : '✗ Leave request rejected',
      message: approvalDecision === 'APPROVED'
        ? `Your ${categoryTitle} request (${validFrom} – ${validTo}) has been approved by HR.`
        : `Your ${categoryTitle} request (${validFrom} – ${validTo}) was not approved.`
    };

    const existingNotifs = NOTIFICATIONS_STORE.get(employeeId) || [];
    NOTIFICATIONS_STORE.set(employeeId, [notification, ...existingNotifs]);

    return NextResponse.json({
      approvalId,
      outcome: approvalDecision,
      notificationSent: true,
      receipt,
      notification
    }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
