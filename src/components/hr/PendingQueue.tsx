'use client';

import React from 'react';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, UserCheck, RefreshCw } from 'lucide-react';
import { QueueItem } from '@/lib/types';

interface PendingQueueProps {
  queue: QueueItem[];
  onSelectRequest: (item: QueueItem) => void;
  activeShareCode?: string;
  onRefreshQueue?: () => void;
}

export default function PendingQueue({
  queue,
  onSelectRequest,
  activeShareCode,
  onRefreshQueue,
}: PendingQueueProps) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
              Pending Queue
            </span>
            <span className="text-xs text-slate-500 font-sans">Queue of employee share codes</span>
          </div>
        </div>
        {onRefreshQueue && (
          <button
            type="button"
            onClick={onRefreshQueue}
            className="p-1 text-slate-400 hover:text-slate-700"
            title="Refresh queue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Queue items */}
      <div className="space-y-3">
        {queue.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 font-sans border border-dashed border-slate-200 rounded-lg">
            No pending verification requests in queue.
          </div>
        ) : (
          queue.map((item) => {
            const isActive = activeShareCode?.toUpperCase() === item.shareCode.toUpperCase();
            const categoryShort = item.category === 'STATUTORY_MATERNITY' 
              ? 'Maternity' 
              : item.category === 'STATUTORY_MEDICAL' 
              ? 'Medical' 
              : 'Caregiving';

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all space-y-2 text-xs ${
                  isActive
                    ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500/30'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{item.employeeName}</span>
                      <span className="text-slate-500 font-normal font-sans text-xs">• {categoryShort}</span>
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                      {item.submissionTime} • Code: <strong className="text-slate-800">{item.shareCode}</strong>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
                      item.status === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : item.status === 'APPROVED'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : item.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {item.statusNote && (
                  <div className="text-xs text-emerald-700 flex items-center gap-1">
                    <span>{item.statusNote}</span>
                  </div>
                )}

                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => onSelectRequest(item)}
                    className="px-3 py-1 rounded text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-xs transition-colors flex items-center gap-1"
                  >
                    <span>Process</span>
                    <ArrowRight className="w-3 h-3 text-blue-600" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
