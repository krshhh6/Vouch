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
      <header className="sticky top-0 z-40 w-full border-b border-ink-800/80 bg-ink-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-seal-500 to-ink-700 p-0.5 shadow-lg shadow-seal-500/20 group-hover:shadow-seal-500/40 transition-all">
                  <div className="w-full h-full bg-ink-900 rounded-[10px] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-seal-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg tracking-tight text-white font-sans">
                      Vouch
                    </span>
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-ink-800 text-seal-300 border border-seal-500/30">
                      Policy VOUCH-2026.1
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block -mt-0.5">
                    Zero-Knowledge Medical Leave Protocol
                  </p>
                </div>
              </Link>
            </div>

            {/* Role Navigation Bar */}
            <nav className="hidden lg:flex items-center gap-1 bg-ink-900/90 p-1.5 rounded-xl border border-ink-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-seal-600 text-white shadow-md shadow-seal-600/30 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-ink-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Demo Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-ink-800/80 hover:bg-ink-700 text-slate-200 border border-ink-700 transition-colors"
                title="View Hackathon Demo Guide"
              >
                <Info className="w-3.5 h-3.5 text-seal-400" />
                <span className="hidden sm:inline">Research Gaps Guide</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-seal-950/80 hover:bg-seal-900 text-seal-300 border border-seal-800/60 hover:border-seal-700 transition-colors"
                title="Reset/Seed Sample Data"
              >
                <RefreshCw className="w-3.5 h-3.5 text-seal-400" />
                <span className="hidden sm:inline">Reset Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2 border-t border-ink-800/60 bg-ink-900/60 overflow-x-auto gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                  isActive ? 'bg-seal-600 text-white' : 'text-slate-400 hover:text-white'
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-seal-950 border border-seal-500/50 shadow-xl shadow-seal-950/80 text-seal-200 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-seal-400" />
          <span>Hackathon research demo data re-seeded! Test share code: <strong className="text-white font-mono">LG-7892</strong></span>
        </div>
      )}

      {/* Demo Walkthrough Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-ink-900 border border-ink-700 rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-ink-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-seal-400" />
                <h3 className="font-semibold text-lg text-white">Vouch Research Gap Defense Guide</h3>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-ink-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-ink-800/80 border border-ink-700/60">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-seal-400"></span>
                  FIX 0 — Metadata Leakage Elimination
                </h4>
                <p className="text-slate-400 mt-1">
                  Clinic names are completely masked from HR and replaced with <code className="text-seal-300">issuerIsLicensed: true</code> and <code className="text-seal-300">issuerRefHash</code>. Categories are collapsed to coarse statutory enums (<code className="text-seal-300">STATUTORY_MATERNITY</code>, <code className="text-seal-300">STATUTORY_MEDICAL</code>, <code className="text-seal-300">CAREGIVING</code>, <code className="text-seal-300">SELF_DECLARED</code>).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-ink-800/80 border border-ink-700/60">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  F1 & F2 — Quota Predicates & Constrained Request Builder
                </h4>
                <p className="text-slate-400 mt-1">
                  HR cannot upload files or request arbitrary letters. On verification, HR receives 4 pass/fail predicate booleans and never learns remaining quota balances or historical leave frequency.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-ink-800/80 border border-ink-700/60">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  F3 & F4 — Tamper-Evident Hash Chain & Honest Leakage Meter
                </h4>
                <p className="text-slate-400 mt-1">
                  Every verification appends an immutable block to the SHA-256 hash chain with jittered timestamps. The employee inspects residual inference side-channels before sharing.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-ink-800/80 border border-ink-700/60">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  F5, F6, F7, F8 — Policy Compiler, Paper QR, Break-Glass & DB Inspector
                </h4>
                <p className="text-slate-400 mt-1">
                  Menstrual leave is pure self-declaration with no doctor notes. Dual-consent escape hatch for labour disputes. Real-time stage inspection on <strong className="text-white">/hr/inspector</strong> proving zero raw health data in memory.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-ink-800 flex items-center justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-seal-600 hover:bg-seal-500 text-white"
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
