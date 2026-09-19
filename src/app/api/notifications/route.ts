import { NextRequest, NextResponse } from 'next/server';

// Server-side fallback store for notifications
const SERVER_NOTIFICATIONS: any[] = [
  {
    id: 'notif_seed_001',
    type: 'LEAVE_APPROVED',
    employeeId: 'EMP-9021',
    approvalId: 'APR-2026-004521',
    category: 'STATUTORY_MATERNITY',
    validFrom: '2026-09-16',
    validTo: '2026-10-07',
    approvedBy: 'alice@acmecorp.com',
    createdAt: '2026-09-16T10:30:00.000Z',
    read: false,
    title: '✓ Leave approved!',
    message: 'Your maternity leave request (Sep 16 – Oct 07) has been approved by HR.'
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId') || 'EMP-9021';

    const filtered = SERVER_NOTIFICATIONS.filter(
      n => !employeeId || n.employeeId === employeeId
    );

    return NextResponse.json({
      notifications: filtered
    }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request | NextRequest) {
  try {
    const body = await req.json();
    const { id, employeeId, markAll } = body;

    if (markAll && employeeId) {
      SERVER_NOTIFICATIONS.forEach(n => {
        if (n.employeeId === employeeId) n.read = true;
      });
      return NextResponse.json({ success: true, count: SERVER_NOTIFICATIONS.length });
    }

    if (id) {
      const found = SERVER_NOTIFICATIONS.find(n => n.id === id);
      if (found) {
        found.read = true;
        return NextResponse.json({ success: true, notification: found });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
