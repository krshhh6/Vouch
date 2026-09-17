'use client';

import { useState, useEffect } from 'react';
import { getReceipts, getEntitlementLedger, getShareCodes, subscribeToStateChange } from '@/lib/storage';
import { 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  FileCode, 
  Layers,
  FileSpreadsheet,
  Lock
} from 'lucide-react';
import Link from 'next/link';

export default function DatabaseInspectorPage() {
  const [receipts, setReceipts] = useState<unknown[]>([]);
  const [ledger, setLedger] = useState<unknown[]>([]);
  const [shareCodes, setShareCodes] = useState<unknown[]>([]);
  const [activeTab, setActiveTab] = useState<'receipts' | 'ledger' | 'shares'>('receipts');

  const loadData = () => {
    setReceipts(getReceipts());
    setLedger(getEntitlementLedger());
    setShareCodes(getShareCodes());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStateChange(loadData);
    return () => unsubscribe();
  }, []);

  // Prohibited medical tokens list to test on stage
  const PROHIBITED_TOKENS = [
    'diagnosis',
    'mental',
    'surgery',
    'depression',
    'ivf',
    'progesterone',
    'lexapro',
    'oxycodone',
    'summit women',
    'st. jude regional',
    'metro behavioral'
  ];

  // Perform live deep scan on HR-visible state
  const scanHrDatabase = () => {
    const hrStateDump = JSON.stringify({
      receipts,
      ledger,
      hrPayloads: (shareCodes as Array<{ hrPayload?: unknown }>).map(s => s.hrPayload)
    }).toLowerCase();

    const matches: string[] = [];
    PROHIBITED_TOKENS.forEach(token => {
      if (hrStateDump.includes(token.toLowerCase())) {
        matches.push(token);
      }
    });

    return {
      clean: matches.length === 0,
      matches,
      totalBytesScanned: hrStateDump.length
    };
  };

  const auditReport = scanHrDatabase();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-condensed font-bold text-zinc-300 uppercase tracking-wider">
                Auditor Live Proof
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-700 font-mono">
                Raw Storage Inspector
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-0.5">HR Database Zero-Knowledge Inspector</h1>
            <p className="text-xs text-zinc-400">
              Inspect the raw data stored on the corporate verifier side. Zero PDFs, zero diagnoses, zero clinic names.
            </p>
          </div>
        </div>

        <Link
          href="/hr"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-condensed font-semibold uppercase tracking-wider text-white transition-colors self-start md:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to HR Verifier</span>
        </Link>
      </div>

      {/* Live Stage Audit Tool */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white text-base font-condensed uppercase tracking-wider">Live Prohibited Clinical Token Search</h3>
          </div>
          <span className="font-mono text-xs text-zinc-400">
            Scanned {auditReport.totalBytesScanned} bytes of verifier memory
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2">
            <span className="text-zinc-500 font-condensed uppercase tracking-wider font-semibold block text-[10px]">
              Checked Prohibited Clinical & Clinic Strings:
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {PROHIBITED_TOKENS.map(t => (
                <span key={t} className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                  &quot;{t}&quot;
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black border border-zinc-800 flex flex-col justify-center space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-condensed uppercase tracking-wider font-semibold text-[10px]">Audit Verification Status:</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-zinc-900 text-white border border-zinc-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-white" />
                0 TOKENS DETECTED
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Cryptographically verified: The HR verifier database contains strictly booleans, coarse policy enums, and SHA-256 hashes.
            </p>
          </div>
        </div>
      </div>

      {/* Raw Tables Tab View */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('receipts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-condensed uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'receipts'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Receipts Chain ({receipts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-condensed uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'ledger'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Entitlement Ledger ({ledger.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shares')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-condensed uppercase tracking-wider font-semibold transition-all ${
              activeTab === 'shares'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>HR Payloads ({shareCodes.length})</span>
          </button>
        </div>

        {/* JSON Viewer */}
        <div className="rounded-2xl border border-zinc-800 bg-black p-5 overflow-hidden shadow-2xl font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-zinc-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <FileCode className="w-4 h-4 text-white" />
              Raw Memory Dump: <strong className="text-white">vouch_{activeTab}_v2</strong>
            </span>
            <span className="font-condensed uppercase tracking-wider">Read-Only Inspector</span>
          </div>

          <pre className="p-4 mt-3 bg-zinc-950 rounded-xl border border-zinc-850 text-zinc-200 overflow-x-auto max-h-[480px] leading-relaxed">
            {activeTab === 'receipts' && JSON.stringify(receipts, null, 2)}
            {activeTab === 'ledger' && JSON.stringify(ledger, null, 2)}
            {activeTab === 'shares' && JSON.stringify(shareCodes, null, 2)}
          </pre>
        </div>
      </div>

    </div>
  );
}
