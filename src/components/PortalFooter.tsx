'use client';

import { usePathname } from 'next/navigation';

const NEU = {
  raisedSm: {
    backgroundColor: '#e8ecf4',
    boxShadow: '4px 4px 10px #c5cedd, -4px -4px 10px #ffffff',
  },
  pressed: {
    backgroundColor: '#e6ebf3',
    boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff',
  },
};

export default function PortalFooter({ forceVisible = false }: { forceVisible?: boolean } = {}) {
  const pathname = usePathname();

  // Do not render the portal footer on the root landing page unless forceVisible is true
  if (pathname === '/' && !forceVisible) {
    return null;
  }

  return (
    <footer className="mt-8 py-6 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50">
      <div
        className="max-w-7xl mx-auto rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-mono"
        style={NEU.raisedSm}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-800 uppercase tracking-wider">VOUCH-2026.1</span>
          <span className="text-slate-400">•</span>
          <span>ECDSA P-256 / SHA-256 • Neon Serverless Postgres</span>
        </div>
        <div
          className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-xl text-slate-500"
          style={NEU.pressed}
        >
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
