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
    <div className="bg-[#111C2E] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
            Recently Issued
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Past 7 days
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono bg-[#090F1B] p-0.5 rounded border border-slate-800">
          <button
            type="button"
            onClick={() => setFilterMode('7days')}
            className={`px-2 py-0.5 rounded ${
              filterMode === '7days' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2 py-0.5 rounded ${
              filterMode === 'all' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
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
          <p className="text-[10px] mt-1 text-slate-600">
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
                    ? 'bg-red-950/10 border-red-900/40 text-slate-400'
                    : 'bg-[#0B1322] border-slate-800/80 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                      {att.payload.employeeName || 'Sarah Jenkins'}
                    </h4>
                    <p className="text-[11px] font-medium text-emerald-400 font-mono mt-0.5">
                      {getCategoryLabel(att)}
                    </p>
                  </div>

                  {isRevoked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-400 border border-red-800 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      REVOKED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-300 font-mono">
                  <p className="text-slate-400">
                    {formatDateRange(att.payload.startDate, att.payload.endDate)}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
                    <span className="text-emerald-400">
                      ✓ Issued {formatIssuedDate(att.payload.issuedAt || att.createdAt)}
                    </span>
                    <span className="text-slate-500 font-mono">
                      ID: {attId}
                    </span>
                  </div>
                </div>

                {/* Document attachment status badge */}
                {doc && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-950/20 px-2 py-1 rounded">
                    <Paperclip className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">Local record: {doc.fileName}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onViewShareCode(att)}
                    className="px-3 py-1.5 bg-[#1E293B] hover:bg-slate-700 text-slate-100 rounded text-[11px] font-mono font-medium transition flex items-center gap-1.5 border border-slate-700"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>VIEW SHARE CODE</span>
                  </button>

                  {!isRevoked && (
                    <button
                      type="button"
                      onClick={() => setRevokingId(attId)}
                      className="px-2.5 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded text-[11px] font-mono transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111C2E] border border-red-800/60 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
                Revoke Leave Proof?
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to revoke attestation <strong className="text-white font-mono">{revokingId}</strong>?
              This will immediately invalidate any active share codes and prevent HR from approving this leave.
            </p>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevokingId(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-[#1E293B] rounded-md transition font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-md transition uppercase tracking-wider font-mono shadow-md"
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
