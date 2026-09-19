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
    <div className="rounded-xl bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#142319] border border-[#284230] flex items-center justify-center text-[#94C3A3]">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white block">
              APPROVAL HISTORY (E6)
            </span>
            <span className="text-[10px] text-slate-400 font-sans">Cumulative approved leaves</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0F172A] text-[#94C3A3] border border-[#284230]">
          {approvals.length} approved
        </span>
      </div>

      {/* Approvals Card List */}
      <div className="space-y-3">
        {approvals.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 font-sans border border-dashed border-[#1E293B] rounded-lg">
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
                className={`p-4 rounded-xl border transition-all text-xs space-y-2 ${
                  isSelected
                    ? 'bg-[#142319]/50 border-[#4A7C59] ring-1 ring-[#4A7C59]'
                    : 'bg-[#0F172A]/70 border-[#1E293B] hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5 font-condensed text-sm tracking-wide">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#94C3A3]" />
                      <span>✓ {appCode}</span>
                      <span className="text-slate-400">•</span>
                      <span>{categoryLabel}</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {app.validFrom} – {app.validTo}
                    </p>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#142319] text-[#94C3A3] border border-[#284230]">
                    {app.status || 'ACTIVE'}
                  </span>
                </div>

                {/* Validity Notice */}
                <p className="text-[11px] text-slate-300 font-sans leading-snug bg-[#0B1120] p-2 rounded-lg border border-[#1E293B]">
                  This leave is valid from <strong>{app.validFrom}</strong> – <strong>{app.validTo}</strong>. You may begin leave period.
                </p>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-[#1E293B] text-[10px] font-mono text-slate-400">
                  <span>ID: <strong className="text-slate-300">{app.approvalId}</strong></span>

                  <button
                    type="button"
                    onClick={() => toggleExpand(app.approvalId)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-200 font-condensed uppercase font-bold tracking-wider transition-colors"
                  >
                    <span>[VIEW]</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Expandable Underlying Attestation (Zero Medical Data) */}
                {isExpanded && (
                  <div className="mt-2 p-3 rounded-lg bg-[#0B1120] border border-[#284230] space-y-2 text-[11px] font-mono text-slate-300 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-[#1E293B] pb-1.5 text-slate-400">
                      <span className="font-bold text-white font-condensed uppercase">
                        Verified Credential Reference
                      </span>
                      <span>Share: {app.shareCode}</span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div>Coarse Category: <strong className="text-white">{app.category}</strong></div>
                      <div>Approved By: <strong className="text-slate-200">{app.approvedBy}</strong></div>
                      <div>Approved At: <span className="text-slate-400">{new Date(app.approvedAt).toLocaleDateString()} {new Date(app.approvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span></div>
                      {app.receiptId && (
                        <div>Receipt ID: <strong className="text-[#94C3A3]">{app.receiptId}</strong></div>
                      )}
                      {app.comment && (
                        <div>HR Notes: <span className="text-slate-300 italic">{app.comment}</span></div>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-500 font-sans pt-1 border-t border-[#1E293B]">
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
