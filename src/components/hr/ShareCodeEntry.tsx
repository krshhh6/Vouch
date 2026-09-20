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
    <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <Search className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
              Share Code Verification Entry
            </span>
            <span className="text-xs text-slate-500 font-sans">
              Enter 24-hour token or scan QR
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-600 border border-slate-200">
          P-256 Signature
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Enter Share Code from Employee:
          </label>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
            placeholder="e.g. LG-7892 or VC-26WMAT-8K2X9"
            className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 font-mono text-sm tracking-wider uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs"
          />
        </div>

        {/* QR Scan or Quick Pastes */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <Camera className="w-3.5 h-3.5 text-blue-700" />
            <span>Quick Fill / Sample:</span>
          </span>
          <div className="flex items-center gap-2 font-mono">
            <button
              type="button"
              onClick={() => handlePasteSample('LG-7892')}
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              LG-7892 (S. Jenkins)
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => handlePasteSample('LG-3341')}
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              LG-3341
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => {
                const sample = prompt('Paste full employee verification URL:');
                if (sample && sample.includes('code=')) {
                  const c = sample.split('code=')[1]?.split('&')[0];
                  if (c) handlePasteSample(c);
                }
              }}
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              Scan URL
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isVerifying || !inputCode.trim()}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Verifying Cryptographic Credential...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Credential</span>
            </>
          )}
        </button>

        {/* Status Indicator */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-sans">
          <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            Verification status:
          </span>
          <span
            className={
              codeStatus === 'IDLE'
                ? 'text-slate-500'
                : codeStatus === 'VERIFYING'
                ? 'text-amber-700 font-bold'
                : codeStatus === 'VALID'
                ? 'text-emerald-700 font-bold'
                : 'text-rose-700 font-bold'
            }
          >
            {codeStatus === 'IDLE' && '○ Awaiting share code'}
            {codeStatus === 'VERIFYING' && '⟳ Verifying P-256 signature...'}
            {codeStatus === 'VALID' && '✓ Valid & verified'}
            {codeStatus === 'INVALID' && '✕ Invalid / expired / rejected'}
          </span>
        </div>
      </form>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1 animate-in fade-in">
          <div className="font-semibold flex items-center gap-1.5 text-rose-700">
            <AlertTriangle className="w-4 h-4" />
            <span>Verification Refused</span>
          </div>
          <p className="font-mono text-xs text-rose-700">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
