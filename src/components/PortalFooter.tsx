'use client';

import { usePathname } from 'next/navigation';

export default function PortalFooter() {
  const pathname = usePathname();

  // Do not render the portal footer on the root landing page (which has its own Dock Labs footer)
  if (pathname === '/') {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 font-mono shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span className="font-semibold text-slate-800 uppercase tracking-wider font-condensed">VOUCH-2026.1</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">ECDSA P-256 / SHA-256 • Neon Lakebase Postgres</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 uppercase tracking-wider font-condensed">
          <span>Zero PHI Retention</span>
          <span>/</span>
          <span>Time-Bound Attestations</span>
          <span>/</span>
          <span>Append-Only Ledger</span>
        </div>
      </div>
    </footer>
  );
}
