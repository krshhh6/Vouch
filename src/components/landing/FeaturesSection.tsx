'use client';

import React from 'react';
import { ShieldCheck, Cpu, Database, UserCheck } from 'lucide-react';

const NEU = {
  raised: {
    backgroundColor: '#e8ecf4',
    boxShadow: '9px 9px 18px #c4cede, -9px -9px 18px #ffffff',
  },
  raisedSm: {
    backgroundColor: '#e8ecf4',
    boxShadow: '5px 5px 12px #c5cedd, -5px -5px 12px #ffffff',
  },
  textPri: '#192132',
};

export default function FeaturesSection() {
  const pillars = [
    {
      num: '01',
      title: 'ZERO-KNOWLEDGE VERIFICATION',
      subtitle: 'Cryptographic Predicate Proofs',
      desc: 'Prove statutory medical leave duration and entitlement validity to employers with mathematical certainty without ever exposing ICD-10 medical codes, clinical notes, or specialist clinic names.',
      icon: ShieldCheck,
    },
    {
      num: '02',
      title: 'ON-DEVICE CLIENT SANDBOX',
      subtitle: 'Local Document Parsing & Signing',
      desc: "Medical certificates and doctor attestations are parsed, scrubbed, and signed locally within the employee's browser sandbox using Web Crypto ECDSA P-256 keys. Raw PHI never leaves the user's device.",
      icon: Cpu,
    },
    {
      num: '03',
      title: 'TAMPER-EVIDENT AUDIT CHAIN',
      subtitle: 'Append-Only Hash Ledger',
      desc: 'Every leave verification event is cryptographically anchored onto an append-only, SHA-256 hash-chained receipt ledger in Neon Postgres, creating an unforgeable compliance record with zero health disclosures.',
      icon: Database,
    },
    {
      num: '04',
      title: 'WORKPLACE ANTI-BIAS SHIELD',
      subtitle: 'Eliminating Diagnostic Stigma',
      desc: 'Shields employees from early pregnancy career penalties, chronic illness bias, and mental health stigmas by preventing invasive health disclosures before statutory approval thresholds.',
      icon: UserCheck,
    },
  ];

  return (
    <section id="pillars" className="py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={NEU.raisedSm}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-slate-700">
              CORE PROTOCOL GUARANTEES
            </span>
          </div>
          <h2
            className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-wide uppercase"
            style={{ color: NEU.textPri }}
          >
            FOUR PILLARS OF MEDICAL LEAVE PRIVACY
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium">
            Mathematical certainty without compromise. Engineered to protect employees from diagnosis exposure, pregnancy penalties, and permanent HR data retention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.num}
                className="p-6 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]"
                style={NEU.raised}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black font-sans text-slate-400">
                      {p.num}
                    </span>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600"
                      style={NEU.raisedSm}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-base font-black tracking-tight text-slate-800 mb-1">
                    {p.title}
                  </h3>
                  <div className="text-[11px] font-mono text-blue-600 font-bold mb-3">
                    {p.subtitle}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 font-medium">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>PROTOCOL SPEC</span>
                  <span className="text-emerald-600 font-bold">✓ VERIFIED</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
