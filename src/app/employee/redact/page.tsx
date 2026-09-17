'use client';

import InteractiveRedactor from '@/components/InteractiveRedactor';
import { 
  EyeOff, 
  ShieldAlert, 
  FileCheck2, 
  ArrowLeft,
  Scale
} from 'lucide-react';
import Link from 'next/link';

export default function RedactionLabPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white shrink-0">
            <EyeOff className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-condensed font-bold text-zinc-300 uppercase tracking-wider">Privacy Engine</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-700 font-mono">
                Interactive Sandbox
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-0.5">Medical Redaction & Disclosure Sandbox</h1>
            <p className="text-xs text-zinc-400">
              Visualize how Vouch eliminates clinical bias risks by transforming full raw doctor notes into zero-leakage attestations.
            </p>
          </div>
        </div>

        <Link
          href="/employee"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-condensed uppercase tracking-wider font-semibold text-white transition-colors self-start md:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employee Vault</span>
        </Link>
      </div>

      {/* Why This Matters Educational Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white font-condensed uppercase tracking-wider">The Pregnancy Bias Hazard</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              When pregnant employees provide traditional doctor notes for early first-trimester sickness, HR learns about the pregnancy months before the employee wants to announce it, sparking covert promotion and bonus penalties.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
          <Scale className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white font-condensed uppercase tracking-wider">Mental Health & Stigma</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Prescription notes showing SSRIs (Lexapro, Zoloft) or psychiatric ICD-10 diagnosis codes remain forever in HR file systems, exposing employees to unfair workplace competency assumptions.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
          <FileCheck2 className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white font-condensed uppercase tracking-wider">The Vouch Standard</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              HR only needs to know two facts: <strong>Is the leave period certified by a licensed doctor?</strong> and <strong>Are there fitness accommodations?</strong> All medical diagnoses are 100% kept out of corporate servers.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Redactor Tool */}
      <InteractiveRedactor />

    </div>
  );
}
