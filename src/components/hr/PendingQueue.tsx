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
    <div className="rounded-xl bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#142319] border border-[#284230] flex items-center justify-center text-[#94C3A3]">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white block">
              PENDING REQUESTS (H1)
            </span>
            <span className="text-[10px] text-slate-400 font-sans">Queue of employee share codes</span>
          </div>
        </div>
        {onRefreshQueue && (
          <button
            type="button"
            onClick={onRefreshQueue}
            className="p-1 text-slate-400 hover:text-white"
            title="Refresh queue"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Queue items */}
      <div className="space-y-3">
        {queue.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 font-sans border border-dashed border-[#1E293B] rounded-lg">
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
                    ? 'bg-[#0F172A] border-[#4A7C59] ring-1 ring-[#4A7C59]/50'
                    : 'bg-[#0F172A]/50 border-[#1E293B] hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5 font-condensed tracking-wide">
                      <span>[{item.employeeName}]</span>
                      <span className="text-slate-400 font-normal font-sans text-[11px]">• {categoryShort}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {item.submissionTime} • Code: <strong className="text-slate-200">{item.shareCode}</strong>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      item.status === 'VERIFIED'
                        ? 'bg-[#142319] text-[#94C3A3] border border-[#284230]'
                        : item.status === 'APPROVED'
                        ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                        : item.status === 'REJECTED'
                        ? 'bg-red-950/60 text-red-400 border border-red-800'
                        : 'bg-amber-950/40 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {item.statusNote && (
                  <div className="text-[11px] font-mono text-[#94C3A3] flex items-center gap-1">
                    <span>{item.statusNote}</span>
                  </div>
                )}

                <div className="pt-1.5 border-t border-[#1E293B] flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => onSelectRequest(item)}
                    className="px-3 py-1 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <span>[PROCESS]</span>
                    <ArrowRight className="w-3 h-3 text-[#94C3A3]" />
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
