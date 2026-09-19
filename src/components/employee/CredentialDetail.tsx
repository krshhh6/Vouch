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
      <div className="rounded-xl bg-[#0B1120] border border-[#1E293B] p-12 text-center text-slate-400 space-y-3">
        <Activity className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="text-xs font-mono">
          Select an attestation on the left to view credential details, leakage analysis, and share with HR.
        </p>
      </div>
    );
  }

  const { payload } = attestation;

  return (
    <div className="rounded-xl bg-[#0B1120] border border-[#1E293B] p-6 space-y-6 shadow-sm">
      {/* Attestation Header */}
      <div className="border-b border-[#1E293B] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#94C3A3] uppercase tracking-wider">
            CREDENTIAL DETAIL (E2)
          </span>
          <h2 className="text-2xl font-bold text-white mt-1 font-condensed uppercase tracking-wider">
            {payload.coarseCategory === 'STATUTORY_MATERNITY'
              ? 'Maternity Leave Attestation'
              : payload.coarseCategory === 'STATUTORY_MEDICAL'
              ? 'Statutory Medical Attestation'
              : 'Family Caregiving Attestation'}
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            {payload.doctorName} • {payload.issuerName}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1 font-mono text-xs">
          <span className="text-[#94C3A3] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Signature: ✓ Authentic P-256
          </span>
          <span className="text-slate-300 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4A7C59]" /> Issuer: ✓ Licensed GMC Active
          </span>
        </div>
      </div>

      {/* Core Parameters Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[#0F172A] rounded-lg border border-[#1E293B] space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider">
            Category
          </span>
          <p className="text-xs font-bold font-mono text-white">
            {payload.coarseCategory}
          </p>
        </div>

        <div className="p-3.5 bg-[#0F172A] rounded-lg border border-[#1E293B] space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider">
            Window
          </span>
          <p className="text-xs font-semibold font-mono text-white">
            {payload.startDate} → {payload.endDate}
          </p>
        </div>

        <div className="p-3.5 bg-[#0F172A] rounded-lg border border-[#1E293B] space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider">
            Occupational Status
          </span>
          <p className="text-xs font-semibold text-white">
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
        <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B] space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-slate-400">
              Active Share Code: <strong className="text-white">{latestShare.code}</strong>
            </span>
            <span className="text-[#94C3A3]">
              {latestShare.viewCount} verifier {latestShare.viewCount === 1 ? 'view' : 'views'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#0B1120] border border-[#284230]/70 space-y-1.5">
            <div className="flex items-center gap-2 text-[#94C3A3] font-bold font-mono">
              <CheckCircle2 className="w-4 h-4 text-[#94C3A3]" />
              <span>✓ Verified by HR (pending your review)</span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">
              Verification details: <strong>{payload.coarseCategory}</strong>, {payload.startDate} – {payload.endDate}, Unfit
            </p>
            <p className="text-[11px] text-slate-400 font-sans">
              HR has received the zero-knowledge attestation and can now approve or reject your request.
            </p>
          </div>
        </div>
      )}

      {/* Post HR Approval Banner (Diagram Center Section) */}
      {approval && (
        <div className="p-4 rounded-xl bg-[#142319] border-2 border-[#4A7C59] text-white space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-[#94C3A3] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#94C3A3]" />
              ✓ APPROVED
            </span>
            {onDismissApprovalCard && (
              <button
                type="button"
                onClick={onDismissApprovalCard}
                className="text-[11px] font-condensed uppercase font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-700"
              >
                [DISMISS]
              </button>
            )}
          </div>
          <h4 className="text-base font-bold font-condensed uppercase tracking-wide">
            {payload.coarseCategory === 'STATUTORY_MATERNITY' ? 'Maternity Leave' : 'Medical Leave'}
          </h4>
          <div className="text-xs font-mono text-slate-300 flex flex-wrap justify-between gap-2">
            <span>Window: {approval.validFrom} – {approval.validTo}</span>
            <span>Approval ID: <strong>{approval.approvalId}</strong></span>
          </div>
        </div>
      )}

      {/* Sub-component: Leakage Meter (F4) */}
      <div className="rounded-xl border border-[#334155] bg-[#0F172A] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#4A7C59]" />
            LEAKAGE METER (F4) — INFORMATION DISCLOSURE AUDIT
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#142319] text-[#94C3A3] border border-[#284230]">
            0% Health Data Leakage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          {/* What HR will learn */}
          <div className="p-3.5 rounded-lg bg-[#0B1120] border border-[#1E293B] space-y-2">
            <span className="font-bold text-white uppercase font-condensed tracking-wider block text-[11px]">
              What HR learns:
            </span>
            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-snug">
              <li className="flex items-start gap-1.5">
                <span className="text-[#94C3A3] font-bold">•</span>
                <span>Statutory benefit eligibility</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#94C3A3] font-bold">•</span>
                <span>Leave window: {payload.startDate} – {payload.endDate}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#94C3A3] font-bold">•</span>
                <span>Unfit for work during block</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#94C3A3] font-bold">•</span>
                <span>Licensed clinician certified (true/false)</span>
              </li>
            </ul>
          </div>

          {/* What HR could infer */}
          <div className="p-3.5 rounded-lg bg-[#0B1120] border border-[#1E293B] space-y-2">
            <span className="font-bold text-amber-300 uppercase font-condensed tracking-wider block text-[11px]">
              What HR infers:
            </span>
            <div className="text-[11px] text-slate-300 leading-snug space-y-2">
              <p className="flex items-start gap-1.5 text-amber-200/90">
                <span>⚠</span>
                <span>
                  {payload.coarseCategory === 'STATUTORY_MATERNITY'
                    ? 'A 3-week statutory maternity claim inherently implies pregnancy or birth.'
                    : 'Medical leave implies illness, but gives zero diagnostic indication.'}
                </span>
              </p>
              <p className="text-[10px] text-slate-400 italic">
                Dates correlate with corporate calendar milestones.
              </p>
            </div>
          </div>

          {/* What HR can't see / PDF would expose */}
          <div className="p-3.5 rounded-lg bg-[#0B1120] border border-[#1E293B] space-y-2">
            <span className="font-bold text-red-400 uppercase font-condensed tracking-wider block text-[11px]">
              What HR can&apos;t see (Blocked):
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px] leading-snug">
              <li className="flex items-center gap-1.5 text-red-300">
                <span>❌</span> Doctor &amp; clinic name
              </li>
              <li className="flex items-center gap-1.5 text-red-300">
                <span>❌</span> Diagnosis codes (ICD-10)
              </li>
              <li className="flex items-center gap-1.5 text-red-300">
                <span>❌</span> Medication &amp; prescriptions
              </li>
              <li className="flex items-center gap-1.5 text-red-300">
                <span>❌</span> Lab notes / ultrasound images
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
          className="px-5 py-3 rounded-lg bg-[#4A7C59] hover:bg-[#3D6649] text-white font-condensed font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-2 shadow-sm"
        >
          <Share2 className="w-4 h-4" />
          <span>[GENERATE SHARE CODE]</span>
        </button>

        <button
          type="button"
          onClick={onOpenAuditLog}
          className="px-4 py-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 font-condensed font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-2"
        >
          <History className="w-4 h-4 text-[#94C3A3]" />
          <span>[VIEW AUDIT LOG]</span>
        </button>
      </div>
    </div>
  );
}
