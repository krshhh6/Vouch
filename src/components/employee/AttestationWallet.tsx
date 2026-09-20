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
    <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm text-slate-900">
      {/* Wallet Header */}
      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider font-condensed text-slate-900 block">
              ATTESTATIONS LIST (E1)
            </span>
            <span className="text-[10px] text-slate-500 font-sans">Self-sovereign vault</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
          {attestations.length} total
        </span>
      </div>

      {/* Attestations Cards */}
      <div className="space-y-3">
        {attestations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 font-sans border border-dashed border-slate-300 rounded-lg">
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
                    ? 'bg-blue-50/60 border-blue-600 shadow-sm ring-1 ring-blue-500 text-slate-900'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 text-slate-800'
                }`}
              >
                {/* Title & Dates */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm font-condensed tracking-wide">
                      <span className={isRevoked ? 'text-rose-600' : 'text-emerald-700'}>
                        {isRevoked ? '✗' : '✓'}
                      </span>
                      <span>
                        {att.payload.coarseCategory === 'STATUTORY_MATERNITY'
                          ? 'Maternity'
                          : att.payload.coarseCategory === 'STATUTORY_MEDICAL'
                          ? 'Medical'
                          : 'Caregiving'}
                      </span>
                      <span className="text-slate-500 text-xs font-mono font-normal">
                        ({att.payload.startDate} – {att.payload.endDate})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
                      {att.payload.doctorName}, {att.payload.issuerName}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isRevoked ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    isApproved ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {isRevoked ? 'REVOKED' : isApproved ? 'APPROVED ✓' : 'ACTIVE'}
                  </span>
                </div>

                {/* Status Badges Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 text-[11px] font-mono">
                  {/* Share indicator */}
                  {!isShared ? (
                    <span className="text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                      Not yet shared
                    </span>
                  ) : (
                    <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 font-medium">
                      <span>Shared ({totalViews} {totalViews === 1 ? 'view' : 'views'})</span>
                    </span>
                  )}

                  {/* Pending verification indicator */}
                  {isPendingVerification && (
                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>⏳ Verification pending</span>
                    </span>
                  )}

                  {/* Approved indicator */}
                  {isApproved && (
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
      <div className="pt-2 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={onRefreshStatus}
          disabled={isRefreshing}
          className="w-full py-2.5 rounded-lg text-xs font-condensed uppercase tracking-wider font-bold bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>[REFRESH STATUS]</span>
        </button>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-600 font-sans">
            Clinic Portal →
          </span>
          <Link
            href="/clinic"
            className="text-xs font-condensed font-bold uppercase tracking-wider text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>[SWITCH TO ISSUER]</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
