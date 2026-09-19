'use client';

import React, { useState } from 'react';
import { Search, ShieldCheck, RefreshCw, QrCode, AlertTriangle, Camera } from 'lucide-react';

interface ShareCodeEntryProps {
  inputCode: string;
  onCodeChange: (code: string) => void;
  onVerify: (code: string) => void;
  isVerifying: boolean;
  codeStatus: 'IDLE' | 'VERIFYING' | 'VALID' | 'INVALID';
  errorMessage: string | null;
}

export default function ShareCodeEntry({
  inputCode,
  onCodeChange,
  onVerify,
  isVerifying,
  codeStatus,
  errorMessage,
}: ShareCodeEntryProps) {
  const [showQrScanMock, setShowQrScanMock] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(inputCode);
  };

  const handlePasteSample = (code: string) => {
    onCodeChange(code);
    onVerify(code);
  };

  return (
    <div className="rounded-xl bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#142319] border border-[#284230] flex items-center justify-center text-[#94C3A3]">
            <Search className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white block">
              SHARE CODE ENTRY (H3)
            </span>
            <span className="text-[10px] text-slate-400 font-sans">
              Enter 24-hour token or scan QR
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0F172A] text-slate-400 border border-slate-800">
          P-256 Signature
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-300 font-condensed uppercase tracking-wider block mb-1.5">
            Enter Share Code from Employee:
          </label>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
            placeholder="e.g. LG-7892 or VC-26WMAT-8K2X9"
            className="w-full px-4 py-3 rounded-lg bg-[#0F172A] border border-[#334155] font-mono text-sm tracking-wider uppercase text-white placeholder-slate-500 focus:outline-none focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59]"
          />
        </div>

        {/* QR Scan or Quick Pastes */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 bg-[#0F172A] p-2.5 rounded-lg border border-[#1E293B]">
          <span className="flex items-center gap-1 text-[11px]">
            <Camera className="w-3.5 h-3.5 text-[#94C3A3]" />
            <span>Scan QR / Quick Fill:</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePasteSample('LG-7892')}
              className="text-[11px] text-[#94C3A3] hover:underline"
            >
              [LG-7892 (S. Jenkins)]
            </button>
            <button
              type="button"
              onClick={() => handlePasteSample('LG-3341')}
              className="text-[11px] text-[#94C3A3] hover:underline"
            >
              [LG-3341]
            </button>
            <button
              type="button"
              onClick={() => {
                const sample = prompt('Paste full employee verification URL:');
                if (sample && sample.includes('code=')) {
                  const c = sample.split('code=')[1]?.split('&')[0];
                  if (c) handlePasteSample(c);
                }
              }}
              className="text-[11px] text-[#94C3A3] hover:underline"
            >
              [SCAN URL]
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isVerifying || !inputCode.trim()}
          className="w-full py-3.5 rounded-lg bg-[#4A7C59] hover:bg-[#3D6649] text-white font-condensed font-bold uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#94C3A3]" />
              <span>VERIFYING CRYPTOGRAPHIC CREDENTIAL...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>[VERIFY CREDENTIAL]</span>
            </>
          )}
        </button>

        {/* Status Indicator */}
        <div className="p-3 bg-[#0F172A] rounded-lg border border-[#1E293B] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 text-[10px] uppercase font-condensed tracking-wider">
            Verification status:
          </span>
          <span
            className={
              codeStatus === 'IDLE'
                ? 'text-slate-500'
                : codeStatus === 'VERIFYING'
                ? 'text-amber-400 font-bold'
                : codeStatus === 'VALID'
                ? 'text-[#94C3A3] font-bold'
                : 'text-red-400 font-bold'
            }
          >
            {codeStatus === 'IDLE' && '○ Awaiting share code'}
            {codeStatus === 'VERIFYING' && '⟳ Verifying P-256 signature...'}
            {codeStatus === 'VALID' && '✓ Valid & verified'}
            {codeStatus === 'INVALID' && '✗ Invalid / expired / rejected'}
          </span>
        </div>
      </form>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-200 text-xs space-y-1 animate-in fade-in">
          <div className="font-bold font-condensed uppercase tracking-wider flex items-center gap-1.5 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Verification Refused</span>
          </div>
          <p className="font-mono text-[11px]">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
