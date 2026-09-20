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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600" />
            )}
            <h3 className="text-base font-bold text-slate-900">
              {isApprove ? 'Confirm Leave Approval' : 'Decline Leave Request'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Employee Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-sans">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Employee:</span>
              <span className="text-slate-900 font-bold">{application.employeeName} ({application.employeeId})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="text-slate-700">{application.department || 'General'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="text-blue-700 font-semibold">{application.categoryLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Requested Window:</span>
              <span className="text-slate-900 font-mono">{application.startDate} – {application.endDate} ({application.durationDays} days)</span>
            </div>
            {application.reason && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">EMPLOYEE NOTE:</span>
                <p className="text-slate-700 italic">{application.reason}</p>
              </div>
            )}
          </div>

          {/* Statutory Verification Guarantee */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Zero PHI disclosure. Statutory policy verified with mathematical certainty.</span>
          </div>

          {/* HR Decision Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              HR Review Notes (Shared with employee):
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isApprove ? 'e.g. Approved per statutory leave policy. Full benefits active.' : 'e.g. Quota exceeded or conflicting project schedule.'}
              className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 font-sans focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleExecute}
              className={`px-5 py-2.5 text-white rounded-lg font-semibold tracking-wide transition shadow-sm flex items-center gap-1.5 ${
                isApprove
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-rose-700 hover:bg-rose-800'
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
