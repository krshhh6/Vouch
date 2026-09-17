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
      
      {/* Hero Section with Formal Institutional Motif */}
      <section className="relative pt-6 pb-12 lg:pt-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left: Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-condensed uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span>Selective-Disclosure Verifiable Credential Protocol</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-sans">
              Prove your leave. <br />
              <span className="text-zinc-400">
                Protect your diagnosis.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl font-sans">
              Vouch lets employees certify medical, pregnancy, surgery, or mental-health leave eligibility to HR using 
              <strong className="text-white"> Web Crypto ECDSA P-256 signatures</strong> — eliminating raw medical records, diagnosis exposure, and workplace bias.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/issuer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm font-condensed tracking-wider uppercase transition-all"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/employee/redact"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-zinc-200 font-semibold text-sm font-condensed tracking-wider uppercase border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                <EyeOff className="w-4 h-4 text-zinc-300" />
                <span>Explore Redaction Lab</span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-zinc-800 text-xs">
              <div>
                <span className="font-bold text-white block text-sm font-condensed uppercase tracking-wider">ECDSA P-256</span>
                <span className="text-zinc-500 font-sans">Native Web Crypto</span>
              </div>
              <div>
                <span className="font-bold text-white block text-sm font-condensed uppercase tracking-wider">0% Diagnosis Leak</span>
                <span className="text-zinc-500 font-sans">Minimal Attestation</span>
              </div>
              <div>
                <span className="font-bold text-white block text-sm font-condensed uppercase tracking-wider">Time-Bound & Revocable</span>
                <span className="text-zinc-500 font-sans">Padded Share Codes</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Formal Monochrome Attestation Certificate Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 p-6 text-zinc-100 shadow-2xl font-sans">
              
              {/* Formal Stamp */}
              <div className="absolute top-4 right-4 border-2 border-white rounded px-3 py-1 font-condensed text-[10px] font-bold text-white uppercase tracking-widest bg-black">
                ✓ P-256 AUTHENTICATED
              </div>

              <div className="space-y-4">
                <div className="border-b border-zinc-800 pb-3">
                  <span className="font-condensed text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                    Medical Attestation Certificate
                  </span>
                  <h3 className="font-sans font-bold text-base text-white mt-0.5">
                    Summit Women’s Health & Reproductive Care
                  </h3>
                  <p className="font-sans text-[11px] text-zinc-400">
                    Dr. Elena Rostova, MD • Medical Reg: GMC-8849201
                  </p>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-500 font-medium">Certified Holder:</span>
                    <span className="font-bold text-white">Sarah Jenkins (EMP-9021)</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-500 font-medium">Leave Category:</span>
                    <span className="font-mono text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      STATUTORY_MATERNITY
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-500 font-medium">Authorized Window:</span>
                    <span className="font-bold font-mono text-white">Sep 16 – Oct 07, 2026</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500 font-medium">Occupational Status:</span>
                    <span className="font-bold text-zinc-200">Unfit (Rest Mandated)</span>
                  </div>
                </div>

                {/* Redacted Raw Note Demonstration */}
                <div className="mt-4 pt-3 border-t border-zinc-800 bg-black p-3 rounded-lg border border-zinc-800 text-[11px] font-mono leading-relaxed space-y-1">
                  <div className="text-[10px] font-condensed font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Underlying Clinical Record</span>
                    <span className="text-white font-mono text-[10px]">0% DISCLOSED TO HR</span>
                  </div>
                  <p className="text-zinc-400">
                    Patient diagnosed with <span className="redacted-bar">Early Gestation Hyperemesis</span>.
                  </p>
                  <p className="text-zinc-400">
                    Ultrasound confirms <span className="redacted-bar">Subchorionic Hematoma 1.8cm</span> following <span className="redacted-bar">IVF-ICSI Cycle #3</span>.
                  </p>
                  <p className="text-zinc-400">
                    Prescribed <span className="redacted-bar">Progesterone 200mg</span> and IV hydration.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Hash: 8f4a...29c1 (SHA-256)</span>
                  <span className="text-zinc-300 font-bold">100% Tamper Proof</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* The 3 Core Roles Breakdown */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-sans">
            How Vouch Works in 3 Steps
          </h2>
          <p className="text-sm text-zinc-400">
            A formal triangular selective disclosure architecture linking Medical Authorities, Employees, and Corporate HR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Clinic */}
          <Link 
            href="/issuer"
            className="group p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-white transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-condensed font-bold text-zinc-400 uppercase tracking-wider">Step 1 • Issuer</span>
                <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">
                  Clinic Signs Attestation
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Doctor enters leave parameters and signs the minimal payload with their browser-native ECDSA P-256 key. The diagnosis remains strictly confidential inside the clinic.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-2 text-xs font-semibold text-white group-hover:translate-x-1 transition-transform font-condensed uppercase tracking-wider">
              <span>Open Issuer Studio</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: Employee */}
          <Link 
            href="/employee"
            className="group p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-white transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-condensed font-bold text-zinc-400 uppercase tracking-wider">Step 2 • Holder</span>
                <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">
                  Employee Selective Share
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  The employee stores their credential in their private wallet. When applying for leave, they configure privacy toggles and generate a short-lived revocable share code.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-2 text-xs font-semibold text-white group-hover:translate-x-1 transition-transform font-condensed uppercase tracking-wider">
              <span>Open Employee Vault</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 3: HR */}
          <Link 
            href="/hr"
            className="group p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-white transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-11 h-11 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-condensed font-bold text-zinc-400 uppercase tracking-wider">Step 3 • Verifier</span>
                <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">
                  HR Cryptographic Verification
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  HR enters the share code. The browser verifies the cryptographic signature against the Trusted Issuer Registry. Leave is approved with 0% health data exposure.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-2 text-xs font-semibold text-white group-hover:translate-x-1 transition-transform font-condensed uppercase tracking-wider">
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
              <EyeOff className="w-5 h-5 text-white" />
              <h2 className="text-2xl font-bold text-white font-sans">Live Redaction & Zero-Exposure Sandbox</h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Compare what a conventional medical report PDF upload leaks to HR vs what Vouch protects.
            </p>
          </div>

          <Link
            href="/employee/redact"
            className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-zinc-300 font-condensed uppercase tracking-wider"
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
