'use client';

import Link from 'next/link';
import { 
  ShieldCheck, 
  Stethoscope, 
  UserCheck, 
  Building2, 
  EyeOff, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  FileLock2, 
  FileText, 
  KeyRound, 
  AlertOctagon,
  Award
} from 'lucide-react';
import InteractiveRedactor from '@/components/InteractiveRedactor';

export default function Home() {
  return (
    <div className="space-y-20 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Hero Section with Redacted Document Motif */}
      <section className="relative pt-6 pb-12 lg:pt-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left: Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-seal-950 border border-seal-500/30 text-seal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-seal-400" />
              <span>Selective-Disclosure Verifiable Credential Protocol</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Prove your leave. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-seal-400 via-teal-300 to-seal-500">
                Protect your diagnosis.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Vouch lets employees prove medical, pregnancy, surgery, or mental-health leave eligibility to HR using 
              <strong className="text-white"> Web Crypto ECDSA P-256 signatures</strong> — completely eliminating raw health report uploads and preventing workplace bias.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/issuer"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-seal-600 hover:bg-seal-500 text-white font-semibold text-sm shadow-xl shadow-seal-600/30 transition-all hover:scale-105"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/employee/redact"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-slate-200 font-semibold text-sm border border-ink-700 transition-all"
              >
                <EyeOff className="w-4 h-4 text-seal-400" />
                <span>Explore Redaction Lab</span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-ink-800/80 text-xs">
              <div>
                <span className="font-bold text-white block text-sm">ECDSA P-256</span>
                <span className="text-slate-400">Native Browser Crypto</span>
              </div>
              <div>
                <span className="font-bold text-white block text-sm">0% Diagnosis Leak</span>
                <span className="text-slate-400">Minimal Attestation</span>
              </div>
              <div>
                <span className="font-bold text-white block text-sm">Time-Bound & Revocable</span>
                <span className="text-slate-400">Short-Lived Share Codes</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Interactive Redacted Document Motif Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl parchment-sheet p-6 text-ink-950 font-serif shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-300">
              
              {/* Seal Stamp */}
              <div className="absolute top-4 right-4 official-stamp px-3 py-1 font-mono text-[10px] font-bold">
                ✓ P-256 AUTHENTICATED
              </div>

              <div className="space-y-4">
                <div className="border-b border-parchment-300 pb-3">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Medical Attestation Certificate
                  </span>
                  <h3 className="font-sans font-bold text-base text-ink-900 mt-0.5">
                    Summit Women’s Health & Reproductive Care
                  </h3>
                  <p className="font-sans text-[11px] text-slate-600">
                    Dr. Elena Rostova, MD • Reg: GMC-8849201
                  </p>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between py-1 border-b border-parchment-200">
                    <span className="text-slate-500 font-medium">Certified Holder:</span>
                    <span className="font-bold text-ink-900">Sarah Jenkins (EMP-9021)</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-parchment-200">
                    <span className="text-slate-500 font-medium">Leave Category:</span>
                    <span className="font-semibold text-seal-800">Certified Medical / Family Leave</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-parchment-200">
                    <span className="text-slate-500 font-medium">Authorized Window:</span>
                    <span className="font-bold font-mono text-ink-900">Sep 16 – Oct 07, 2026</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Duty Clearance:</span>
                    <span className="font-semibold text-amber-800">Unfit (Rest Mandated)</span>
                  </div>
                </div>

                {/* Redacted Raw Note Demonstration */}
                <div className="mt-4 pt-3 border-t border-parchment-300 bg-white/70 p-3 rounded-lg border border-parchment-200 text-[11px] font-mono leading-relaxed space-y-1">
                  <div className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Underlying Clinical Notes</span>
                    <span className="text-seal-700 font-mono text-[10px]">Zero Disclosed to HR</span>
                  </div>
                  <p className="text-slate-700">
                    Patient diagnosed with <span className="redacted-bar">Early Gestation Hyperemesis</span>.
                  </p>
                  <p className="text-slate-700">
                    Ultrasound confirms <span className="redacted-bar">Subchorionic Hematoma 1.8cm</span> following <span className="redacted-bar">IVF-ICSI Cycle #3</span>.
                  </p>
                  <p className="text-slate-700">
                    Prescribed <span className="redacted-bar">Progesterone 200mg</span> and IV hydration.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Hash: 8f4a...29c1 (SHA-256)</span>
                  <span className="text-seal-700 font-bold">100% Tamper Proof</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* The 3 Core Roles Breakdown */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How Vouch Works in 3 Steps</h2>
          <p className="text-sm text-slate-400">
            A seamless triangular selective disclosure architecture linking Medical Authorities, Employees, and Corporate HR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Clinic */}
          <Link 
            href="/issuer"
            className="group p-6 rounded-2xl bg-ink-900/90 border border-ink-800 hover:border-seal-500/50 transition-all hover:shadow-xl hover:shadow-seal-950 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-seal-500/10 border border-seal-500/30 flex items-center justify-center text-seal-400 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-seal-400 uppercase tracking-wider">Step 1 • Issuer</span>
                <h3 className="text-lg font-bold text-white group-hover:text-seal-300 transition-colors">
                  Clinic Signs Attestation
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Doctor enters leave parameters and signs the minimal payload with their browser-native ECDSA P-256 key. The diagnosis remains strictly confidential inside the clinic.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-2 text-xs font-semibold text-seal-400 group-hover:translate-x-1 transition-transform">
              <span>Open Issuer Studio</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: Employee */}
          <Link 
            href="/employee"
            className="group p-6 rounded-2xl bg-ink-900/90 border border-ink-800 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-ink-950 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">Step 2 • Holder</span>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                  Employee Selective Share
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The employee stores their credential in their private wallet. When applying for leave, they configure privacy toggles and generate a short-lived revocable share code.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-2 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Open Employee Wallet</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 3: HR */}
          <Link 
            href="/hr"
            className="group p-6 rounded-2xl bg-ink-900/90 border border-ink-800 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-ink-950 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Step 3 • Verifier</span>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  HR Cryptographic Verification
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  HR enters the share code. The browser verifies the cryptographic signature against the Trusted Issuer Registry. Leave is approved with 0% health data exposure.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-2 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Open HR Verifier</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

        </div>
      </section>

      {/* Embedded Redaction Lab Sandbox Preview */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-seal-400" />
              <h2 className="text-2xl font-bold text-white">Live Redaction & Zero-Exposure Sandbox</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Compare what a conventional medical report PDF upload leaks to HR vs what Vouch protects.
            </p>
          </div>

          <Link
            href="/employee/redact"
            className="flex items-center gap-1.5 text-xs font-semibold text-seal-400 hover:text-seal-300"
          >
            <span>Open Dedicated Redaction Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <InteractiveRedactor />
      </section>

    </div>
  );
}
