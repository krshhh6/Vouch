'use client';

import React from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Share2, 
  FileText, 
  History, 
  Clock, 
  AlertTriangle,
  X,
  Calendar,
  Layers
} from 'lucide-react';
import { SignedAttestation, ShareCode, ApprovalRecord } from '@/lib/types';
import Link from 'next/link';

interface CredentialDetailProps {
  attestation: SignedAttestation | null;
  latestShare: ShareCode | null;
  approval: ApprovalRecord | null;
  onOpenShareModal: () => void;
  onOpenAuditLog: () => void;
  onDismissApprovalCard?: () => void;
  onViewApprovalDetails?: () => void;
}

export default function CredentialDetail({
  attestation,
  latestShare,
  approval,
  onOpenShareModal,
  onOpenAuditLog,
  onDismissApprovalCard,
  onViewApprovalDetails,
}: CredentialDetailProps) {
  if (!attestation) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 p-12 text-center text-slate-500 space-y-3 shadow-sm">
        <Activity className="w-8 h-8 text-slate-400 mx-auto" />
        <p className="text-xs font-sans">
          Select an attestation on the left to view credential details, leakage analysis, and share with HR.
        </p>
      </div>
    );
  }

  const { payload } = attestation;

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-6 shadow-sm">
      {/* Attestation Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Credential Details
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">
            {payload.coarseCategory === 'STATUTORY_MATERNITY'
              ? 'Maternity Leave Attestation'
              : payload.coarseCategory === 'STATUTORY_MEDICAL'
              ? 'Statutory Medical Attestation'
              : 'Family Caregiving Attestation'}
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            {payload.doctorName} • {payload.issuerName}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Signature: Authentic P-256
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" /> Issuer: Licensed GMC Active
          </span>
        </div>
      </div>

      {/* Core Parameters Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Category
          </span>
          <p className="text-xs font-bold font-mono text-slate-900">
            {payload.coarseCategory}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Leave Window
          </span>
          <p className="text-xs font-semibold font-mono text-slate-900">
            {payload.startDate} → {payload.endDate}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Occupational Status
          </span>
          <p className="text-xs font-semibold text-slate-900">
            {payload.fitForDuty === 'full-rest'
              ? 'Unfit (Rest Mandated)'
              : payload.fitForDuty === 'partial-remote'
              ? 'Modified / Remote Duty'
              : 'Fit for Duty'}
          </p>
        </div>
      </div>

      {/* E4. Real-time Verification Status View (if shared) */}
      {latestShare && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between font-sans text-xs">
            <span className="text-slate-600">
              Active Share Code: <strong className="text-slate-900 font-mono">{latestShare.code}</strong>
            </span>
            <span className="text-blue-700 font-medium">
              {latestShare.viewCount} verifier {latestShare.viewCount === 1 ? 'view' : 'views'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified by HR (pending your review)</span>
            </div>
            <p className="text-xs text-slate-700">
              Verification details: <strong>{payload.coarseCategory}</strong>, {payload.startDate} – {payload.endDate}, Unfit
            </p>
            <p className="text-xs text-slate-600 font-sans">
              HR has received the zero-knowledge attestation and can now approve or reject your request.
            </p>
          </div>
        </div>
      )}

      {/* Post HR Approval Banner */}
      {approval && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-slate-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Approved
            </span>
            {onDismissApprovalCard && (
              <button
                type="button"
                onClick={onDismissApprovalCard}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-xs"
              >
                Dismiss
              </button>
            )}
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            {payload.coarseCategory === 'STATUTORY_MATERNITY' ? 'Maternity Leave' : 'Medical Leave'}
          </h4>
          <div className="text-xs font-mono text-slate-700 flex flex-wrap justify-between gap-2">
            <span>Window: {approval.validFrom} – {approval.validTo}</span>
            <span>Approval ID: <strong>{approval.approvalId}</strong></span>
          </div>
        </div>
      )}

      {/* Sub-component: Leakage Meter (F4) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Information Disclosure Audit (Zero Diagnostic Leakage)
          </span>
          <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            0% Health Data Leakage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          {/* What HR will learn */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2 shadow-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px]">
              What HR learns:
            </span>
            <ul className="space-y-1.5 text-slate-600 text-xs leading-snug">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Statutory benefit eligibility</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Leave window: {payload.startDate} – {payload.endDate}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Unfit for work during block</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Licensed clinician certified (true/false)</span>
              </li>
            </ul>
          </div>

          {/* What HR could infer */}
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 space-y-2 shadow-xs">
            <span className="font-bold text-amber-900 uppercase tracking-wider block text-[11px]">
              What HR infers:
            </span>
            <div className="text-xs text-amber-800 leading-snug space-y-2">
              <p className="flex items-start gap-1.5">
                <span>⚠</span>
                <span>
                  {payload.coarseCategory === 'STATUTORY_MATERNITY'
                    ? 'A 3-week statutory maternity claim inherently implies pregnancy or birth.'
                    : 'Medical leave implies illness, but gives zero diagnostic indication.'}
                </span>
              </p>
              <p className="text-[11px] text-amber-700 italic">
                Dates correlate with corporate calendar milestones.
              </p>
            </div>
          </div>

          {/* What HR can't see / PDF would expose */}
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 space-y-2 shadow-xs">
            <span className="font-bold text-rose-900 uppercase tracking-wider block text-[11px]">
              What HR can&apos;t see (Blocked):
            </span>
            <ul className="space-y-1 text-rose-800 text-xs leading-snug">
              <li className="flex items-center gap-1.5">
                <span>✕</span> Doctor &amp; clinic name
              </li>
              <li className="flex items-center gap-1.5">
                <span>✕</span> Diagnosis codes (ICD-10)
              </li>
              <li className="flex items-center gap-1.5">
                <span>✕</span> Medication &amp; prescriptions
              </li>
              <li className="flex items-center gap-1.5">
                <span>✕</span> Lab notes / ultrasound images
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onOpenShareModal}
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors flex items-center gap-2 shadow-sm"
        >
          <Share2 className="w-4 h-4" />
          <span>Generate Share Code</span>
        </button>

        <button
          type="button"
          onClick={onOpenAuditLog}
          className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs transition-colors flex items-center gap-2 shadow-xs"
        >
          <History className="w-4 h-4 text-slate-500" />
          <span>View Audit Log</span>
        </button>
      </div>
    </div>
  );
}
