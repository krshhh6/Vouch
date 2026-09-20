'use client';

import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  Printer, 
  Clock, 
  ShieldCheck, 
  Lock, 
  QrCode,
  ArrowRight
} from 'lucide-react';
import { SignedAttestation, ShareCode } from '@/lib/types';
import { createShareCode } from '@/lib/storage';

interface ShareCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  attestation: SignedAttestation | null;
  onShareCreated: (share: ShareCode) => void;
}

export default function ShareCodeModal({
  isOpen,
  onClose,
  attestation,
  onShareCreated,
}: ShareCodeModalProps) {
  const [generatedShare, setGeneratedShare] = useState<ShareCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !attestation) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const share = await createShareCode(
        attestation,
        attestation.payload.coarseCategory === 'STATUTORY_MATERNITY'
          ? 'maternity-mba-1961'
          : 'medical-statutory-1972',
        24
      );
      setGeneratedShare(share);
      onShareCreated(share);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedShare) return;
    navigator.clipboard.writeText(generatedShare.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!generatedShare) return;
    const link = `${window.location.origin}/hr?code=${generatedShare.code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-blue-700">
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Generate Verification Share Code
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            24-Hour Temporary HR Share Token
          </h3>
          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            &ldquo;This will let HR verify your statutory eligibility without seeing your medical record or diagnosis.&rdquo;
          </p>
        </div>

        {/* Before Generation State */}
        {!generatedShare ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="text-slate-500 font-medium">Attestation to share:</div>
              <div className="font-bold text-slate-900 text-sm">
                {attestation.payload.coarseCategory} ({attestation.payload.startDate} – {attestation.payload.endDate})
              </div>
              <div className="text-slate-500 text-xs">
                Issuer: {attestation.payload.doctorName}, {attestation.payload.issuerName}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Zero Medical Disclosure Guarantee
              </div>
              <p className="text-xs text-emerald-700 font-sans">
                HR will only receive the coarse statutory category, your dates, and a boolean confirming a registered clinician signed the certificate.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              <span>{isGenerating ? 'Generating Share Code...' : 'Generate Share Code'}</span>
            </button>
          </div>
        ) : (
          /* After Generation State */
          <div className="space-y-5 animate-in fade-in">
            <div className="p-5 bg-slate-50 rounded-xl border-2 border-blue-600 text-center space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
                Your 24-Hour Share Code (Copy &amp; Send to HR):
              </span>
              <div className="text-3xl font-black font-mono tracking-widest text-blue-700 select-all">
                {generatedShare.code}
              </div>
              <div className="text-xs font-sans text-slate-500 flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Expires in 24 hours: {new Date(generatedShare.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
              </div>
            </div>

            {/* QR Mock Display */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center gap-4">
              <div className="w-24 h-24 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center shadow-xs">
                <QrCode className="w-20 h-20 text-slate-900" />
              </div>
              <div className="space-y-1 text-left text-xs font-sans">
                <div className="font-bold text-slate-900">
                  Padded Verification QR
                </div>
                <p className="text-xs text-slate-600">
                  HR can scan this directly from their verifier portal camera.
                </p>
                <div className="text-xs text-emerald-700 font-medium">
                  Status: Shared (pending verification)
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="py-2.5 px-3 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs flex items-center justify-center gap-1.5 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs flex items-center justify-center gap-1.5 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedLink ? 'Link Copied' : 'Copy HR Link'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print QR</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
