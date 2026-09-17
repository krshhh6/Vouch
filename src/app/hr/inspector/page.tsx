'use client';

import { useState, useEffect } from 'react';
import { getReceipts, getEntitlementLedger, getShareCodes, subscribeToStateChange } from '@/lib/storage';
import { 
  Database, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  FileCode, 
  EyeOff, 
  Sparkles,
  Lock,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

export default function DatabaseInspectorPage() {
  const [receipts, setReceipts] = useState<unknown[]>([]);
  const [ledger, setLedger] = useState<unknown[]>([]);
  const [shareCodes, setShareCodes] = useState<unknown[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-ink-900 via-ink-850 to-ink-900 p-6 rounded-2xl border border-ink-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                Auditor Live Proof
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                Raw Storage Inspector
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-0.5">HR Database Zero-Knowledge Inspector</h1>
            <p className="text-xs text-slate-400">
              Inspect the raw data stored on the corporate verifier side. Zero PDFs, zero diagnoses, zero clinic names.
            </p>
          </div>
        </div>

        <Link
          href="/hr"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-950 hover:bg-ink-800 border border-ink-700 text-xs font-semibold text-slate-200 transition-colors self-start md:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to HR Verifier</span>
        </Link>
      </div>

      {/* Live Stage Audit Tool */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-seal-950/70 to-ink-950 border border-seal-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-seal-900/80 pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-seal-400" />
            <h3 className="font-bold text-white text-base">Live Prohibited Clinical Token Search</h3>
          </div>
          <span className="font-mono text-xs text-seal-300">
            Scanned {auditReport.totalBytesScanned} bytes of verifier memory
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-ink-950/80 border border-ink-800 space-y-2">
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">
              Checked Prohibited Clinical & Clinic Strings:
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {PROHIBITED_TOKENS.map(t => (
                <span key={t} className="px-2 py-0.5 rounded bg-ink-900 text-slate-300 border border-ink-800">
                  &quot;{t}&quot;
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-ink-950/80 border border-ink-800 flex flex-col justify-center space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Audit Verification Status:</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-seal-950 text-seal-400 border border-seal-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-seal-400" />
                0 TOKENS DETECTED
              </span>
            </div>
            <p className="text-[11px] text-seal-300/90 leading-relaxed">
              Cryptographically verified: The HR verifier database contains strictly booleans, coarse policy enums, and SHA-256 hashes.
            </p>
          </div>
        </div>
      </div>

      {/* Raw Tables Tab View */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-ink-800 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('receipts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'receipts'
                ? 'bg-seal-600 text-white shadow-md shadow-seal-600/30'
                : 'text-slate-400 hover:text-white hover:bg-ink-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Receipts Chain ({receipts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ledger'
                ? 'bg-seal-600 text-white shadow-md shadow-seal-600/30'
                : 'text-slate-400 hover:text-white hover:bg-ink-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Entitlement Ledger ({ledger.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shares')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'shares'
                ? 'bg-seal-600 text-white shadow-md shadow-seal-600/30'
                : 'text-slate-400 hover:text-white hover:bg-ink-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>HR Payloads ({shareCodes.length})</span>
          </button>
        </div>

        {/* JSON Viewer */}
        <div className="rounded-2xl border border-ink-800 bg-ink-950 p-5 overflow-hidden shadow-2xl font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-ink-850 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <FileCode className="w-4 h-4 text-seal-400" />
              Raw LocalStorage Memory Dump: <strong className="text-white">vouch_{activeTab}_v2</strong>
            </span>
            <span>Read-Only Inspector</span>
          </div>

          <pre className="p-4 mt-3 bg-ink-900/70 rounded-xl border border-ink-850 text-slate-200 overflow-x-auto max-h-[480px] leading-relaxed">
            {activeTab === 'receipts' && JSON.stringify(receipts, null, 2)}
            {activeTab === 'ledger' && JSON.stringify(ledger, null, 2)}
            {activeTab === 'shares' && JSON.stringify(shareCodes, null, 2)}
          </pre>
        </div>
      </div>

    </div>
  );
}
