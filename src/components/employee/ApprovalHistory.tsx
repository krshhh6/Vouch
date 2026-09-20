'use client';

import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, ShieldCheck, Calendar, Clock, Layers } from 'lucide-react';
import { ApprovalRecord } from '@/lib/types';

interface ApprovalHistoryProps {
  approvals: ApprovalRecord[];
  onSelectApproval?: (approval: ApprovalRecord) => void;
  selectedApprovalId?: string | null;
}

export default function ApprovalHistory({
  approvals,
  onSelectApproval,
  selectedApprovalId,
}: ApprovalHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
              Approval History
            </span>
            <span className="text-xs text-slate-500 font-sans">Cumulative approved leaves</span>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {approvals.length} approved
        </span>
      </div>

      {/* Approvals Card List */}
      <div className="space-y-3">
        {approvals.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 font-sans border border-dashed border-slate-200 rounded-lg">
            No approved leaves on record yet. Approvals from HR will appear here.
          </div>
        ) : (
          approvals.map((app, idx) => {
            const isExpanded = expandedId === app.approvalId;
            const isSelected = selectedApprovalId === app.approvalId;
            const appCode = `APP-${String(idx + 1).padStart(2, '0')}`;
            const categoryLabel = app.category === 'STATUTORY_MATERNITY'
              ? 'Maternity'
              : app.category === 'STATUTORY_MEDICAL'
              ? 'Medical'
              : 'Caregiving';

            return (
              <div
                key={app.approvalId}
                className={`p-4 rounded-xl border transition-all text-xs space-y-2.5 ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500/30'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{appCode}</span>
                      <span className="text-slate-400">•</span>
                      <span>{categoryLabel}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      {app.validFrom} – {app.validTo}
                    </p>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {app.status || 'Active'}
                  </span>
                </div>

                {/* Validity Notice */}
                <p className="text-xs text-slate-700 font-sans leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  This leave is valid from <strong>{app.validFrom}</strong> to <strong>{app.validTo}</strong>. You may begin the approved leave period.
                </p>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs font-mono text-slate-500">
                  <span>ID: <strong className="text-slate-700">{app.approvalId}</strong></span>

                  <button
                    type="button"
                    onClick={() => toggleExpand(app.approvalId)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-300 shadow-xs transition-colors"
                  >
                    <span>View Details</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expandable Underlying Attestation (Zero Medical Data) */}
                {isExpanded && (
                  <div className="mt-2 p-3.5 rounded-lg bg-white border border-slate-200 space-y-2 text-xs text-slate-700 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 text-slate-500">
                      <span className="font-semibold text-slate-900">
                        Verified Credential Reference
                      </span>
                      <span className="font-mono text-xs">Share: {app.shareCode}</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div>Coarse Category: <strong className="text-slate-900 font-mono">{app.category}</strong></div>
                      <div>Approved By: <strong className="text-slate-800">{app.approvedBy}</strong></div>
                      <div>Approved At: <span className="text-slate-500 font-mono">{new Date(app.approvedAt).toLocaleDateString()} {new Date(app.approvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span></div>
                      {app.receiptId && (
                        <div>Receipt ID: <strong className="text-blue-700 font-mono">{app.receiptId}</strong></div>
                      )}
                      {app.comment && (
                        <div>HR Notes: <span className="text-slate-600 italic">{app.comment}</span></div>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 font-sans pt-1.5 border-t border-slate-100">
                      Zero health records retained: only leave window, approval timestamp, and cryptographic receipt hash.
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
