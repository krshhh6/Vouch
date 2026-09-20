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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-xl w-full space-y-5 shadow-2xl relative font-sans">
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
            <History className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Access Audit Log
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Credential Access Records
          </h3>
          <p className="text-xs text-slate-600 font-sans">
            Every access event recorded when an authorized verifier requested this credential. Zero diagnostic data is disclosed.
          </p>
        </div>

        {/* Credential Scope */}
        {selectedAttestation && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Target Credential:</span>
            <span className="font-bold text-slate-900 font-mono">
              {selectedAttestation.payload.coarseCategory} ({selectedAttestation.payload.attestationId})
            </span>
          </div>
        )}

        {/* Audit Entries List */}
        <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
          {relevantLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-sans border border-dashed border-slate-200 rounded-lg">
              No verifications recorded for this credential yet. Share a code with HR to begin.
            </div>
          ) : (
            relevantLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs font-mono">
                    {new Date(log.viewedAt).toLocaleDateString()} {new Date(log.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      log.outcome === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : log.outcome === 'VERIFIED'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {log.outcome === 'APPROVED' ? 'Approved' : log.outcome}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700 text-xs">
                  <span>Verifier: <strong className="text-slate-900">{log.viewerEmail}</strong></span>
                  <span className="text-slate-500 font-mono">Code: {log.shareCode}</span>
                </div>

                <p className="text-xs text-slate-500 font-sans pt-1 border-t border-slate-200">
                  Verified coarse category, dates, and licensed status only. Zero medical notes or diagnoses were accessed.
                </p>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <span className="text-xs text-slate-600">
            Total Views: <strong className="text-slate-900">{relevantLogs.length}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
