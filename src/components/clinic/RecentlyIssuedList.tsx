'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  QrCode, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Paperclip,
  ExternalLink
} from 'lucide-react';
import { SignedAttestation, ShareCode, MedicalDocument } from '@/lib/types';
import { revokeAttestationByIssuer, getClinicDocument } from '@/lib/storage';

interface RecentlyIssuedListProps {
  attestations: SignedAttestation[];
  shareCodes: ShareCode[];
  onViewShareCode: (attestation: SignedAttestation) => void;
  onRefresh: () => void;
}

export default function RecentlyIssuedList({
  attestations,
  shareCodes,
  onViewShareCode,
  onRefresh,
}: RecentlyIssuedListProps) {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | '7days'>('7days');

  // Human-friendly category label
  const getCategoryLabel = (att: SignedAttestation) => {
    const coarse = att.payload.coarseCategory;
    const fine = att.payload.fineCategory;
    if (coarse === 'STATUTORY_MATERNITY') return 'Maternity Leave';
    if (fine === 'surgery') return 'Surgical Recovery';
    if (fine === 'mental-health') return 'Mental Health Leave';
    if (coarse === 'CAREGIVING') return 'Caregiving Leave';
    return 'Medical Leave';
  };

  // Format date range nicely
  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const startFmt = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endFmt = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${startFmt} – ${endFmt}`;
    } catch {
      return `${startStr} – ${endStr}`;
    }
  };

  // Format issued date
  const formatIssuedDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Filter list
  const filteredList = attestations.filter((att) => {
    if (filterMode === 'all') return true;
    try {
      const issued = new Date(att.payload.issuedAt || att.createdAt).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
      return issued >= sevenDaysAgo;
    } catch {
      return true;
    }
  });

  const handleConfirmRevoke = () => {
    if (!revokingId) return;
    revokeAttestationByIssuer(revokingId);
    setRevokingId(null);
    onRefresh();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-condensed uppercase tracking-wider">
            Recently Issued
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Past 7 days
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono bg-slate-100 p-0.5 rounded border border-slate-200">
          <button
            type="button"
            onClick={() => setFilterMode('7days')}
            className={`px-2 py-0.5 rounded ${
              filterMode === '7days' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2 py-0.5 rounded ${
              filterMode === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* List */}
      {filteredList.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs font-mono">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
          <p>No leave proofs issued in this period.</p>
          <p className="text-[10px] mt-1 text-slate-400">
            Use the form on the left to sign and issue a new proof.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {filteredList.map((att) => {
            const attId = att.payload.attestationId;
            const isRevoked = att.isRevokedByIssuer;
            const doc = getClinicDocument(attId);
            const associatedShare = shareCodes.find((s) => s.attestationId === attId);

            return (
              <div
                key={attId}
                className={`p-4 rounded-lg border transition-all ${
                  isRevoked
                    ? 'bg-rose-50/50 border-rose-200 text-slate-600'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      {att.payload.employeeName || 'Sarah Jenkins'}
                    </h4>
                    <p className="text-[11px] font-medium text-emerald-700 font-mono mt-0.5">
                      {getCategoryLabel(att)}
                    </p>
                  </div>

                  {isRevoked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 font-semibold">
                      <XCircle className="w-3 h-3" />
                      REVOKED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-600 font-mono">
                  <p className="text-slate-700">
                    {formatDateRange(att.payload.startDate, att.payload.endDate)}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span className="text-emerald-700 font-medium">
                      ✓ Issued {formatIssuedDate(att.payload.issuedAt || att.createdAt)}
                    </span>
                    <span className="text-slate-500 font-mono">
                      ID: {attId}
                    </span>
                  </div>
                </div>

                {/* Document attachment status badge */}
                {doc && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center gap-1 text-[10px] font-mono text-teal-800 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                    <Paperclip className="w-3 h-3 text-teal-700 shrink-0" />
                    <span className="truncate">Local record: {doc.fileName}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onViewShareCode(att)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded text-[11px] font-mono font-medium transition flex items-center gap-1.5 border border-slate-300 shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                    <span>VIEW SHARE CODE</span>
                  </button>

                  {!isRevoked && (
                    <button
                      type="button"
                      onClick={() => setRevokingId(attId)}
                      className="px-2.5 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded text-[11px] font-mono transition"
                    >
                      REVOKE
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Revocation Confirmation Modal */}
      {revokingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-rose-200 rounded-xl p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-bold text-slate-900 font-condensed uppercase tracking-wider">
                Revoke Leave Proof?
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to revoke attestation <strong className="text-slate-900 font-mono">{revokingId}</strong>?
              This will immediately invalidate any active share codes and prevent HR from approving this leave.
            </p>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevokingId(null)}
                className="px-4 py-2 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition uppercase tracking-wider font-mono shadow-sm"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
