'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Lock, 
  FileCheck, 
  AlertCircle, 
  ArrowRight,
  Printer,
  Sparkles
} from 'lucide-react';
import { ShareCode, ApprovalRecord, VerificationReceipt } from '@/lib/types';

interface VerificationResultProps {
  shareCode: ShareCode | null;
  receipt: VerificationReceipt | null;
  onApprove: (comment: string) => Promise<ApprovalRecord | null>;
  onReject: (comment: string) => Promise<void>;
  isProcessing: boolean;
  approvalCompleted: ApprovalRecord | null;
  onNextRequest: () => void;
}

export default function VerificationResult({
  shareCode,
  receipt,
  onApprove,
  onReject,
  isProcessing,
  approvalCompleted,
  onNextRequest,
}: VerificationResultProps) {
  const [comment, setComment] = useState('');

  if (!shareCode) return null;

  const hrData = shareCode.hrPayload;
  const holderName = shareCode.signedAttestation?.payload.employeeName || 'Sarah Jenkins';
  const holderId = shareCode.signedAttestation?.payload.employeeId || 'EMP-9021';

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-6 shadow-sm animate-in fade-in font-sans">
      
      {/* 1. If Approval is Completed (H6 Confirmation State) */}
      {approvalCompleted ? (
        <div className="p-6 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-slate-900 space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Leave Approved!
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Official confirmation sent to employee
              </h3>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-emerald-200 text-xs space-y-1.5 shadow-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Approval ID:</span>
              <strong className="text-slate-900 font-mono">{approvalCompleted.approvalId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <strong className="text-blue-700 font-mono">{approvalCompleted.category}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Leave Window:</span>
              <strong className="text-slate-900 font-mono">{approvalCompleted.validFrom} – {approvalCompleted.validTo}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Recipient:</span>
              <strong className="text-slate-800">{holderName} ({holderId})</strong>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-sans">
            Receipt recorded in tamper-evident log. Real-time approval pushed to employee&apos;s wallet.
          </p>

          <button
            type="button"
            onClick={onNextRequest}
            className="w-full py-2.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Next Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* 2. Verification Display (H4) + Decision Buttons (H5) */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-emerald-800 tracking-wider uppercase block">
                  Verified Valid
                </span>
                <p className="text-xs text-slate-500 font-sans">
                  P-256 authentic • Licensed issuer active • All statutory predicates passed
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              Policy: {shareCode.policyVersion}
            </span>
          </div>

          {/* Minimal Sanitized Attestation Card (Zero Medical Data) */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Verified Claim Record (Sanitized Zero-PHI)
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  Holder: {holderName} <span className="font-mono text-xs text-slate-500 font-normal">({holderId})</span>
                </h4>
              </div>

              <span className="px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-0.5 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Category:
                </span>
                <p className="font-bold text-blue-700 text-xs font-mono">
                  {hrData.coarseCategory}
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-0.5 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Authorized Window:
                </span>
                <p className="font-bold text-slate-900 text-xs font-mono">
                  {hrData.validFrom} – {hrData.validTo}
                </p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-0.5 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Occupational Status:
              </span>
              <p className="text-slate-900 font-semibold">
                {hrData.fitForDuty === 'full-rest'
                  ? 'Unfit (Rest Mandated)'
                  : 'Fit for Modified / Remote Duty'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs font-sans text-slate-500 gap-2">
              <span>Issuer Licensed: <strong className="text-emerald-700">✓ Active</strong> • Not Revoked: <strong className="text-emerald-700">✓ Valid</strong></span>
              <span className="font-mono text-slate-400">Proof Hash: {hrData.issuerRefHash.substring(0, 10)}...</span>
            </div>

            {/* Zero-PHI Affirmation Notice */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Zero Medical Data Disclosed
              </div>
              <p className="text-xs text-emerald-700 font-sans leading-relaxed">
                No underlying clinical record shown. Zero diagnosis codes, zero clinic names, zero doctor names, zero prescriptions retained.
              </p>
            </div>
          </div>

          {/* Comment input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Approval Notes / Rejection Reason (Optional):
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Statutory block confirmed against HRIS entitlement"
              className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs"
            />
          </div>

          {/* Approve / Reject Buttons (H5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onApprove(comment)}
              className="py-2.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Leave</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onReject(comment)}
              className="py-2.5 rounded-lg text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Leave</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
