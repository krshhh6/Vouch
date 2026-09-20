'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  UserCheck, 
  Building2, 
  Check, 
  Share2, 
  ShieldCheck, 
  ArrowRight,
  Lock,
  FileCheck2
} from 'lucide-react';
import Card from './Card';

export default function HowItWorksSection() {
  const roles = [
    {
      title: 'Clinic Issuer',
      roleKey: 'clinic',
      href: '/clinic',
      icon: Stethoscope,
      description: 'Sign minimal attestations (no diagnosis exposure) using licensed Web Crypto keys.',
      badge: 'DOCTOR / CLINIC',
    },
    {
      title: 'Employee Holder',
      roleKey: 'employee',
      href: '/employee',
      icon: UserCheck,
      description: 'Hold credentials in private wallet, generate time-bound share codes, see verifications.',
      badge: 'WORKER WALLET',
    },
    {
      title: 'HR Verifier',
      roleKey: 'hr',
      href: '/hr',
      icon: Building2,
      description: 'Verify statutory eligibility, approve leaves instantly with zero health data access.',
      badge: 'BENEFITS ADMIN',
    },
  ];

  return (
    <section id="how-it-works" className="bg-navy-900 text-white py-16 sm:py-24 px-6 sm:px-8 border-t border-navy-800">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
        
        {/* LEFT: Content & 3 Roles */}
        <div className="flex-1 w-full">
          <div className="text-sm text-primary-400 font-semibold mb-4 tracking-wider uppercase font-mono">
            02 &bull; HOW IT WORKS
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight font-sans">
            Three roles.
            <br />
            <span className="text-primary-400">Zero medical data.</span>
          </h2>

          <p className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed font-sans">
            Doctor signs attestation &rarr; Employee shares code &rarr; HR verifies proof. 
            No PDFs, no diagnosis codes, no clinic names in HR&apos;s database.
          </p>
          
          {/* Three-column roles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <Card key={r.title} variant="dark" className="flex flex-col justify-between group">
                  <div>
                    <div className="w-12 h-12 bg-primary-600/20 border border-primary-500/30 rounded-lg flex items-center justify-center mb-4 text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono text-primary-400 uppercase tracking-wider block mb-1 font-semibold">
                      {r.badge}
                    </span>
                    <h3 className="font-semibold text-base mb-2 text-white font-sans">{r.title}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      {r.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-navy-700/60">
                    <Link
                      href={r.href}
                      className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 group-hover:underline"
                    >
                      <span>Open Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Visual Flow Diagram */}
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="bg-navy-800/90 rounded-2xl border border-navy-700 p-6 sm:p-8 w-full max-w-lg shadow-xl space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-navy-700 text-xs font-mono text-gray-400">
              <span className="text-primary-400 font-bold uppercase tracking-wider">Protocol Pipeline</span>
              <span>APPEND-ONLY HASH CHAIN</span>
            </div>

            {/* Horizontal Step Sequence */}
            <div className="flex items-center justify-between relative py-2">
              
              {/* Step 1 */}
              <div className="text-center z-10 flex-1">
                <div className="w-14 h-14 bg-primary-600 text-white rounded-full mx-auto flex items-center justify-center mb-2 shadow-md ring-4 ring-navy-800">
                  <Check className="w-7 h-7" />
                </div>
                <p className="text-xs font-bold text-white font-sans">1. Sign</p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Clinic Key</p>
              </div>

              {/* Connecting Line 1 */}
              <div className="flex-1 h-0.5 bg-primary-500/40 relative -mt-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 animate-pulse" />
              </div>

              {/* Step 2 */}
              <div className="text-center z-10 flex-1">
                <div className="w-14 h-14 bg-primary-600 text-white rounded-full mx-auto flex items-center justify-center mb-2 shadow-md ring-4 ring-navy-800">
                  <Share2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-white font-sans">2. Share</p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Time-Bound</p>
              </div>

              {/* Connecting Line 2 */}
              <div className="flex-1 h-0.5 bg-primary-500/40 relative -mt-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 animate-pulse" />
              </div>

              {/* Step 3 */}
              <div className="text-center z-10 flex-1">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-full mx-auto flex items-center justify-center mb-2 shadow-md ring-4 ring-navy-800">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <p className="text-xs font-bold text-white font-sans">3. Verify</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">0% Leakage</p>
              </div>

            </div>

            {/* Protocol Guarantees Breakdown inside Diagram Card */}
            <div className="space-y-2.5 pt-2 font-mono text-xs text-gray-300">
              <div className="p-3 bg-navy-950/80 rounded-xl border border-navy-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-white font-medium">HR Receives:</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">Eligibility Boolean (✓ Valid)</span>
              </div>

              <div className="p-3 bg-navy-950/80 rounded-xl border border-navy-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                  <span className="text-white font-medium">HR Blocked From:</span>
                </div>
                <span className="text-[11px] text-rose-400 font-semibold line-through">ICD-10, Clinic, Meds</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
