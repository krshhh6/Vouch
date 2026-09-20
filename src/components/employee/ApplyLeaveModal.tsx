'use client';

import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { 
  CoarseCategory, 
  SignedAttestation, 
  LeaveApplication, 
  UserSession 
} from '@/lib/types';
import { 
  submitLeaveApplication, 
  createShareCode, 
  calculateDaysBetween 
} from '@/lib/storage';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  attestations: SignedAttestation[];
  onSubmitted: (application: LeaveApplication) => void;
}

interface LeaveCategoryOption {
  value: CoarseCategory;
  label: string;
  icon: string;
  defaultDays: number;
  description: string;
}

const CATEGORY_OPTIONS: LeaveCategoryOption[] = [
  {
    value: 'STATUTORY_MATERNITY',
    label: 'Maternity Leave',
    icon: '🤰',
    defaultDays: 22,
    description: 'Statutory 26-week protection under Maternity Benefit Act',
  },
  {
    value: 'STATUTORY_MEDICAL',
    label: 'Medical Leave',
    icon: '🏥',
    defaultDays: 7,
    description: 'Clinical health, illness, or doctor-prescribed recovery rest',
  },
  {
    value: 'STATUTORY_MEDICAL',
    label: 'Surgical Recovery',
    icon: '🔬',
    defaultDays: 14,
    description: 'Post-operative medical rest and rehabilitation',
  },
  {
    value: 'CAREGIVING',
    label: 'Caregiving Leave',
    icon: '👶',
    defaultDays: 5,
    description: 'Family medical care or compassionate leave',
  },
];

export default function ApplyLeaveModal({
  isOpen,
  onClose,
  currentUser,
  attestations,
  onSubmitted,
}: ApplyLeaveModalProps) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-22');
  const [reason, setReason] = useState('');
  const [attachAttestation, setAttachAttestation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedCategory = CATEGORY_OPTIONS[categoryIndex];
  const durationDays = startDate && endDate ? calculateDaysBetween(startDate, endDate) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!startDate || !endDate) {
      setErrorMsg('Please select both start and end dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('Start date cannot be after end date.');
      return;
    }

    setIsSubmitting(true);

    try {
      let shareCodeString: string | undefined = undefined;
      let hasProof = false;

      // If user has an attestation in wallet and selected to attach it, generate a share code
      if (attachAttestation && attestations.length > 0) {
        const matchingAtt = attestations[0];
        const share = await createShareCode(matchingAtt, 'maternity-mba-1961', 24);
        shareCodeString = share.code;
        hasProof = true;
      }

      const application = submitLeaveApplication({
        employeeId: currentUser.employeeId || currentUser.email,
        employeeName: currentUser.name,
        department: currentUser.department || 'Product Engineering',
        category: selectedCategory.value,
        categoryLabel: selectedCategory.label,
        startDate,
        endDate,
        durationDays,
        reason: reason.trim() || undefined,
        shareCode: shareCodeString,
        proofAttached: hasProof,
      });

      onSubmitted(application);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit leave application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col font-sans">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h3 className="text-base font-bold text-slate-900">
              Apply For Statutory Leave
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Applicant Info Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-sans">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">APPLICANT</span>
              <span className="text-slate-900 font-bold">{currentUser.name}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">EMPLOYEE ID / DEPT</span>
              <span className="text-blue-700 font-semibold">{currentUser.employeeId || 'EMP-9021'} • {currentUser.department}</span>
            </div>
          </div>

          {/* Leave Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Leave Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CATEGORY_OPTIONS.map((opt, idx) => {
                const isSelected = categoryIndex === idx;
                return (
                  <button
                    key={`${opt.label}-${idx}`}
                    type="button"
                    onClick={() => setCategoryIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs ring-1 ring-blue-500/30'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Pickers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Leave Window *
              </label>
              {durationDays > 0 && (
                <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                  {durationDays} calendar days requested
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-medium text-slate-600 mb-1">
                  Start Date:
                </span>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-sans focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-600 mb-1">
                  End Date:
                </span>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-sans focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Optional Reason or Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note or Reason for HR (Optional)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Scheduled medical leave per doctor advice."
              className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 font-sans focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Zero-Knowledge Credential Proof Attachment */}
          {attestations.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attachAttestation}
                  onChange={(e) => setAttachAttestation(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300 bg-white"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Attach verified clinic credential from wallet
                  </span>
                  <span className="text-xs text-slate-500 block font-sans">
                    Generates a zero-knowledge 24h share code for HR. Diagnosis details remain 100% private.
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold tracking-wide transition flex items-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Leave Application</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
