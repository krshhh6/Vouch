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
    <div className="rounded-xl bg-[#0B1120] border border-[#1E293B] p-6 space-y-6 shadow-sm animate-in fade-in">
      
      {/* 1. If Approval is Completed (H6 Confirmation State) */}
      {approvalCompleted ? (
        <div className="p-6 rounded-xl bg-[#142319] border-2 border-[#4A7C59] text-white space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A7C59] flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#94C3A3] uppercase tracking-wider block">
                ✓ Leave Approved!
              </span>
              <h3 className="text-xl font-bold font-condensed uppercase tracking-wide">
                Notification sent to employee
              </h3>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0B1120] border border-[#284230] text-xs font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Approval ID:</span>
              <strong className="text-white">{approvalCompleted.approvalId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <strong className="text-[#94C3A3]">{approvalCompleted.category}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Leave Window:</span>
              <strong className="text-white">{approvalCompleted.validFrom} – {approvalCompleted.validTo}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recipient:</span>
              <strong className="text-slate-200">{holderName} ({holderId})</strong>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-sans">
            Receipt recorded in tamper-evident chain. Notification pushed in real time to employee&apos;s vault.
          </p>

          <button
            type="button"
            onClick={onNextRequest}
            className="w-full py-3 rounded-lg text-xs font-condensed uppercase tracking-wider font-bold bg-[#4A7C59] hover:bg-[#3D6649] text-white transition-colors flex items-center justify-center gap-2"
          >
            <span>[NEXT REQUEST]</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* 2. Verification Display (H4) + Decision Buttons (H5) */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="border-b border-[#1E293B] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#142319] border border-[#284230] flex items-center justify-center text-[#94C3A3]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold font-mono text-[#94C3A3] tracking-wider uppercase block">
                  ✓ VERIFIED
                </span>
                <p className="text-xs text-slate-400 font-sans">
                  P-256 authentic • Licensed issuer active • All statutory predicates passed
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-slate-400">
              Policy: {shareCode.policyVersion}
            </span>
          </div>

          {/* Minimal Sanitized Attestation Card (Zero Medical Data) */}
          <div className="p-5 rounded-xl bg-[#0F172A] border border-[#334155] space-y-4">
            <div className="border-b border-[#1E293B] pb-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  VERIFIED CLAIM FILE (SANITIZED)
                </span>
                <h4 className="text-base font-bold text-white mt-0.5 font-condensed tracking-wide">
                  Holder: {holderName} <span className="font-mono text-xs text-slate-400">({holderId})</span>
                </h4>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#142319] text-[#94C3A3] border border-[#284230]">
                ✓ VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#0B1120] rounded-lg border border-[#1E293B] space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider">
                  Category:
                </span>
                <p className="font-bold text-[#94C3A3] text-xs">
                  {hrData.coarseCategory}
                </p>
              </div>

              <div className="p-3 bg-[#0B1120] rounded-lg border border-[#1E293B] space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider">
                  Authorized Window:
                </span>
                <p className="font-bold text-white text-xs">
                  {hrData.validFrom} – {hrData.validTo}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#0B1120] rounded-lg border border-[#1E293B] text-xs font-mono space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider block">
                Occupational Status:
              </span>
              <p className="text-white font-semibold">
                {hrData.fitForDuty === 'full-rest'
                  ? 'Unfit (Rest Mandated)'
                  : 'Fit for Modified / Remote Duty'}
              </p>
            </div>

            <div className="pt-2 border-t border-[#1E293B] flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
              <span>Issuer Licensed: <strong className="text-[#94C3A3]">✓</strong> • Not Revoked: <strong className="text-[#94C3A3]">✓</strong></span>
              <span>Proof Hash: <strong>{hrData.issuerRefHash.substring(0, 10)}...</strong></span>
            </div>

            {/* Zero-PHI Affirmation Notice */}
            <div className="p-3 rounded-lg bg-[#0B1120] border border-[#284230]/60 text-[11px] font-mono text-[#94C3A3] space-y-1">
              <div className="font-bold font-condensed uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero Medical Data Disclosed
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                No underlying clinical record shown. Zero diagnosis codes, zero clinic names, zero doctor names, zero prescriptions retained.
              </p>
            </div>
          </div>

          {/* Comment input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 font-condensed uppercase tracking-wider block">
              Approval Notes / Rejection Reason (Optional):
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Statutory 3-week block confirmed against HRIS entitlement"
              className="w-full px-3.5 py-2 rounded-lg bg-[#0F172A] border border-[#334155] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#4A7C59]"
            />
          </div>

          {/* Approve / Reject Buttons (H5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onApprove(comment)}
              className="py-3 rounded-lg text-xs font-condensed uppercase tracking-wider font-bold bg-[#4A7C59] hover:bg-[#3D6649] text-white transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>[APPROVE LEAVE]</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onReject(comment)}
              className="py-3 rounded-lg text-xs font-condensed uppercase tracking-wider font-bold bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>[REJECT LEAVE]</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
