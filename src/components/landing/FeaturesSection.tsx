'use client';

import React from 'react';
import { Sun, Palette, Layers, Grid } from 'lucide-react';

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
      title: 'SOFT SHADOWS',
      subtitle: 'Zero-Knowledge Proofs',
      desc: 'Subtle shadows create the illusion of depth. In Vouch, cryptographic zero-knowledge attestations prove statutory leave duration without ever revealing ICD-10 medical codes, diagnosis descriptions, or clinic names.',
      icon: Sun,
    },
    {
      num: '02',
      title: 'MONOCHROMATIC COLOR',
      subtitle: 'Minimal Data Footprint',
      desc: 'Work with a single base color and its shades. By stripping away multi-page doctor notes, clinic letterheads, and prescription slips, HR systems store only an unforgeable, clean eligibility token.',
      icon: Palette,
    },
    {
      num: '03',
      title: 'RAISED & PRESSED',
      subtitle: 'Append-Only Audit Ledger',
      desc: 'Elements appear to raise up or press down. Every verification event is cryptographically sealed onto a SHA-256 hash-chained receipt ledger that employees inspect in their private wallet.',
      icon: Layers,
    },
    {
      num: '04',
      title: 'MINIMAL UI',
      subtitle: '1-Click Statutory Verification',
      desc: 'Clean, simple and focused on what matters. HR administrators receive a decisive, tamper-proof PASS/FAIL confirmation in seconds, completely exempt from PHI retention risks and compliance liability.',
      icon: Grid,
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
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-slate-600">
              CORE PROTOCOL PILLARS
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: NEU.textPri }}
          >
            FOUR PILLARS OF NEUMORPHIC PRIVACY
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium">
            Form follows function. The four tenets of soft physical depth translated into
            uncompromising cryptographic healthcare privacy.
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
                  <span>SPEC COMPLIANT</span>
                  <span className="text-emerald-600 font-bold">✓ PASS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
