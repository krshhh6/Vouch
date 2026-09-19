'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Stethoscope, 
  UserCheck, 
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function PortalHomePage() {
  return (
    <div className="w-full bg-[#0A101D] text-slate-100 min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Main Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Pitch & Portal CTAs */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-[#111C2E] border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Statutory Medical Leave Verification
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-bold text-white tracking-tight leading-[1.08] font-condensed uppercase">
                Prove your leave.<br />
                Protect your diagnosis.
              </h1>

              <p className="text-base text-slate-300 leading-relaxed font-sans max-w-xl">
                Vouch lets employees verify statutory medical, maternity, surgery, or caregiving leave eligibility to HR using digital signatures — completely eliminating raw medical records, diagnostic exposure, and workplace discrimination.
              </p>
            </div>

            {/* Portal Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/clinic"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold uppercase tracking-wider text-xs transition-colors shadow-lg"
              >
                <span>ENTER CLINIC PORTAL →</span>
              </Link>
              
              <Link
                href="/employee"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#111C2E] hover:bg-[#1E293B] text-slate-200 border border-slate-700 font-mono font-bold uppercase tracking-wider text-xs transition-colors"
              >
                <span>OPEN EMPLOYEE PORTAL →</span>
              </Link>
            </div>

            {/* Three Value Stat Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800">
              <div className="p-4 rounded-lg bg-[#111C2E] border border-slate-800/80 space-y-1">
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">Digital Signatures</div>
                <div className="text-[11px] text-slate-400">P-256 Authenticated</div>
              </div>

              <div className="p-4 rounded-lg bg-[#111C2E] border border-slate-800/80 space-y-1">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">0% Diagnosis Leak</div>
                <div className="text-[11px] text-slate-400">Privacy Guaranteed</div>
              </div>

              <div className="p-4 rounded-lg bg-[#111C2E] border border-slate-800/80 space-y-1">
                <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">24h Share Codes</div>
                <div className="text-[11px] text-slate-400">Time-Bound &amp; Secure</div>
              </div>
            </div>

          </div>

          {/* Right Column: Certificate Preview Card */}
          <div className="lg:col-span-6">
            <div className="parchment-sheet rounded-xl p-7 text-[#0F172A] font-sans relative border border-[#EDE6D6] shadow-2xl space-y-6">
              
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-[#EDE6D6] pb-4">
                <div>
                  <span className="text-[11px] font-mono font-bold tracking-wider text-slate-600 uppercase">
                    MEDICAL ATTESTATION CERTIFICATE
                  </span>
                  <h3 className="text-xl font-bold text-[#0F172A] mt-1">
                    Summit Women&apos;s Health Center
                  </h3>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    Dr. Elena Rostova, MD • License: GMC-6849201
                  </p>
                </div>

                <div className="official-stamp text-xs font-bold text-[#4A7C59] border-[#4A7C59] flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4A7C59]" />
                  <span>AUTHENTICATED</span>
                </div>
              </div>

              {/* Minimal Claims Disclosed to HR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white/80 p-3 rounded-md border border-[#EDE6D6] space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-condensed">
                    Certified Holder
                  </span>
                  <p className="font-semibold text-sm text-[#0F172A]">
                    Sarah Jenkins <span className="font-mono text-xs text-slate-600">(EMP-9021)</span>
                  </p>
                </div>

                <div className="bg-white/80 p-3 rounded-md border border-[#EDE6D6] space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-condensed">
                    Leave Category
                  </span>
                  <p className="font-mono font-bold text-sm text-[#31523B]">
                    STATUTORY_MATERNITY
                  </p>
                </div>

                <div className="bg-white/80 p-3 rounded-md border border-[#EDE6D6] space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-condensed">
                    Authorized Window
                  </span>
                  <p className="font-mono font-semibold text-xs text-[#0F172A]">
                    Sep 16 – Oct 07, 2026
                  </p>
                </div>

                <div className="bg-white/80 p-3 rounded-md border border-[#EDE6D6] space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-condensed">
                    Occupational Status
                  </span>
                  <p className="font-semibold text-xs text-[#0F172A]">
                    Unfit (Rest Advised)
                  </p>
                </div>
              </div>

              {/* Underlying Clinical Record Box */}
              <div className="rounded-lg border border-[#D5CDBC] bg-[#FAF7F0] p-4 space-y-3">
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
                    <span>Pelvic scan confirms</span>
                    <span className="redacted-bar">viable intrauterine pregnancy at 11w4d</span>
                    <span>[following]</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span>Prescribed</span>
                    <span className="redacted-bar">pelvic rest and hydration regimen</span>
                    <span>as ordered.</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EDE6D6] flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Record Security: <strong className="text-slate-800">Stored on Doctor's Device Only</strong></span>
                  <span className="font-bold text-[#31523B]">100% Private</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 3 Dedicated Portal Workspaces */}
        <div className="pt-12 border-t border-slate-800 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Role-Based Workspaces
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-condensed uppercase tracking-wider">
              Choose Your Portal
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Select your role to issue certificates, manage your personal leave wallet, or verify statutory eligibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Clinic Portal Card */}
            <Link 
              href="/clinic" 
              className="p-6 rounded-xl bg-[#111C2E] border border-slate-800 hover:border-emerald-500 transition-all space-y-4 group shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-[#0A101D] border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">WORKSPACE 1</span>
                <span className="text-[10px] text-emerald-400 font-mono">Doctors &amp; Clinics</span>
              </div>
              <h3 className="text-lg font-bold text-white font-condensed uppercase tracking-wider">
                1. Clinic Portal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Sign statutory leave proofs in 30 seconds. Attach medical documents for your records that stay strictly on your device and are never sent to HR.
              </p>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-2">
                <span>Enter Clinic Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* 2. Employee Portal Card */}
            <Link 
              href="/employee" 
              className="p-6 rounded-xl bg-[#111C2E] border border-slate-800 hover:border-emerald-500 transition-all space-y-4 group shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-[#0A101D] border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">WORKSPACE 2</span>
                <span className="text-[10px] text-emerald-400 font-mono">Workers &amp; Applicants</span>
              </div>
              <h3 className="text-lg font-bold text-white font-condensed uppercase tracking-wider">
                2. Employee Portal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Access your personal credential wallet. Generate 24-hour QR codes and share links for HR, and receive live approval notifications.
              </p>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-2">
                <span>Access Employee Wallet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* 3. HR Verifier Portal Card */}
            <Link 
              href="/hr" 
              className="p-6 rounded-xl bg-[#111C2E] border border-slate-800 hover:border-emerald-500 transition-all space-y-4 group shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-[#0A101D] border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">WORKSPACE 3</span>
                <span className="text-[10px] text-emerald-400 font-mono">HR &amp; Benefits</span>
              </div>
              <h3 className="text-lg font-bold text-white font-condensed uppercase tracking-wider">
                3. HR Verifier Portal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Verify employee share codes against statutory policies in one click. Review the pending queue and issue decisions without holding raw medical records.
              </p>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform pt-2">
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
