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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0B1120] border border-slate-700 rounded-xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 border-b border-[#1E293B] pb-3">
          <div className="flex items-center gap-2 text-[#94C3A3]">
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              GENERATE SHARE CODE (E3)
            </span>
          </div>
          <h3 className="text-xl font-bold text-white font-condensed uppercase tracking-wide">
            24-Hour Temporary HR Share Token
          </h3>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            &ldquo;This will let HR verify your eligibility without seeing your medical record.&rdquo;
          </p>
        </div>

        {/* Before Generation State */}
        {!generatedShare ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2 text-xs font-mono">
              <div className="text-slate-400">Attestation to share:</div>
              <div className="font-bold text-white text-sm">
                {attestation.payload.coarseCategory} ({attestation.payload.startDate} – {attestation.payload.endDate})
              </div>
              <div className="text-slate-400 text-[11px]">
                Issuer: {attestation.payload.doctorName}, {attestation.payload.issuerName}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#142319] border border-[#284230] text-xs text-[#94C3A3] space-y-1">
              <div className="font-bold font-condensed uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Zero Medical Disclosure Guarantee
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                HR will only receive the coarse statutory category, your dates, and a boolean confirming a registered clinician signed the certificate.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-lg bg-[#4A7C59] hover:bg-[#3D6649] text-white font-condensed font-bold uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              <span>{isGenerating ? 'GENERATING SHARE CODE...' : '[GENERATE SHARE CODE]'}</span>
            </button>
          </div>
        ) : (
          /* After Generation State */
          <div className="space-y-5 animate-in fade-in">
            <div className="p-5 bg-[#0F172A] rounded-xl border-2 border-[#4A7C59] text-center space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                YOUR 24-HOUR SHARE CODE (COPY &amp; SEND TO HR):
              </span>
              <div className="text-3xl font-black font-mono tracking-widest text-[#94C3A3] select-all">
                {generatedShare.code}
              </div>
              <div className="text-xs font-mono text-slate-400 flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Expires in 24 hours: {new Date(generatedShare.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
              </div>
            </div>

            {/* QR Mock Display */}
            <div className="p-4 bg-[#0B1120] rounded-xl border border-slate-800 flex items-center justify-center gap-4">
              <div className="w-24 h-24 bg-white p-2 rounded-lg flex items-center justify-center shadow">
                <QrCode className="w-20 h-20 text-black" />
              </div>
              <div className="space-y-1.5 text-left text-xs font-mono">
                <div className="font-bold text-white font-condensed uppercase">
                  Padded Verification QR
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  HR can scan this directly from their verifier portal camera.
                </p>
                <div className="text-[10px] text-[#94C3A3]">
                  Status: Shared (pending verification)
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="py-2.5 px-3 rounded-lg text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] text-white border border-slate-700 flex items-center justify-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#94C3A3]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'COPIED!' : 'COPY CODE'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-lg text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] text-white border border-slate-700 flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#94C3A3]" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'LINK COPIED' : 'COPY HR LINK'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-lg text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] text-white border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PRINT QR</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-lg text-xs font-condensed uppercase tracking-wider font-bold bg-[#4A7C59] hover:bg-[#3D6649] text-white"
            >
              DONE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
