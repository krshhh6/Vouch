'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowUpRight, Sparkles, ArrowDown } from 'lucide-react';

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

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 py-16 px-4 sm:px-8 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto space-y-14">
        
        {/* Privacy Charter & Protocol Emblem Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
          {/* Vouch Protocol Privacy Charter */}
          <div className="p-8 rounded-3xl max-w-lg w-full relative" style={NEU.raised}>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-emerald-600 mb-4"
              style={NEU.pressed}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed mb-3">
              No worker should ever be forced to forfeit clinical confidentiality in order to claim statutory leave.
            </p>
            <span className="text-xs font-mono tracking-widest text-blue-600 uppercase font-bold block">
              — VOUCH PROTOCOL SPECIFICATION
            </span>
            <div className="mt-4 pt-3 border-t border-slate-200/50 text-xs text-slate-500 font-medium leading-relaxed">
              Zero Protected Health Information (PHI) retained in corporate databases. Verifiable credentials backed by Web Crypto ECDSA P-256 signatures.
            </div>
          </div>

          {/* Concentric Protocol Emblem & Cryptographic Assurance Pill */}
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center" style={NEU.raised}>
              <div className="absolute inset-2 rounded-full border border-dashed border-slate-300 pointer-events-none" />
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={NEU.pressed}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-emerald-600" style={NEU.raisedSm}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="px-6 py-3 rounded-full flex items-center gap-3 transition-transform hover:scale-105" style={NEU.raised}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-emerald-600" style={NEU.pressed}>
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-mono font-bold tracking-wider">
                <span className="text-slate-500 uppercase">ZERO PHI. </span>
                <span className="text-emerald-600 uppercase">MATHEMATICAL CERTAINTY.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Links Navigation Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-slate-200/60">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={NEU.raisedSm}>
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-black text-lg tracking-[0.2em] text-slate-800">
                VOUCH PROTOCOL
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              Privacy-preserving medical and statutory leave attestation protocol.
              Eliminating protected health information leakage in corporate HR systems through zero-knowledge verifiable credentials.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              ECDSA P-256 Web Crypto &bull; Neon Lakebase Postgres &bull; Append-Only Hash Chain
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-3">
              Role Portals
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <Link href="/employee" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>Employee Portal</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/hr" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>HR Verifier Portal</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/clinic" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>Clinic Issuer Portal</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>Sign In / Session Switch</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-3">
              Protocol Labs
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <Link href="/redaction-lab" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>Redaction Lab</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/db-inspector" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>Database Inspector</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/research-guide" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>Research Guide</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 pt-6 border-t border-slate-200/40">
          <span>&copy; {year} Vouch Protocol. MIT License. Neumorphic Edition.</span>
          <span>DPDP Act 2023 &bull; Maternity Benefit Act 1961 &bull; Zero PHI Retention</span>
        </div>
      </div>
    </footer>
  );
}
