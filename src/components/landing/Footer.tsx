'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white border-t border-navy-800 py-12 px-6 sm:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
                <ShieldCheck className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-bold text-lg tracking-wide text-white">VOUCH</span>
              <span className="text-[10px] font-mono text-gray-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700">
                v2026.1
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-400 max-w-md leading-relaxed">
              Privacy-preserving medical and statutory leave attestation protocol. 
              Eliminating protected health information leakage in corporate HR systems through zero-knowledge verifiable credentials.
            </p>

            <div className="pt-2 text-[11px] font-mono text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Web Crypto ECDSA P-256 &bull; Neon Lakebase Postgres</span>
            </div>
          </div>

          {/* Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-primary-400 uppercase tracking-wider font-mono">
              Role Portals
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link href="/employee" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Employee Portal</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </Link>
              </li>
              <li>
                <Link href="/hr" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>HR Verifier Portal</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </Link>
              </li>
              <li>
                <Link href="/clinic" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Clinic Issuer Portal</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Role Switcher Login</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical & Audit */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-primary-400 uppercase tracking-wider font-mono">
              Research & Labs
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link href="/redaction-lab" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Interactive Redaction Lab</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </Link>
              </li>
              <li>
                <Link href="/overview" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Architecture Overview</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </Link>
              </li>
              <li>
                <Link href="/research-guide" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Privacy Research Guide</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </Link>
              </li>
              <li>
                <Link href="/db-inspector" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Lakebase DB Inspector</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
          <p>
            &copy; {new Date().getFullYear()} Vouch Protocol. Engineered for Enterprise Privacy.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>DPDP Act 2023 Aligned</span>
            <span>&bull;</span>
            <span>Maternity Benefit Act 1961</span>
            <span>&bull;</span>
            <span>Zero PHI Retention</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
