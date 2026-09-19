'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  MessageSquare,
  Plus
} from 'lucide-react';
import { LeaveApplication } from '@/lib/types';

interface LeaveStatusTrackerProps {
  applications: LeaveApplication[];
  onOpenApplyModal: () => void;
}

export default function LeaveStatusTracker({
  applications,
  onOpenApplyModal,
}: LeaveStatusTrackerProps) {
  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const startFmt = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endFmt = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startFmt} – ${endFmt}`;
    } catch {
      return `${startStr} – ${endStr}`;
    }
  };

  const formatTimestamp = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-[#111C2E] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h3 className="text-lg font-bold font-condensed uppercase tracking-wider text-white">
              My Leave Requests &amp; Status
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tracking of statutory leave applications and HR review decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenApplyModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-mono text-xs space-y-3">
          <Clock className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
          <p>You haven't submitted any leave requests yet.</p>
          <button
            type="button"
            onClick={onOpenApplyModal}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono inline-flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Submit Your First Request</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isApproved = app.status === 'APPROVED';
            const isRejected = app.status === 'REJECTED';
            const isPending = app.status === 'PENDING';

            return (
              <div
                key={app.id}
                className={`p-5 rounded-xl border transition-all ${
                  isApproved
                    ? 'bg-[#0B1422] border-emerald-800/50 text-slate-200'
                    : isRejected
                    ? 'bg-[#181119] border-red-900/40 text-slate-300'
                    : 'bg-[#0D1524] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white font-condensed uppercase tracking-wider">
                        {app.categoryLabel}
                      </h4>
                      {app.proofAttached && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          VERIFIED CLAIM
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      {formatDateRange(app.startDate, app.endDate)} • <strong className="text-slate-200">{app.durationDays} days</strong>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isApproved && (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700 flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        APPROVED
                      </span>
                    )}
                    {isPending && (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700 flex items-center gap-1.5 shadow-sm animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        PENDING HR REVIEW
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-950/80 text-red-300 border border-red-700 flex items-center gap-1.5 shadow-sm">
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        DECLINED
                      </span>
                    )}
                  </div>
                </div>

                {/* Additional Details & HR Review Comment */}
                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500">Request ID:</span>{' '}
                    <span className="text-slate-300">{app.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Submitted:</span>{' '}
                    <span className="text-slate-300">{formatTimestamp(app.appliedAt)}</span>
                  </div>

                  {app.reviewedBy && (
                    <div className="sm:col-span-2 pt-1.5 border-t border-slate-800/50 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 text-[11px]">
                        <span className="text-slate-400 font-bold">
                          Decision by {app.reviewedBy} on {formatTimestamp(app.reviewedAt || '')}:
                        </span>
                        <p className="text-slate-300 italic mt-0.5">
                          "{app.reviewComment || 'Request confirmed and logged in HR entitlement ledger.'}"
                        </p>
                      </div>
                    </div>
                  )}

                  {isPending && (
                    <div className="sm:col-span-2 text-[11px] text-amber-400/90 font-mono">
                      ⏳ Awaiting HR benefits officer confirmation. You will receive an instant notification upon review.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
