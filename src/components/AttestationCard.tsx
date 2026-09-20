'use client';

import { useState } from 'react';
import { SignedAttestation } from '@/lib/types';
import { 
  ShieldCheck, 
  Calendar, 
  User, 
  Building2, 
  Key, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Award, 
  CheckCircle, 
  QrCode,
  ShieldAlert,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import PaperAttestationQR from './PaperAttestationQR';
import BreakGlassModal from './BreakGlassModal';

interface AttestationCardProps {
  attestation: SignedAttestation;
  onShareClick?: (attestation: SignedAttestation) => void;
  showShareButton?: boolean;
}

export default function AttestationCard({
  attestation,
  onShareClick,
  showShareButton = true,
}: AttestationCardProps) {
  const [showCryptoDetails, setShowCryptoDetails] = useState(false);
  const [showPaperQR, setShowPaperQR] = useState(false);
  const [showBreakGlass, setShowBreakGlass] = useState(false);
  const { payload } = attestation;

  const getCategoryColor = (cat: string) => {
    return 'bg-blue-50 text-blue-800 border-blue-200';
  };

  const getFitForDutyBadge = (status: string) => {
    switch (status) {
      case 'full-rest':
        return { label: 'Unfit for Work / Total Rest Mandated', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'partial-remote':
        return { label: 'Fit for Remote / Modified Duty Only', color: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'fit-post-leave':
      default:
        return { label: 'Fit to Resume Duty on Return Date', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
  };

  const fitBadge = getFitForDutyBadge(payload.fitForDuty);

  return (
    <>
      <div className="relative rounded-2xl border border-[#E2D7C3] bg-[#FFFDF9] text-slate-900 shadow-sm overflow-hidden font-sans transition-all hover:border-[#D5C6AC]">
        
        {/* Top Security Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] tracking-wider uppercase text-slate-400 font-semibold">Attestation ID</span>
                <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {payload.attestationId}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-white mt-0.5">
                Official Medical Leave Certification
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {attestation.isRevokedByIssuer ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 border border-rose-700 text-rose-300 font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                REVOKED BY ISSUER
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                ECDSA P-256 SIGNED
              </span>
            )}
          </div>
        </div>

        {/* Main Certificate Body */}
        <div className="p-6 space-y-6 relative bg-[#FFFDF9]">
          
          <div className="absolute right-6 top-8 opacity-5 pointer-events-none select-none text-right">
            <Award className="w-36 h-36 text-slate-900" />
          </div>

          {/* Certified Holder & Dual Category Mapping Display */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#E2D7C3]">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Certified Holder (Wallet)</p>
              <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                <User className="w-5 h-5 text-slate-500" />
                {payload.employeeName}
                {payload.employeeId && (
                  <span className="text-xs font-mono font-normal text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {payload.employeeId}
                  </span>
                )}
              </h4>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wide border ${getCategoryColor(payload.coarseCategory)} shadow-xs`}>
                Statutory: {payload.coarseCategory}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Wallet Category: {payload.fineCategory} (Private)
              </span>
            </div>
          </div>

          {/* Certified Leave Period Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/90 p-4 rounded-xl border border-[#E2D7C3] shadow-xs">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Leave Start Date
              </p>
              <p className="text-base font-bold text-slate-900 font-mono">
                {payload.startDate}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Leave End Date
              </p>
              <p className="text-base font-bold text-slate-900 font-mono">
                {payload.endDate}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Return to Work Date
              </p>
              <p className="text-base font-bold text-slate-900 font-mono">
                {payload.expectedReturnDate}
              </p>
            </div>
          </div>

          {/* Fit for Duty & Clinical Accommodation */}
          <div className="space-y-2 bg-white/90 p-4 rounded-xl border border-[#E2D7C3]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Occupational Fitness Directive
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${fitBadge.color}`}>
                {fitBadge.label}
              </span>
            </div>
            {payload.fitForDutyNotes && (
              <p className="text-xs text-slate-700 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                &ldquo;{payload.fitForDutyNotes}&rdquo;
              </p>
            )}
          </div>

          {/* Issuer Medical Authority Signature Block */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[#E2D7C3] text-xs text-slate-700">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Accredited Medical Authority (Wallet Only)
              </p>
              <p className="font-semibold text-slate-900 text-sm">{payload.issuerName}</p>
              <p className="text-slate-600 flex items-center gap-2">
                <span>{payload.doctorName}</span>
                <span>•</span>
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-medium border border-slate-200 text-slate-700">
                  Reg: {payload.issuerRegNumber}
                </span>
              </p>
            </div>

            <div className="border-2 border-emerald-700 rounded px-4 py-2 text-center text-xs font-bold tracking-wider uppercase text-emerald-800 bg-emerald-50/50">
              <div>✓ VERIFIED CLINICAL ATTESTATION</div>
              <div className="text-[10px] tracking-normal font-sans font-normal text-slate-500">
                Issued: {new Date(payload.issuedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            {showShareButton && onShareClick && !attestation.isRevokedByIssuer && (
              <button
                onClick={() => onShareClick(attestation)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Generate Selective Share Code</span>
              </button>
            )}

            <button
              onClick={() => setShowPaperQR(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium transition-colors shadow-xs"
              title="Print paper fallback certificate with QR"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span>Paper QR</span>
            </button>

            <button
              onClick={() => setShowBreakGlass(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium transition-colors shadow-xs"
              title="Dual-consent break-glass dispute arbitration"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
              <span>Break-Glass</span>
            </button>

            <button
              onClick={() => setShowCryptoDetails(!showCryptoDetails)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium transition-colors shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>Proof</span>
              {showCryptoDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Cryptographic Inspector */}
          {showCryptoDetails && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px] space-y-3 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Web Crypto ECDSA (P-256 / SHA-256) Signature
                </span>
                <span className="text-slate-400">Curve: P-256</span>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Raw Signature (Hex)</p>
                <p className="break-all text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800 text-[10px] mt-1">
                  {attestation.signatureHex || '30440220...ECDSA_P256_SIGNATURE'}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-[10px] uppercase font-semibold">Clinic Public Key (SPKI Hex)</p>
                <p className="break-all text-slate-300 bg-slate-950 p-2 rounded border border-slate-800 text-[10px] mt-1">
                  {attestation.publicKeyHex || '3059301306072a8648ce3d020106082a8648ce3d03010703420004...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paper QR Modal */}
      {showPaperQR && (
        <PaperAttestationQR
          attestation={attestation}
          onClose={() => setShowPaperQR(false)}
        />
      )}

      {/* Break-Glass Modal */}
      {showBreakGlass && (
        <BreakGlassModal
          attestation={attestation}
          onClose={() => setShowBreakGlass(false)}
        />
      )}
    </>
  );
}
