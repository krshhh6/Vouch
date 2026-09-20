'use client';

import React from 'react';
import Link from 'next/link';
import { Stethoscope, UserCheck, Building2, ArrowUpRight } from 'lucide-react';

const NEU = {
  raised: {
    backgroundColor: '#e8ecf4',
    boxShadow: '9px 9px 18px #c4cede, -9px -9px 18px #ffffff',
  },
  raisedSm: {
    backgroundColor: '#e8ecf4',
    boxShadow: '5px 5px 12px #c5cedd, -5px -5px 12px #ffffff',
  },
  pressed: {
    backgroundColor: '#e6ebf3',
    boxShadow: 'inset 4px 4px 8px #c5cedd, inset -4px -4px 8px #ffffff',
  },
  textPri: '#192132',
};

export default function HowItWorksSection() {
  const roles = [
    {
      role: 'Clinic Issuer',
      badge: 'DOCTOR / CLINIC',
      href: '/clinic',
      icon: Stethoscope,
      desc: 'Licensed practitioner signs a minimal attestation with Web Crypto keys. Diagnosis codes are mathematically scrubbed before signing.',
    },
    {
      role: 'Worker Wallet',
      badge: 'EMPLOYEE HOLDER',
      href: '/employee',
      icon: UserCheck,
      desc: "Credential is held locally on the employee's device. The worker generates a short-lived 6-digit share code when requesting leave.",
    },
    {
      role: 'HR Verifier',
      badge: 'BENEFITS ADMIN',
      href: '/hr',
      icon: Building2,
      desc: 'HR enters the code to instantly verify statutory days with cryptographic certainty. No sensitive clinical data ever touches corporate systems.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-blue-600 block mb-2">
            02 • THREE ROLES, ZERO LEAKAGE
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-wide uppercase">
            How The Protocol Flows
          </h2>
          <p className="mt-2 text-sm text-slate-600 font-medium">
            Doctor signs → Employee shares → HR verifies. No diagnosis codes, no clinic names stored.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((r, i) => {
            const Icon = r.icon;
            return (
              <div
                key={r.role}
                className="p-7 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]"
                style={NEU.raised}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600"
                      style={NEU.raisedSm}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-black text-slate-400">
                      STEP 0{i + 1}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-bold block mb-1">
                    {r.badge}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 mb-2">
                    {r.role}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600 font-medium">
                    {r.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/50">
                  <Link
                    href={r.href}
                    className="text-xs font-bold text-blue-600 flex items-center gap-1.5 hover:text-blue-700 transition-colors"
                  >
                    <span>Open {r.role}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Verification Ledger Boundary Separation Table */}
        <div className="p-8 rounded-3xl" style={NEU.raised}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200/60">
            <div>
              <h3 className="text-lg font-black text-slate-800">
                Protocol Boundary Separation
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Zero Personal Health Information (PHI) crosses organizational perimeters
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 font-bold border border-emerald-500/20">
                ✓ ZERO-KNOWLEDGE
              </span>
              <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-blue-500/10 text-blue-700 font-bold border border-blue-500/20">
                ECDSA P-256
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-2xl flex items-center justify-between" style={NEU.pressed}>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-700">What HR Receives</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">
                Binary Leave Pass (84 Days)
              </span>
            </div>

            <div className="p-4 rounded-2xl flex items-center justify-between" style={NEU.pressed}>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-slate-700">What HR Is Blocked From</span>
              </div>
              <span className="text-xs font-mono font-bold text-rose-500 line-through">
                ICD-10, Clinic, Prescriptions
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
