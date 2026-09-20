'use client';

import React from 'react';
import { ShieldCheck, Check, Lock, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import Button from './Button';

export default function HeroSection() {
  return (
    <section id="overview" className="bg-navy-900 text-white py-16 sm:py-24 px-6 sm:px-8 border-b border-navy-800 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
        
        {/* LEFT (45%): Text + CTA */}
        <div className="flex-1 w-full lg:max-w-xl">
          <div className="text-sm text-primary-400 font-semibold mb-4 tracking-wider uppercase font-mono">
            01 &bull; PRIVACY-PRESERVING PROTOCOL
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white font-sans">
            Prove your leave.
            <br />
            <span className="text-primary-400">Protect your diagnosis.</span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed font-sans">
            Vouch lets employees certify medical, pregnancy, or caregiving leave eligibility 
            to HR using cryptographic proofs &mdash; without exposing diagnosis, clinic name, or 
            medications to HR&apos;s database.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button href="/login" variant="primary" className="shadow-lg group">
              <span>Launch Interactive Demo</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button href="/redaction-lab" variant="secondary">
              Explore Redaction Lab
            </Button>
          </div>

          {/* Social Proof / Security Highlights */}
          <div className="mt-10 pt-6 border-t border-navy-800 flex flex-wrap items-center gap-6 text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary-400" />
              <span>ECDSA P-256 Web Crypto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Zero-PHI Stored</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary-400" />
              <span>DPDP & Maternity Act Aligned</span>
            </div>
          </div>
        </div>

        {/* RIGHT (55%): Diagram / Phone Mockup */}
        <div className="flex-1 w-full flex items-center justify-center">
          
          {/* Phone Mockup Frame */}
          <div className="relative w-full max-w-sm rounded-[2.5rem] p-4 bg-navy-950 border-4 border-navy-700/70 shadow-2xl backdrop-blur-sm">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-navy-800 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-3 h-3 bg-navy-950 rounded-full"></div>
            </div>

            {/* Inner Phone Screen */}
            <div className="bg-navy-900 rounded-[1.8rem] p-5 border border-navy-800 space-y-4">
              
              {/* Phone Header */}
              <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center text-white">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">VOUCH WALLET</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  OFFLINE SECURE
                </span>
              </div>

              {/* Employee ID Banner */}
              <div className="flex items-center gap-3 p-3 bg-navy-800/80 rounded-xl border border-navy-700">
                <div className="w-10 h-10 rounded-full bg-primary-600/20 border border-primary-500/40 flex items-center justify-center text-primary-300 font-bold text-sm">
                  SJ
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">Sarah Jenkins</p>
                  <p className="text-xs text-gray-400 font-mono">EMP-9021 &bull; Operations</p>
                </div>
              </div>

              {/* Verified Credential Card */}
              <div className="bg-white text-navy-950 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-primary-700 bg-primary-50 px-2 py-0.5 rounded uppercase">
                    STATUTORY LEAVE CLAIM
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Verified</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-navy-900">MATERNITY BENEFIT</h4>
                  <p className="text-xs text-gray-600 font-medium">Valid: Sep 16 &ndash; Dec 09, 2026</p>
                </div>

                {/* What HR Learns vs Masked */}
                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="text-gray-400 block text-[9px]">HR SEES</span>
                    <span className="text-emerald-700 font-bold">✓ 84 Days Pass</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <span className="text-gray-400 block text-[9px]">DIAGNOSIS</span>
                    <span className="text-gray-900 font-bold">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                  <span>ECDSA P-256 Signed</span>
                  <span className="text-primary-600 font-semibold">GMC-8849201</span>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="p-3 bg-navy-800 rounded-xl border border-navy-700 flex items-center justify-between text-xs">
                <div>
                  <p className="text-white font-medium">Active HR Share Code</p>
                  <p className="text-[11px] text-gray-400 font-mono">LG-8429 (Expires in 42h)</p>
                </div>
                <span className="px-2 py-1 rounded-md bg-primary-600 text-white font-semibold text-[10px]">
                  Shared
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
