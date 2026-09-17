'use client';

import ReceiptChainViewer from './ReceiptChainViewer';

export default function AuditLogViewer() {
  return (
    <ReceiptChainViewer
      title="Real-Time Tamper-Evident Verification Log (F3 Chain)"
      subtitle="Cryptographic hash-chained append-only log with jittered timestamps"
    />
  );
}
