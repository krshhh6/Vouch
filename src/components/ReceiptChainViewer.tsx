'use client';

import { useState, useEffect } from 'react';
import { Receipt } from '@/lib/types';
import { getReceipts, exportReceiptsAsCSV, subscribeToStateChange } from '@/lib/storage';
import { verifyReceiptChain } from '@/lib/crypto';
import { 
  Link2, 
  ShieldCheck, 
  AlertOctagon, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Lock, 
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';

interface ReceiptChainViewerProps {
  readOnly?: boolean;
  title?: string;
  subtitle?: string;
}

export default function ReceiptChainViewer({
  readOnly = false,
  title = 'Tamper-Evident Hash-Chained Receipt Ledger',
  subtitle = 'Append-only cryptographic chain satisfying labor inspectors with zero health data stored'
}: ReceiptChainViewerProps) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [chainAudit, setChainAudit] = useState<{
    isChainValid: boolean;
    brokenLinkIndex: number | null;
    brokenLinkId: string | null;
    totalBlocks: number;
  } | null>(null);

  const loadData = () => {
    setReceipts(getReceipts());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStateChange(loadData);
    return () => unsubscribe();
  }, []);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    // Simulate realistic cryptographic walk
    await new Promise(r => setTimeout(r, 350));
    const result = await verifyReceiptChain(receipts);
    setChainAudit(result);
    setIsVerifying(false);
  };

  const handleDownloadCSV = () => {
    const csvContent = exportReceiptsAsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Vouch_Compliance_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/90 shadow-xl overflow-hidden space-y-0">
      
      {/* Header Bar */}
      <div className="p-6 border-b border-ink-800 bg-ink-950/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-seal-500/20 border border-seal-400/40 flex items-center justify-center text-seal-400 shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-seal-400 uppercase tracking-wider">
                Cryptographic Audit Chain
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-ink-800 text-slate-300 font-mono border border-ink-700">
                {receipts.length} Blocks
              </span>
            </div>
            <h3 className="font-bold text-white text-base mt-0.5">{title}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying || receipts.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-seal-600 hover:bg-seal-500 text-white text-xs font-semibold shadow-md shadow-seal-600/30 transition-all disabled:opacity-50"
          >
            {isVerifying ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>Verify Chain Integrity</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            disabled={receipts.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 text-slate-200 text-xs font-semibold border border-ink-700 transition-colors disabled:opacity-50"
            title="Export compliance receipt CSV with zero health fields"
          >
            <Download className="w-3.5 h-3.5 text-seal-400" />
            <span>Export Auditor CSV</span>
          </button>
        </div>
      </div>

      {/* Verification Audit Result Banner */}
      {chainAudit && (
        <div className={`p-4 border-b text-xs flex items-center justify-between gap-3 animate-in fade-in ${
          chainAudit.isChainValid 
            ? 'bg-seal-950/80 border-seal-800 text-seal-200' 
            : 'bg-red-950/80 border-red-800 text-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {chainAudit.isChainValid ? (
              <CheckCircle2 className="w-4 h-4 text-seal-400 shrink-0" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>
              {chainAudit.isChainValid ? (
                <>
                  <strong>Chain Integrity 100% Validated:</strong> All {chainAudit.totalBlocks} blocks linked sequentially from Genesis with valid SHA-256 state transitions.
                </>
              ) : (
                <>
                  <strong>Integrity Violation Detected:</strong> Chain broken at block #{chainAudit.brokenLinkIndex} (ID: {chainAudit.brokenLinkId}).
                </>
              )}
            </span>
          </div>
          <button 
            onClick={() => setChainAudit(null)}
            className="text-[10px] underline text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chain Blocks List */}
      <div className="p-6 space-y-4">
        {receipts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No receipts recorded on chain yet.
          </div>
        ) : (
          receipts.map((receipt, index) => (
            <div
              key={receipt.id}
              className="p-4 rounded-xl bg-ink-950 border border-ink-800/80 hover:border-seal-500/40 transition-all space-y-3 font-mono text-xs text-slate-300"
            >
              {/* Block Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-850 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-seal-400"></span>
                  <span className="font-bold text-white">Block #{receipts.length - index}</span>
                  <span className="text-[11px] text-slate-400 font-normal">ID: {receipt.id}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    receipt.outcome === 'APPROVED' 
                      ? 'bg-seal-950 text-seal-300 border border-seal-800'
                      : receipt.outcome === 'UNSEALED'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}>
                    {receipt.outcome}
                  </span>
                  <span className="text-slate-400">{receipt.actorRole}</span>
                </div>
              </div>

              {/* Predicate 4 Booleans Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="bg-ink-900 p-2 rounded border border-ink-800">
                  <span className="text-slate-500 block">Max Duration</span>
                  <span className={receipt.predicateResult.withinPolicyMaxDuration ? 'text-seal-400 font-bold' : 'text-red-400'}>
                    {receipt.predicateResult.withinPolicyMaxDuration ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
                <div className="bg-ink-900 p-2 rounded border border-ink-800">
                  <span className="text-slate-500 block">Quota Quorum</span>
                  <span className={receipt.predicateResult.withinRemainingEntitlement ? 'text-seal-400 font-bold' : 'text-red-400'}>
                    {receipt.predicateResult.withinRemainingEntitlement ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
                <div className="bg-ink-900 p-2 rounded border border-ink-800">
                  <span className="text-slate-500 block">Doctor Signature</span>
                  <span className={receipt.predicateResult.withinCredentialValidity ? 'text-seal-400 font-bold' : 'text-red-400'}>
                    {receipt.predicateResult.withinCredentialValidity ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
                <div className="bg-ink-900 p-2 rounded border border-ink-800">
                  <span className="text-slate-500 block">No Overlap</span>
                  <span className={receipt.predicateResult.noOverlapWithApproved ? 'text-seal-400 font-bold' : 'text-red-400'}>
                    {receipt.predicateResult.noOverlapWithApproved ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
              </div>

              {/* Hashes Row */}
              <div className="space-y-1.5 text-[10px] bg-ink-900/60 p-2.5 rounded-lg border border-ink-850">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500">Previous Block Hash:</span>
                  <span className="text-slate-400 break-all">{receipt.prevHash}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-seal-400 font-semibold">Current Block Hash:</span>
                  <span className="text-seal-300 font-bold break-all">{receipt.hash}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-slate-500 text-[9px]">
                  <span>Jittered Timestamp: {receipt.verifiedAt}</span>
                  <span>Policy: {receipt.policyVersion}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
