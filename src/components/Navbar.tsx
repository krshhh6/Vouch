'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import { resetDemoData } from '@/lib/storage';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { label: 'Overview', href: '/' },
    { label: '1. Clinic', href: '/clinic' },
    { label: '2. Employee', href: '/employee' },
    { label: 'Redaction Lab', href: '/redaction-lab' },
    { label: '3. HR', href: '/hr' },
    { label: 'DB Inspector', href: '/db-inspector' },
    { label: 'RESEARCH GUIDE', href: '/research-guide' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/overview';
    }
    if (href === '/clinic') {
      return pathname.startsWith('/clinic') || pathname.startsWith('/issuer');
    }
    if (href === '/employee') {
      return pathname === '/employee';
    }
    if (href === '/redaction-lab') {
      return pathname.startsWith('/redaction-lab') || pathname.startsWith('/employee/redact');
    }
    if (href === '/hr') {
      return pathname === '/hr';
    }
    if (href === '/db-inspector') {
      return pathname.startsWith('/db-inspector') || pathname.startsWith('/hr/inspector');
    }
    return pathname.startsWith(href);
  };

  const handleResetDemo = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      resetDemoData();
      router.push('/');
      setTimeout(() => {
        window.location.reload();
      }, 50);
    }
  };

  return (
    <header className="w-full bg-[#0B1120] border-b border-[#1E293B] sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Header Line */}
        <div className="py-3 flex items-center justify-between border-b border-[#1E293B]/60">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-[#4A7C59] flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-condensed font-bold text-lg tracking-wider text-white">VOUCH</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#1E293B] text-slate-300 border border-slate-700">
                  VOUCH-2026.1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-tight">
                Zero-Knowledge Medical Leave Protocol
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4A7C59]"></span>
              ECDSA P-256 Web Crypto
            </span>
            <span className="text-slate-600">|</span>
            <span>Zero-PHI Retention</span>
          </div>
        </div>

        {/* Tab Navigation Line */}
        <div className="flex items-center justify-between overflow-x-auto py-1">
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2.5 text-xs font-condensed uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#4A7C59]"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Persistent Reset Demo Button */}
          <button
            onClick={handleResetDemo}
            title="Clear localStorage and restore initial demo state"
            className="flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded text-[11px] font-condensed uppercase tracking-wider font-bold text-slate-300 hover:text-white bg-[#1E293B] hover:bg-[#334155] border border-slate-700 transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#4A7C59]" />
            <span>RESET DEMO</span>
          </button>
        </div>

      </div>
    </header>
  );
}
