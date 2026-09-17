'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Lock, 
  EyeOff, 
  Clock, 
  Database,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function OverviewPage() {
  return (
    <div className="w-full bg-[#0F172A] text-slate-100 min-h-[calc(100vh-100px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Main 50 / 50 Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (50%): Pitch, CTA & Stat Blocks */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider text-[#94C3A3] bg-[#1E293B] border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4A7C59]" />
                Zero-Knowledge Medical Leave Protocol
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold text-white tracking-tight leading-[1.05]">
                Prove your leave.<br />
                Protect your diagnosis.
              </h1>

              <p className="text-base text-slate-300 leading-relaxed font-sans max-w-xl">
                Vouch lets employees certify medical, pregnancy, surgery, or mental-health leave eligibility to HR using Web Crypto ECDSA P-256 signatures — eliminating raw medical records, diagnosis exposure, and workplace bias.
              </p>
            </div>

            {/* Two Stacked Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/clinic"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[4px] bg-[#4A7C59] hover:bg-[#3D6649] text-white font-condensed font-bold uppercase tracking-wider text-base transition-colors shadow-sm"
              >
                <span>LAUNCH INTERACTIVE DEMO →</span>
              </Link>
              
              <Link
                href="/redaction-lab"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[4px] bg-transparent hover:bg-[#1E293B] text-[#94C3A3] border-2 border-[#4A7C59] font-condensed font-bold uppercase tracking-wider text-base transition-colors"
              >
                <span>EXPLORE REDACTION LAB</span>
              </Link>
            </div>

            {/* Three Stat Blocks (Flex Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#1E293B]">
              <div className="p-4 rounded bg-[#0B1120] border border-[#1E293B] space-y-1">
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">ECDSA P-256</div>
                <div className="text-[11px] text-slate-400 font-sans">Native Web Crypto</div>
              </div>

              <div className="p-4 rounded bg-[#0B1120] border border-[#1E293B] space-y-1">
                <div className="text-xs font-mono font-bold text-[#94C3A3] uppercase tracking-wider">0% DIAGNOSIS LEAK</div>
                <div className="text-[11px] text-slate-400 font-sans">Minimal Attestation</div>
              </div>

              <div className="p-4 rounded bg-[#0B1120] border border-[#1E293B] space-y-1">
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">TIME-BOUND &amp; REVOCABLE</div>
                <div className="text-[11px] text-slate-400 font-sans">Padded Share Codes</div>
              </div>
            </div>

          </div>

          {/* Right Column (50%): Certificate Preview Card */}
          <div className="lg:col-span-6">
            <div className="parchment-sheet rounded-lg p-7 text-[#0F172A] font-sans relative border border-[#EDE6D6] shadow-2xl space-y-6">
              
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-[#EDE6D6] pb-4">
                <div>
                  <span className="text-[11px] font-mono font-bold tracking-wider text-slate-600 uppercase">
                    MEDICAL ATTESTATION CERTIFICATE
                  </span>
                  <h3 className="text-xl font-bold text-[#0F172A] mt-1">
                    Summit Women&apos;s Health &amp; Reproductive Care
                  </h3>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    Dr. Elena Rostova, MD • Medical Reg: GMC-6849201
                  </p>
                </div>

                <div className="official-stamp text-xs font-bold text-[#4A7C59] border-[#4A7C59] flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C59]" />
                  <span>P-256 AUTHENTICATED</span>
                </div>
              </div>

              {/* Minimal Claims Disclosed to HR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white/80 p-3 rounded border border-[#EDE6D6] space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-condensed">
                    Certified Holder
                  </span>
                  <p className="font-semibold text-sm text-[#0F172A]">
                    Sarah Jenkins <span className="font-mono text-xs text-slate-600">(EMP-9021)</span>
                  </p>
                </div>

                <div className="bg-white/80 p-3 rounded border border-[#EDE6D6] space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-condensed">
                    Leave Category
                  </span>
                  <p className="font-mono font-bold text-sm text-[#31523B]">
                    STATUTORY_MATERNITY
                  </p>
                </div>

                <div className="bg-white/80 p-3 rounded border border-[#EDE6D6] space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-condensed">
                    Authorized Window
                  </span>
                  <p className="font-mono font-semibold text-xs text-[#0F172A]">
                    Sep 16 – Oct 07, 2026
                  </p>
                </div>

                <div className="bg-white/80 p-3 rounded border border-[#EDE6D6] space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-condensed">
                    Occupational Status
                  </span>
                  <p className="font-semibold text-xs text-[#0F172A]">
                    Unfit (Rest Mandated)
                  </p>
                </div>
              </div>

              {/* Underlying Clinical Record Box */}
              <div className="rounded border border-[#D5CDBC] bg-[#FAF7F0] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#EDE6D6] pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider font-condensed text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#4A7C59]" />
                    UNDERLYING CLINICAL RECORD
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#4A7C59] bg-[#EAE3D2] px-2 py-0.5 rounded">
                    0% DISCLOSED TO HR
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700 font-mono leading-relaxed">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span>Patient diagnosed with</span>
                    <span className="redacted-bar">hyperemesis gravidarum (O21.0)</span>
                    <span>[—]</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span>Ultrasound confirms</span>
                    <span className="redacted-bar">viable intrauterine pregnancy at 11w4d</span>
                    <span>[following]</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span>Prescribed</span>
                    <span className="redacted-bar">Ondansetron 8mg PO BID</span>
                    <span>and IV hydration.</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EDE6D6] flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Hash: <strong className="text-slate-800">8fda...29c1</strong> (SHA-256)</span>
                  <span className="font-bold text-[#31523B]">100% Tamper Proof</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 3-Step Interactive Workflow Explanation */}
        <div className="pt-12 border-t border-[#1E293B] space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94C3A3]">
              Cryptographic Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-condensed uppercase tracking-wider">
              Three Distinct Trust Boundaries
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Clinical knowledge stays with the doctor. Entitlement verification executes in employee-held client code. HR receives only policy compliance verdicts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Link 
              href="/clinic" 
              className="p-6 rounded-lg bg-[#0B1120] border border-[#1E293B] hover:border-[#4A7C59] transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded bg-[#1E293B] border border-slate-700 flex items-center justify-center text-[#94C3A3] group-hover:bg-[#4A7C59] group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">STAGE 1</span>
                <span className="text-[10px] text-[#94C3A3] font-mono">ECDSA P-256</span>
              </div>
              <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
                1. Clinic Issuer
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Doctor signs minimal leave parameters. Diagnostic notes and clinic identities are stripped into SHA-256 registry hashes.
              </p>
              <div className="text-xs font-condensed uppercase tracking-wider text-[#94C3A3] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Enter Clinic Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link 
              href="/employee" 
              className="p-6 rounded-lg bg-[#0B1120] border border-[#1E293B] hover:border-[#4A7C59] transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded bg-[#1E293B] border border-slate-700 flex items-center justify-center text-[#94C3A3] group-hover:bg-[#4A7C59] group-hover:text-white transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">STAGE 2</span>
                <span className="text-[10px] text-[#94C3A3] font-mono">Client-Side Vault</span>
              </div>
              <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
                2. Employee Wallet
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Employee holds credentials in private storage. Evaluates information leakage and generates time-bound 24h verification codes.
              </p>
              <div className="text-xs font-condensed uppercase tracking-wider text-[#94C3A3] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Access Employee Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link 
              href="/hr" 
              className="p-6 rounded-lg bg-[#0B1120] border border-[#1E293B] hover:border-[#4A7C59] transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded bg-[#1E293B] border border-slate-700 flex items-center justify-center text-[#94C3A3] group-hover:bg-[#4A7C59] group-hover:text-white transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">STAGE 3</span>
                <span className="text-[10px] text-[#94C3A3] font-mono">F1–F3 Predicates</span>
              </div>
              <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
                3. HR Verifier
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                HR inputs share code. Validates policy predicates without learning remaining balances or raw clinical files, logging immutable hash receipts.
              </p>
              <div className="text-xs font-condensed uppercase tracking-wider text-[#94C3A3] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Open HR Verifier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
