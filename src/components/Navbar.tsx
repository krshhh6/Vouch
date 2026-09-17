'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  Stethoscope, 
  UserCheck, 
  Building2, 
  EyeOff, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  FileText,
  Info,
  X,
  Database
} from 'lucide-react';
import { resetAllData } from '@/lib/storage';

export default function Navbar() {
  const pathname = usePathname();
  const [showGuide, setShowGuide] = useState(false);
  const [resetToast, setResetToast] = useState(false);

  const handleReset = () => {
    resetAllData();
    setResetToast(true);
    setTimeout(() => setResetToast(false), 3000);
  };

  const navItems = [
    { href: '/', label: 'Overview', icon: FileText },
    { href: '/issuer', label: '1. Clinic (Issuer)', icon: Stethoscope },
    { href: '/employee', label: '2. Employee (Holder)', icon: UserCheck },
    { href: '/employee/redact', label: 'Redaction Lab', icon: EyeOff },
    { href: '/hr', label: '3. HR (Verifier)', icon: Building2 },
    { href: '/hr/inspector', label: 'DB Inspector (F8)', icon: Database },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-black/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-bold font-condensed transition-transform group-hover:scale-105">
                  <ShieldCheck className="w-5 h-5 text-black stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg tracking-tight text-white font-sans uppercase">
                      Vouch
                    </span>
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700">
                      VOUCH-2026.1
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 hidden sm:block -mt-0.5 font-sans">
                    Zero-Knowledge Medical Leave Protocol
                  </p>
                </div>
              </Link>
            </div>

            {/* Role Navigation Bar */}
            <nav className="hidden lg:flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900 font-medium'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Demo Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-colors"
                title="View Hackathon Demo Guide"
              >
                <Info className="w-3.5 h-3.5 text-zinc-300" />
                <span className="hidden sm:inline font-condensed tracking-wide uppercase text-[11px]">Research Guide</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-colors"
                title="Reset/Seed Sample Data"
              >
                <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />
                <span className="hidden sm:inline font-condensed tracking-wide uppercase text-[11px]">Reset Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2 border-t border-zinc-800 bg-zinc-950 overflow-x-auto gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                  isActive ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label.split(' ')[1] || item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Reset Toast Notification */}
      {resetToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 shadow-2xl text-zinc-200 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Research demo data re-seeded. Test share code: <strong className="text-white font-bold">LG-7892</strong></span>
        </div>
      )}

      {/* Demo Walkthrough Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base text-white uppercase font-condensed tracking-wider">
                  Vouch Protocol Research Architecture
                </h3>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-zinc-300">
              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="font-bold text-white flex items-center gap-2 font-condensed uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  FIX 0 — Metadata Leakage Elimination
                </h4>
                <p className="text-zinc-400 mt-1 leading-relaxed">
                  Clinic names are completely masked from HR and replaced with <code className="text-white bg-zinc-800 px-1 py-0.5 rounded">issuerIsLicensed: true</code> and <code className="text-white bg-zinc-800 px-1 py-0.5 rounded">issuerRefHash</code>. Categories are collapsed to coarse statutory enums (<code className="text-white bg-zinc-800 px-1 py-0.5 rounded">STATUTORY_MATERNITY</code>, <code className="text-white bg-zinc-800 px-1 py-0.5 rounded">STATUTORY_MEDICAL</code>, <code className="text-white bg-zinc-800 px-1 py-0.5 rounded">CAREGIVING</code>, <code className="text-white bg-zinc-800 px-1 py-0.5 rounded">SELF_DECLARED</code>).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="font-bold text-white flex items-center gap-2 font-condensed uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  F1 & F2 — Quota Predicates & Constrained Request Builder
                </h4>
                <p className="text-zinc-400 mt-1 leading-relaxed">
                  HR cannot upload files or request arbitrary letters. On verification, HR receives 4 pass/fail predicate booleans and never learns remaining quota balances or historical leave frequency.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="font-bold text-white flex items-center gap-2 font-condensed uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  F3 & F4 — Tamper-Evident Hash Chain & Honest Leakage Meter
                </h4>
                <p className="text-zinc-400 mt-1 leading-relaxed">
                  Every verification appends an immutable block to the SHA-256 hash chain with jittered timestamps. The employee inspects residual inference side-channels before sharing.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="font-bold text-white flex items-center gap-2 font-condensed uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  F5, F6, F7, F8 — Policy Compiler, Paper QR, Break-Glass & DB Inspector
                </h4>
                <p className="text-zinc-400 mt-1 leading-relaxed">
                  Menstrual leave is pure self-declaration with no doctor notes. Dual-consent escape hatch for labour disputes. Real-time stage inspection on <strong className="text-white">/hr/inspector</strong> proving zero raw health data in memory.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-200 text-black transition-colors font-condensed uppercase tracking-wider"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
