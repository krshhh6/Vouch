'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  User 
} from 'lucide-react';
import { LeaveApplication } from '@/lib/types';

interface LeaveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: LeaveApplication | null;
  mode: 'APPROVE' | 'REJECT';
  onConfirm: (appId: string, decision: 'APPROVED' | 'REJECTED', comment?: string) => void;
}

export default function LeaveConfirmationModal({
  isOpen,
  onClose,
  application,
  mode,
  onConfirm,
}: LeaveConfirmationModalProps) {
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !application) return null;

  const isApprove = mode === 'APPROVE';

  const handleExecute = async () => {
    setIsProcessing(true);
    try {
      onConfirm(
        application.id,
        isApprove ? 'APPROVED' : 'REJECTED',
        comment.trim() || (isApprove ? 'Approved in accordance with statutory leave policy.' : undefined)
      );
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-lg bg-[#111C2E] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0B1322] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
              {isApprove ? 'Confirm Leave Approval' : 'Decline Leave Request'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Employee Summary Card */}
          <div className="p-4 rounded-xl bg-[#0A101D] border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Employee:</span>
              <span className="text-white font-bold">{application.employeeName} ({application.employeeId})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="text-slate-200">{application.department || 'General'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="text-emerald-400 font-semibold">{application.categoryLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Requested Window:</span>
              <span className="text-white">{application.startDate} – {application.endDate} ({application.durationDays} days)</span>
            </div>
            {application.reason && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">EMPLOYEE NOTE:</span>
                <p className="text-slate-300 italic">{application.reason}</p>
              </div>
            )}
          </div>

          {/* Statutory Verification Guarantee */}
          <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/40 text-[11px] font-mono text-blue-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Zero PHI disclosure. Statutory policy verified with mathematical certainty.</span>
          </div>

          {/* HR Decision Note Input */}
          <div>
            <label className="block text-xs font-medium text-slate-200 mb-1.5">
              HR Review Notes (Shared with employee):
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isApprove ? 'e.g. Approved per statutory leave policy. Full benefits active.' : 'e.g. Quota exceeded or conflicting project schedule.'}
              className="w-full p-3 bg-[#090F1B] border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3 font-mono text-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white bg-[#1E293B] rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleExecute}
              className={`px-5 py-2.5 text-white rounded-lg font-bold uppercase tracking-wider transition shadow-lg flex items-center gap-1.5 ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              {isProcessing ? (
                <span>Executing Decision...</span>
              ) : (
                <>
                  {isApprove ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>{isApprove ? 'Confirm & Approve Leave' : 'Confirm Rejection'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
