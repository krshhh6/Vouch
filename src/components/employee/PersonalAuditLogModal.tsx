'use client';

import React from 'react';
import { History, X, ShieldCheck, CheckCircle2, Clock, Activity, AlertTriangle } from 'lucide-react';
import { AuditLogEntry, SignedAttestation } from '@/lib/types';

interface PersonalAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLogEntry[];
  selectedAttestation: SignedAttestation | null;
}

export default function PersonalAuditLogModal({
  isOpen,
  onClose,
  auditLogs,
  selectedAttestation,
}: PersonalAuditLogModalProps) {
  if (!isOpen) return null;

  const relevantLogs = selectedAttestation
    ? auditLogs.filter(a => a.attestationId === selectedAttestation.payload.attestationId)
    : auditLogs;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0B1120] border border-slate-700 rounded-xl p-6 max-w-xl w-full space-y-5 shadow-2xl relative">
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
            <History className="w-5 h-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              PERSONAL AUDIT LOG (E7)
            </span>
          </div>
          <h3 className="text-xl font-bold text-white font-condensed uppercase tracking-wide">
            Credential Access Records
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Every access event recorded when an authorized verifier requested this credential. Zero diagnostic data is disclosed.
          </p>
        </div>

        {/* Credential Scope */}
        {selectedAttestation && (
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Target Credential:</span>
            <span className="font-bold text-white">
              {selectedAttestation.payload.coarseCategory} ({selectedAttestation.payload.attestationId})
            </span>
          </div>
        )}

        {/* Audit Entries List */}
        <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
          {relevantLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-sans border border-dashed border-[#1E293B] rounded-lg">
              No verifications recorded for this credential yet. Share a code with HR to begin.
            </div>
          ) : (
            relevantLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">
                    {new Date(log.viewedAt).toLocaleDateString()} {new Date(log.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.outcome === 'APPROVED'
                        ? 'bg-[#142319] text-[#94C3A3] border border-[#284230]'
                        : log.outcome === 'VERIFIED'
                        ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                        : 'bg-red-950/60 text-red-400 border border-red-800'
                    }`}
                  >
                    {log.outcome === 'APPROVED' ? '✓ APPROVED' : log.outcome}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Verifier: <strong className="text-white">{log.viewerEmail}</strong></span>
                  <span className="text-slate-500">Code: {log.shareCode}</span>
                </div>

                <p className="text-[10px] text-slate-400 font-sans pt-1 border-t border-[#1E293B]/60">
                  Verified coarse category, dates, and licensed status only. Zero medical notes or diagnoses were accessed.
                </p>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
          <span className="text-[11px] font-mono text-slate-400">
            Total Views: <strong className="text-white">{relevantLogs.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] text-white border border-slate-700"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
