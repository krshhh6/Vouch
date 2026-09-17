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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden space-y-0 font-sans">
      
      {/* Header Bar */}
      <div className="p-6 border-b border-zinc-800 bg-black flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider font-condensed">
                Cryptographic Audit Chain
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-400 font-mono border border-zinc-800">
                {receipts.length} Blocks
              </span>
            </div>
            <h3 className="font-bold text-white text-base mt-0.5">{title}</h3>
            <p className="text-xs text-zinc-400">{subtitle}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto font-condensed tracking-wider uppercase">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying || receipts.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-800 transition-colors disabled:opacity-40"
            title="Export compliance receipt CSV with zero health fields"
          >
            <Download className="w-3.5 h-3.5 text-zinc-300" />
            <span>Export Auditor CSV</span>
          </button>
        </div>
      </div>

      {/* Verification Audit Result Banner */}
      {chainAudit && (
        <div className="p-4 border-b border-zinc-800 bg-zinc-900 text-xs text-zinc-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            {chainAudit.isChainValid ? (
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
            <span>
              {chainAudit.isChainValid ? (
                <>
                  <strong className="text-white font-semibold">Chain Integrity 100% Validated:</strong> All {chainAudit.totalBlocks} blocks linked sequentially from Genesis with valid SHA-256 state transitions.
                </>
              ) : (
                <>
                  <strong className="text-white font-semibold">Integrity Violation Detected:</strong> Chain broken at block #{chainAudit.brokenLinkIndex} (ID: {chainAudit.brokenLinkId}).
                </>
              )}
            </span>
          </div>
          <button 
            onClick={() => setChainAudit(null)}
            className="text-[10px] underline text-zinc-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chain Blocks List */}
      <div className="p-6 space-y-4">
        {receipts.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs font-sans">
            No receipts recorded on chain yet.
          </div>
        ) : (
          receipts.map((receipt, index) => (
            <div
              key={receipt.id}
              className="p-4 rounded-xl bg-black border border-zinc-800 hover:border-zinc-700 transition-all space-y-3 font-mono text-xs text-zinc-300"
            >
              {/* Block Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span className="font-bold text-white font-sans">Block #{receipts.length - index}</span>
                  <span className="text-[11px] text-zinc-500 font-normal">ID: {receipt.id}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded font-bold font-mono bg-zinc-900 text-zinc-200 border border-zinc-700">
                    {receipt.outcome}
                  </span>
                  <span className="text-zinc-500 font-sans">{receipt.actorRole}</span>
                </div>
              </div>

              {/* Predicate 4 Booleans Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                  <span className="text-zinc-500 block">Max Duration</span>
                  <span className={receipt.predicateResult.withinPolicyMaxDuration ? 'text-white font-bold' : 'text-zinc-600 line-through'}>
                    {receipt.predicateResult.withinPolicyMaxDuration ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
                <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                  <span className="text-zinc-500 block">Quota Quorum</span>
                  <span className={receipt.predicateResult.withinRemainingEntitlement ? 'text-white font-bold' : 'text-zinc-600 line-through'}>
                    {receipt.predicateResult.withinRemainingEntitlement ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
                <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                  <span className="text-zinc-500 block">Doctor Signature</span>
                  <span className={receipt.predicateResult.withinCredentialValidity ? 'text-white font-bold' : 'text-zinc-600 line-through'}>
                    {receipt.predicateResult.withinCredentialValidity ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
                <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                  <span className="text-zinc-500 block">No Overlap</span>
                  <span className={receipt.predicateResult.noOverlapWithApproved ? 'text-white font-bold' : 'text-zinc-600 line-through'}>
                    {receipt.predicateResult.noOverlapWithApproved ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
              </div>

              {/* Hashes Row */}
              <div className="space-y-1.5 text-[10px] bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-zinc-500">Previous Block Hash:</span>
                  <span className="text-zinc-400 break-all">{receipt.prevHash}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-zinc-300 font-semibold">Current Block Hash:</span>
                  <span className="text-white font-bold break-all">{receipt.hash}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-zinc-500 text-[9px]">
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
