'use client';

import React from 'react';
import { Lock, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { SignedAttestation, ShareCode, ApprovalRecord } from '@/lib/types';
import Link from 'next/link';

interface AttestationWalletProps {
  attestations: SignedAttestation[];
  selectedAttestation: SignedAttestation | null;
  onSelectAttestation: (att: SignedAttestation) => void;
  shareCodes: ShareCode[];
  approvals: ApprovalRecord[];
  onRefreshStatus: () => void;
  isRefreshing?: boolean;
}

export default function AttestationWallet({
  attestations,
  selectedAttestation,
  onSelectAttestation,
  shareCodes,
  approvals,
  onRefreshStatus,
  isRefreshing = false,
}: AttestationWalletProps) {
  return (
    <div className="rounded-xl bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
      {/* Wallet Header */}
      <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#142319] border border-[#284230] flex items-center justify-center text-[#94C3A3]">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white block">
              ATTESTATIONS LIST (E1)
            </span>
            <span className="text-[10px] text-slate-400 font-sans">Self-sovereign vault</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0F172A] text-slate-300 border border-slate-800">
          {attestations.length} total
        </span>
      </div>

      {/* Attestations Cards */}
      <div className="space-y-3">
        {attestations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 font-sans border border-dashed border-[#1E293B] rounded-lg">
            No attestations in vault. Issue one from Clinic Issuer.
          </div>
        ) : (
          attestations.map((att) => {
            const isSelected = selectedAttestation?.payload.attestationId === att.payload.attestationId;
            const isRevoked = att.isRevokedByIssuer;

            // Find associated share codes
            const relatedShares = shareCodes.filter(
              s => s.attestationId === att.payload.attestationId
            );
            const totalViews = relatedShares.reduce((acc, s) => acc + (s.viewCount || 0), 0);
            const isShared = relatedShares.length > 0;

            // Find if approved in company approvals
            const isApproved = approvals.some(
              a => relatedShares.some(s => s.code === a.shareCode) ||
                   (a.category === att.payload.coarseCategory && a.validFrom === att.payload.startDate)
            );

            // Check if pending verification
            const isPendingVerification = isShared && !isApproved && relatedShares.some(s => s.approvalStatus === 'WAITING' || s.approvalStatus === 'VERIFIED');

            return (
              <div
                key={att.payload.attestationId}
                onClick={() => onSelectAttestation(att)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 text-xs ${
                  isSelected
                    ? 'bg-[#0F172A] border-[#4A7C59] shadow-md ring-1 ring-[#4A7C59]/40'
                    : 'bg-[#0F172A]/40 border-[#1E293B] hover:border-slate-700 hover:bg-[#0F172A]/80'
                }`}
              >
                {/* Title & Dates */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5 text-sm font-condensed tracking-wide">
                      <span className={isRevoked ? 'text-red-400' : 'text-[#94C3A3]'}>
                        {isRevoked ? '✗' : '✓'}
                      </span>
                      <span>
                        {att.payload.coarseCategory === 'STATUTORY_MATERNITY'
                          ? 'Maternity'
                          : att.payload.coarseCategory === 'STATUTORY_MEDICAL'
                          ? 'Medical'
                          : 'Caregiving'}
                      </span>
                      <span className="text-slate-400 text-xs font-mono font-normal">
                        ({att.payload.startDate} – {att.payload.endDate})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                      {att.payload.doctorName}, {att.payload.issuerName}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isRevoked ? 'bg-red-950/60 text-red-400 border border-red-800' :
                    isApproved ? 'bg-[#142319] text-[#94C3A3] border border-[#284230]' :
                    'bg-[#1E293B] text-slate-300 border border-slate-700'
                  }`}>
                    {isRevoked ? 'REVOKED' : isApproved ? 'APPROVED ✓' : 'ACTIVE'}
                  </span>
                </div>

                {/* Status Badges Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1E293B]/80 text-[11px] font-mono">
                  {/* Share indicator */}
                  {!isShared ? (
                    <span className="text-slate-400 bg-[#0B1120] px-2 py-0.5 rounded border border-slate-800">
                      Not yet shared
                    </span>
                  ) : (
                    <span className="text-[#94C3A3] bg-[#142319] px-2 py-0.5 rounded border border-[#284230] flex items-center gap-1">
                      <span>Shared ({totalViews} {totalViews === 1 ? 'view' : 'views'})</span>
                    </span>
                  )}

                  {/* Pending verification indicator */}
                  {isPendingVerification && (
                    <span className="text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>⏳ Verification pending</span>
                    </span>
                  )}

                  {/* Approved indicator */}
                  {isApproved && (
                    <span className="text-[#94C3A3] font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-[#94C3A3]" />
                      <span>Approved</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-[#1E293B] space-y-2">
        <button
          type="button"
          onClick={onRefreshStatus}
          disabled={isRefreshing}
          className="w-full py-2.5 rounded-lg text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#94C3A3] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>[REFRESH STATUS]</span>
        </button>

        <div className="p-2.5 rounded-lg bg-[#0F172A] border border-[#1E293B] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-sans">
            Clinic Portal →
          </span>
          <Link
            href="/clinic"
            className="text-xs font-condensed font-bold uppercase tracking-wider text-[#94C3A3] hover:text-white flex items-center gap-1"
          >
            <span>[SWITCH TO ISSUER]</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
