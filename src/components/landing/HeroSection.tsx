'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Check,
  Lock,
  ArrowRight,
  EyeOff,
  UserCheck,
  Building2,
  Stethoscope,
  KeyRound,
  FileCheck2,
  Database,
  Cpu,
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
  pressedDeep: {
    backgroundColor: '#e2e8f1',
    boxShadow: 'inset 6px 6px 12px #bfc9d8, inset -6px -6px 12px #ffffff',
  },
  btnEmployee: {
    background: 'linear-gradient(145deg, #059669, #047857)',
    color: '#ffffff',
    boxShadow: '6px 6px 16px rgba(5,150,105,0.35), -6px -6px 14px #ffffff',
  },
  btnHr: {
    background: 'linear-gradient(145deg, #2563eb, #1d4ed8)',
    color: '#ffffff',
    boxShadow: '6px 6px 16px rgba(37,99,235,0.35), -6px -6px 14px #ffffff',
  },
  textPri: '#192132',
  blue: '#3b82f6',
};

export default function HeroSection() {
  const [dialDays, setDialDays] = useState(84);
  const [zkpMode, setZkpMode] = useState(true);
  const [activeRole, setActiveRole] = useState<'employee' | 'hr' | 'clinic'>('employee');
  const [signatureVerified, setSignatureVerified] = useState(true);

  const dialRotation = ((dialDays - 50) / 62) * 135;

  return (
    <section id="overview" className="py-12 sm:py-20 px-4 sm:px-8 overflow-hidden bg-[#e8ecf4]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Left Column: Monumental Typographic Architecture */}
        <div className="flex-1 w-full text-center lg:text-left">
          
          {/* Status Indicator Pill */}
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6"
            style={NEU.raisedSm}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-700">
              ZERO-KNOWLEDGE SELECTIVE-DISCLOSURE PROTOCOL
            </span>
          </div>

          {/* Monumental Neumorphic Title */}
          <div className="mb-4">
            <h1
              className="font-heading text-4xl sm:text-6xl lg:text-[4.8rem] font-extrabold tracking-tight leading-[0.98] select-none uppercase"
              style={{ color: NEU.textPri }}
            >
              VOUCH
              <br />
              <span className="text-blue-600">PROTOCOL</span>
            </h1>
          </div>

          <div className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-8">
            MATHEMATICAL CERTAINTY • ZERO PHI EXPOSURE
          </div>

          {/* Tactile Raised Manifesto Card */}
          <div className="p-6 sm:p-8 rounded-3xl mb-8 transition-all" style={NEU.raised}>
            <h2
              className="text-xl sm:text-2xl font-bold mb-3 tracking-tight uppercase font-heading"
              style={{ color: NEU.textPri }}
            >
              PROVE LEAVE. PROTECT YOUR DIAGNOSIS.
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
              Traditional doctor certificates expose sensitive health diagnoses, pregnancy stages, and mental health treatments to employer HR files. Vouch replaces raw document handoffs with <b>client-side Web Crypto attestations</b> — proving statutory leave eligibility with mathematical certainty and <b>0.0% health data leakage</b>.
            </p>
          </div>

          {/* Primary Role Launch Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
            <Link
              href="/employee"
              className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={NEU.btnEmployee}
            >
              <UserCheck className="w-4 h-4" />
              <span>Launch Employee Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/hr"
              className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={NEU.btnHr}
            >
              <Building2 className="w-4 h-4" />
              <span>Launch HR Verifier</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cryptographic Trust Badges */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {[
              'Web Crypto ECDSA P-256',
              '0.0% PHI Leakage Verified',
              'Neon Lakebase Ledger',
              'DPDP Act 2023 Aligned',
            ].map((badge) => (
              <div
                key={badge}
                className="text-[11px] font-medium text-slate-700 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5"
                style={NEU.raisedSm}
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Physical Neumorphic Cryptographic Console */}
        <div className="flex-1 w-full flex justify-center">
          <div className="w-full max-w-md space-y-5">
            
            {/* Top Row: Entitlement Days & Interactive Rotary Knob */}
            <div className="grid grid-cols-2 gap-5 items-stretch">
              
              {/* Entitlement Days Readout */}
              <div className="p-6 rounded-3xl flex flex-col justify-between" style={NEU.raised}>
                <div>
                  <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-1">
                    STATUTORY
                  </span>
                  <div
                    className="text-6xl font-black font-heading leading-none tracking-tighter"
                    style={{
                      color: NEU.textPri,
                      textShadow: '2px 2px 4px rgba(255,255,255,0.8), -2px -2px 4px rgba(186,197,214,0.7)',
                    }}
                  >
                    {dialDays}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                    Eligible Entitlement
                  </span>
                  <span className="text-xs font-bold text-emerald-700 tracking-wide font-mono">
                    MATHEMATICALLY VERIFIED
                  </span>
                </div>
              </div>

              {/* 3D Tactile Rotary Knob / Dial */}
              <div className="p-5 rounded-3xl flex flex-col items-center justify-center relative select-none" style={NEU.raised}>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Rotate Leave Dial
                </span>

                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-300 pointer-events-none" />

                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center cursor-pointer select-none transition-transform duration-200"
                    style={{
                      ...NEU.convex,
                      transform: `rotate(${dialRotation}deg)`,
                    }}
                    onClick={() => {
                      const steps = [14, 28, 56, 84, 112];
                      const nextIdx = (steps.indexOf(dialDays) + 1) % steps.length;
                      setDialDays(steps[nextIdx] || 84);
                    }}
                    title="Click knob to cycle statutory leave days"
                  >
                    <div
                      className="absolute top-2 w-3.5 h-3.5 rounded-full"
                      style={NEU.pressed}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mx-auto mt-1" />
                    </div>
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-black text-slate-800 leading-none">
                      {dialDays}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Days
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Middle Row: Role Selector & Diagnosis Scrubbing Switch */}
            <div className="grid grid-cols-2 gap-5 items-center">
              
              {/* Role Quick Selector */}
              <div className="p-3 rounded-2xl flex items-center justify-around" style={NEU.raised}>
                <button
                  onClick={() => setActiveRole('employee')}
                  title="Employee Role"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeRole === 'employee' ? 'text-emerald-600' : 'text-slate-500'
                  }`}
                  style={activeRole === 'employee' ? NEU.pressed : NEU.raisedSm}
                >
                  <UserCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveRole('hr')}
                  title="HR Verifier Role"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeRole === 'hr' ? 'text-blue-600' : 'text-slate-500'
                  }`}
                  style={activeRole === 'hr' ? NEU.pressed : NEU.raisedSm}
                >
                  <Building2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveRole('clinic')}
                  title="Clinic Issuer Role"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    activeRole === 'clinic' ? 'text-teal-600' : 'text-slate-500'
                  }`}
                  style={activeRole === 'clinic' ? NEU.pressed : NEU.raisedSm}
                >
                  <Stethoscope className="w-4 h-4" />
                </button>
              </div>

              {/* Physical Zero-Knowledge Toggle */}
              <div className="p-3 rounded-2xl flex items-center justify-between" style={NEU.raised}>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  {zkpMode ? 'Zero-PHI Mode' : 'Raw PHI Mode'}
                </span>
                <div
                  onClick={() => setZkpMode(!zkpMode)}
                  className="w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300"
                  style={NEU.pressed}
                  title="Toggle Zero-PHI cryptographic redaction"
                >
                  <div
                    className={`w-6 h-6 rounded-full transition-transform duration-300 flex items-center justify-center ${
                      zkpMode ? 'translate-x-6 bg-emerald-600 text-white' : 'translate-x-0 bg-slate-300 text-slate-600'
                    }`}
                    style={NEU.raisedSm}
                  >
                    {zkpMode ? <Lock className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </div>
                </div>
              </div>

            </div>

            {/* Physical Recessed LCD Cryptographic Status Well */}
            <div className="p-4 rounded-2xl space-y-2.5" style={NEU.raised}>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>ECDSA Cryptographic Key Status</span>
                </span>
                <span className="text-emerald-700 flex items-center gap-1 font-mono font-bold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  P-256 VALID
                </span>
              </div>

              {/* Recessed Terminal Well */}
              <div className="p-3.5 rounded-xl text-xs space-y-1.5 text-slate-700" style={NEU.pressed}>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Issuer Key:</span>
                  <span className="font-bold font-mono text-[11px] text-slate-900">0x7F8C...D34B</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Hash-Chained Audit:</span>
                  <span className="font-bold font-mono text-[11px] text-blue-700">GENESIS → BLOCK_8429</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Clinical PHI Leakage:</span>
                  <span className="font-bold font-mono text-[11px] text-emerald-700">0.00% (VERIFIED)</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: 2 Concrete Security Proof Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl flex items-center gap-3" style={NEU.raised}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-600" style={NEU.raisedSm}>
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    Tamper-Proof
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Neon Postgres
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl flex items-center gap-3" style={NEU.raised}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600" style={NEU.raisedSm}>
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    On-Device
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Client Sandbox
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
