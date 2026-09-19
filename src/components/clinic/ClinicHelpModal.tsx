'use client';

import React from 'react';
import { X, ShieldCheck, Lock, Stethoscope, FileCheck, EyeOff, CheckCircle2 } from 'lucide-react';

interface ClinicHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClinicHelpModal({ isOpen, onClose }: ClinicHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#111C2E] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B1322] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
              Clinic Issuer Guide & Privacy Overview
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto font-sans text-xs text-slate-300 leading-relaxed">
          <div className="bg-emerald-950/30 border border-emerald-700/50 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-100 font-condensed uppercase tracking-wider text-sm mb-1">
                Zero Diagnostic Disclosure Guarantee
              </h4>
              <p className="text-slate-300">
                In traditional systems, employees are forced to surrender complete medical notes and prescriptions to HR. Vouch replaces diagnosis disclosure with cryptographic verification of statutory eligibility.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature 1: Plain English Leave Types */}
            <div className="p-4 bg-[#0A1220] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold font-condensed uppercase tracking-wide">
                <Stethoscope className="w-4 h-4" />
                <span>1. Plain English Form</span>
              </div>
              <p className="text-slate-400">
                No diagnostic codes or complex terminology. Choose simple leave categories (Maternity, Medical, Surgical Recovery, Caregiving) and fitness statuses.
              </p>
            </div>

            {/* Feature 2: Local Only Medical Document Storage */}
            <div className="p-4 bg-[#0A1220] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold font-condensed uppercase tracking-wide">
                <Lock className="w-4 h-4" />
                <span>2. Local Record Retention</span>
              </div>
              <p className="text-slate-400">
                Uploaded medical notes and photos stay strictly within this clinic device's storage. They are never transmitted over share codes or exposed to employers.
              </p>
            </div>

            {/* Feature 3: Mathematical Certainty */}
            <div className="p-4 bg-[#0A1220] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold font-condensed uppercase tracking-wide">
                <FileCheck className="w-4 h-4" />
                <span>3. ECDSA P-256 Signatures</span>
              </div>
              <p className="text-slate-400">
                Every leave proof is signed using browser-native Web Crypto ECDSA keys. Employers verify mathematical authenticity without needing to see doctor identities or clinic registry numbers.
              </p>
            </div>

            {/* Feature 4: 24-Hour Expiry & Revocation */}
            <div className="p-4 bg-[#0A1220] border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold font-condensed uppercase tracking-wide">
                <EyeOff className="w-4 h-4" />
                <span>4. One-Click Revocation</span>
              </div>
              <p className="text-slate-400">
                Share codes expire automatically within 24 hours and can only be checked up to 3 times. You can immediately revoke an issued proof anytime from the "Recently Issued" panel.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#0B1322] border border-slate-800 rounded-lg text-slate-400 font-mono text-[11px]">
            <p className="text-slate-300 font-bold mb-1">What HR Sees During Verification:</p>
            <p>• Coarse Category: STATUTORY_MATERNITY</p>
            <p>• Validity Window: Sep 16 – Oct 07, 2026</p>
            <p>• Licensed Issuer: ✓ True (Verified via registry hash)</p>
            <p>• Doctor/Clinic Name: <span className="text-emerald-400">[REDACTED / ZERO DISCLOSURE]</span></p>
            <p>• Clinical Diagnosis: <span className="text-emerald-400">[REDACTED / ZERO DISCLOSURE]</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0B1322] border-t border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-mono font-semibold transition"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
}
