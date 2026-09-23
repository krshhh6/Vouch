'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  Building2,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Share2,
  ShieldCheck,
  BellRing,
} from 'lucide-react';

const NEU = {
  raised: {
    backgroundColor: '#e8ecf4',
    boxShadow: '9px 9px 18px #c4cede, -9px -9px 18px #ffffff',
  },
  raisedSm: {
    backgroundColor: '#e8ecf4',
    boxShadow: '5px 5px 12px #c5cedd, -5px -5px 12px #ffffff',
  },
  convex: {
    background: 'linear-gradient(145deg, #f7faff, #d9e2ee)',
    boxShadow: '8px 8px 16px #c4cede, -8px -8px 16px #ffffff',
  },
  pressed: {
    backgroundColor: '#e6ebf3',
    boxShadow: 'inset 4px 4px 8px #c5cedd, inset -4px -4px 8px #ffffff',
  },
  accentBtn: {
    background: 'linear-gradient(145deg, #3b82f6, #2563eb)',
    color: '#ffffff',
    boxShadow: '6px 6px 16px rgba(37,99,235,0.35), -6px -6px 14px #ffffff',
  },
  textPri: '#192132',
};

export default function DemoSection() {
  const [shareCode, setShareCode] = useState('LG-8429');
  const [copied, setCopied] = useState(false);
  const [verifiedState, setVerifiedState] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [requestedDays, setRequestedDays] = useState(84);

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    setVerifiedState('verifying');
    setTimeout(() => {
      setVerifiedState('success');
    }, 800);
  };

  const steps = [
    {
      step: '01',
      title: 'Clinic signs',
      desc: 'Doctor issues an ECDSA P-256 signed credential with mathematical diagnosis scrubbing.',
      icon: Stethoscope,
      pill: 'ECDSA Signature',
    },
    {
      step: '02',
      title: 'Employee shares',
      desc: 'Worker generates an ephemeral share code with an automated expiration countdown.',
      icon: Share2,
      pill: 'Code: LG-8429',
    },
    {
      step: '03',
      title: 'HR verifies',
      desc: 'HR administrator enters the code for instant zero-knowledge policy predicate check.',
      icon: ShieldCheck,
      pill: '✓ Policy Pass',
    },
    {
      step: '04',
      title: 'Ledger seals',
      desc: 'Immutable receipt appended to the hash-chain without exposing private health data.',
      icon: BellRing,
      pill: 'Receipt Sealed',
    },
  ];

  return (
    <section id="demo" className="py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 block mb-2">
            04 • INTERACTIVE VERIFIER
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
            Interactive Verifier Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
            Simulate a zero-knowledge statutory leave verification from worker wallet to HR approval.
          </p>
        </div>

        {/* 4 Protocol Steps Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="p-5 rounded-3xl flex flex-col justify-between"
                style={NEU.raised}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-slate-400 font-bold">
                      {s.step}
                    </span>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-600"
                      style={NEU.raisedSm}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mb-1">
                    {s.title}
                  </h3>
                  <div className="text-[11px] font-mono text-blue-600 font-bold mb-2">
                    {s.pill}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Dual Terminal Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Worker Wallet Panel */}
          <div className="p-8 rounded-3xl space-y-6" style={NEU.raised}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-blue-600"
                  style={NEU.raisedSm}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-none">
                    Employee Private Wallet
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    ECDSA P-256 Web Crypto
                  </span>
                </div>
              </div>
              <span
                className="text-[10px] font-mono px-2.5 py-1 rounded-full text-emerald-600 font-bold"
                style={NEU.pressed}
              >
                STATUS: SIGNED
              </span>
            </div>

            <div className="p-5 rounded-2xl space-y-3" style={NEU.convex}>
              <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                <span className="uppercase tracking-wider text-[11px] font-semibold">Statutory Claim</span>
                <span className="text-blue-600 font-mono font-bold">NIST P-256</span>
              </div>
              <div className="text-lg font-bold text-slate-900">
                Maternity & Medical Leave Act
              </div>
              <div className="flex items-center justify-between pt-2 text-xs font-medium text-slate-600">
                <span>Entitlement Period:</span>
                <b className="font-mono text-blue-600 font-semibold">{requestedDays} Days</b>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Adjust Claim Duration</span>
                <span className="font-bold font-mono text-blue-600">{requestedDays} Days</span>
              </div>
              <input
                type="range"
                min="14"
                max="120"
                step="7"
                value={requestedDays}
                onChange={(e) => setRequestedDays(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl flex items-center justify-between" style={NEU.pressed}>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">
                  ACTIVE TIME-BOUND SHARE CODE
                </span>
                <span className="text-xl font-bold font-mono tracking-widest text-slate-900">
                  {shareCode}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                style={NEU.raisedSm}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* HR Verifier Terminal */}
          <div className="p-8 rounded-3xl space-y-6" style={NEU.raised}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-blue-600"
                  style={NEU.raisedSm}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-none">
                    HR Verification Terminal
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    Statutory Leave Audit Gateway
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">
                0% PHI INGESTION
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block">
                ENTER EMPLOYEE SHARE CODE
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 rounded-2xl font-mono text-base font-semibold text-slate-900 tracking-wider neu-input"
                />
                <button
                  onClick={handleVerify}
                  disabled={verifiedState === 'verifying'}
                  className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={NEU.accentBtn}
                >
                  {verifiedState === 'verifying' ? 'VERIFYING...' : 'VERIFY'}
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl space-y-3" style={NEU.pressed}>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                VERIFICATION RECEIPT (ZERO-KNOWLEDGE)
              </span>

              {verifiedState === 'success' ? (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> STATUTORY CRITERIA MET
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {requestedDays} DAYS APPROVED
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Cryptographic Hash:</span>
                      <span className="text-slate-800 font-mono font-semibold text-[11px]">e3b0c442...890b</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Diagnosis Records:</span>
                      <span className="text-emerald-700 font-mono font-bold text-[11px]">0 BYTES (SCRUBBED)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Doctor Clinic Identity:</span>
                      <span className="text-emerald-700 font-mono font-bold text-[11px]">ANONYMIZED KEY</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs font-medium">
                  Enter worker&apos;s code and click &quot;VERIFY&quot; to execute proof check.
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="font-mono text-[10px] tracking-wider uppercase">SHA-256 CHAINED</span>
              <span className="font-mono text-[10px] tracking-wider uppercase">AUDITABLE RECEIPT APPENDED</span>
            </div>
          </div>
        </div>

        {/* Action Link to Full Portal Demo */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={NEU.accentBtn}
          >
            <span>Launch Full Multi-Role Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/redaction-lab"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={NEU.raised}
          >
            <span>Test Redaction Lab</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
