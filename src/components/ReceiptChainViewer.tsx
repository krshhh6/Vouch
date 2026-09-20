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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-0 font-sans">
      
      {/* Header Bar */}
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider font-sans">
                Cryptographic Audit Chain
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-white text-slate-700 font-mono font-semibold border border-slate-300">
                {receipts.length} Blocks
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-base mt-0.5">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto font-sans">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying || receipts.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition-colors disabled:opacity-40"
            title="Export compliance receipt CSV with zero health fields"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Auditor CSV</span>
          </button>
        </div>
      </div>

      {/* Verification Audit Result Banner */}
      {chainAudit && (
        <div className={`p-4 border-b text-xs flex items-center justify-between gap-3 animate-in fade-in ${
          chainAudit.isChainValid 
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900' 
            : 'border-rose-200 bg-rose-50 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {chainAudit.isChainValid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>
              {chainAudit.isChainValid ? (
                <>
                  <strong className="text-emerald-950 font-semibold">Chain Integrity 100% Validated:</strong> All {chainAudit.totalBlocks} blocks linked sequentially from Genesis with valid SHA-256 state transitions.
                </>
              ) : (
                <>
                  <strong className="text-rose-950 font-semibold">Integrity Violation Detected:</strong> Chain broken at block #{chainAudit.brokenLinkIndex} (ID: {chainAudit.brokenLinkId}).
                </>
              )}
            </span>
          </div>
          <button 
            onClick={() => setChainAudit(null)}
            className={`text-[10px] underline ${
              chainAudit.isChainValid ? 'text-emerald-700 hover:text-emerald-900' : 'text-rose-700 hover:text-rose-900'
            }`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chain Blocks List */}
      <div className="p-6 space-y-4">
        {receipts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-sans">
            No receipts recorded on chain yet.
          </div>
        ) : (
          receipts.map((receipt, index) => (
            <div
              key={receipt.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all space-y-3 font-mono text-xs text-slate-700"
            >
              {/* Block Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span className="font-bold text-slate-900 font-sans">Block #{receipts.length - index}</span>
                  <span className="text-[11px] text-slate-500 font-normal">ID: {receipt.id}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className={`px-2 py-0.5 rounded font-bold font-mono border ${
                    receipt.outcome === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : receipt.outcome === 'REJECTED'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {receipt.outcome}
                  </span>
                  <span className="text-slate-500 font-sans">{receipt.actorRole}</span>
                </div>
              </div>

              {/* Predicate 4 Booleans Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block">Max Duration</span>
                  <span className={receipt.predicateResult.withinPolicyMaxDuration ? 'text-emerald-700 font-bold' : 'text-rose-600 line-through'}>
                    {receipt.predicateResult.withinPolicyMaxDuration ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block">Quota Quorum</span>
                  <span className={receipt.predicateResult.withinRemainingEntitlement ? 'text-emerald-700 font-bold' : 'text-rose-600 line-through'}>
                    {receipt.predicateResult.withinRemainingEntitlement ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block">Doctor Signature</span>
                  <span className={receipt.predicateResult.withinCredentialValidity ? 'text-emerald-700 font-bold' : 'text-rose-600 line-through'}>
                    {receipt.predicateResult.withinCredentialValidity ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block">No Overlap</span>
                  <span className={receipt.predicateResult.noOverlapWithApproved ? 'text-emerald-700 font-bold' : 'text-rose-600 line-through'}>
                    {receipt.predicateResult.noOverlapWithApproved ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
              </div>

              {/* Hashes Row */}
              <div className="space-y-1.5 text-[10px] bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-500">Previous Block Hash:</span>
                  <span className="text-slate-600 break-all">{receipt.prevHash}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-slate-900 font-semibold">Current Block Hash:</span>
                  <span className="text-slate-900 font-bold break-all">{receipt.hash}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-slate-400 text-[9px]">
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
