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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900 font-condensed uppercase tracking-wider">
              Clinic Issuer Guide & Privacy Overview
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto font-sans text-xs text-slate-700 leading-relaxed">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 font-condensed uppercase tracking-wider text-sm mb-1">
                Zero Diagnostic Disclosure Guarantee
              </h4>
              <p className="text-slate-600">
                In traditional systems, employees are forced to surrender complete medical notes and prescriptions to HR. Vouch replaces diagnosis disclosure with cryptographic verification of statutory eligibility.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature 1: Plain English Leave Types */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-teal-800 font-semibold font-condensed uppercase tracking-wide">
                <Stethoscope className="w-4 h-4 text-teal-700" />
                <span>1. Plain English Form</span>
              </div>
              <p className="text-slate-600">
                No diagnostic codes or complex terminology. Choose simple leave categories (Maternity, Medical, Surgical Recovery, Caregiving) and fitness statuses.
              </p>
            </div>

            {/* Feature 2: Local Only Medical Document Storage */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-teal-800 font-semibold font-condensed uppercase tracking-wide">
                <Lock className="w-4 h-4 text-teal-700" />
                <span>2. Local Record Retention</span>
              </div>
              <p className="text-slate-600">
                Uploaded medical notes and photos stay strictly within this clinic device's storage. They are never transmitted over share codes or exposed to employers.
              </p>
            </div>

            {/* Feature 3: Mathematical Certainty */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-teal-800 font-semibold font-condensed uppercase tracking-wide">
                <FileCheck className="w-4 h-4 text-teal-700" />
                <span>3. ECDSA P-256 Signatures</span>
              </div>
              <p className="text-slate-600">
                Every leave proof is signed using browser-native Web Crypto ECDSA keys. Employers verify mathematical authenticity without needing to see doctor identities or clinic registry numbers.
              </p>
            </div>

            {/* Feature 4: 24-Hour Expiry & Revocation */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-teal-800 font-semibold font-condensed uppercase tracking-wide">
                <EyeOff className="w-4 h-4 text-teal-700" />
                <span>4. One-Click Revocation</span>
              </div>
              <p className="text-slate-600">
                Share codes expire automatically within 24 hours and can only be checked up to 3 times. You can immediately revoke an issued proof anytime from the "Recently Issued" panel.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px]">
            <p className="text-slate-900 font-bold mb-1">What HR Sees During Verification:</p>
            <p>• Coarse Category: STATUTORY_MATERNITY</p>
            <p>• Validity Window: Sep 16 – Oct 07, 2026</p>
            <p>• Licensed Issuer: ✓ True (Verified via registry hash)</p>
            <p>• Doctor/Clinic Name: <span className="text-emerald-700 font-semibold">[REDACTED / ZERO DISCLOSURE]</span></p>
            <p>• Clinical Diagnosis: <span className="text-emerald-700 font-semibold">[REDACTED / ZERO DISCLOSURE]</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-mono font-semibold transition shadow-xs"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
}
