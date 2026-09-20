'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Mail, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  Activity
} from 'lucide-react';
import { 
  CoarseCategory, 
  FineCategory, 
  FitForDutyStatus, 
  SignedAttestation, 
  ShareCode, 
  MedicalDocument,
  ClinicProfile
} from '@/lib/types';
import { 
  saveAttestation, 
  createShareCode, 
  saveClinicDocument, 
  calculateDaysBetween 
} from '@/lib/storage';
import { 
  generateECDSAKeyPair, 
  signAttestationPayload 
} from '@/lib/crypto';
import DocumentUpload from './DocumentUpload';

interface QuickCreateFormProps {
  clinicProfile: ClinicProfile;
  onCreated: (attestation: SignedAttestation, shareCode: ShareCode, doc: MedicalDocument | null) => void;
}

interface LeaveOption {
  id: string;
  coarse: CoarseCategory;
  fine: FineCategory;
  label: string;
  icon: string;
  desc: string;
  defaultDays: number;
}

const LEAVE_OPTIONS: LeaveOption[] = [
  {
    id: 'maternity',
    coarse: 'STATUTORY_MATERNITY',
    fine: 'pregnancy',
    label: 'Maternity / Pregnancy',
    icon: '🤰',
    desc: 'Statutory 26-week protection under Maternity Benefit Act',
    defaultDays: 21,
  },
  {
    id: 'medical',
    coarse: 'STATUTORY_MEDICAL',
    fine: 'general-medical',
    label: 'Medical / Health',
    icon: '🏥',
    desc: 'Standard clinical recovery and hospitalization leave',
    defaultDays: 7,
  },
  {
    id: 'surgery',
    coarse: 'STATUTORY_MEDICAL',
    fine: 'surgery',
    label: 'Surgical Recovery',
    icon: '🔬',
    desc: 'Post-operative medical rest and physical therapy',
    defaultDays: 14,
  },
  {
    id: 'caregiving',
    coarse: 'CAREGIVING',
    fine: 'bereavement',
    label: 'Caregiving',
    icon: '👶',
    desc: 'Statutory family care or compassionate leave',
    defaultDays: 5,
  },
  {
    id: 'mental-health',
    coarse: 'STATUTORY_MEDICAL',
    fine: 'mental-health',
    label: 'Mental Health',
    icon: '🧠',
    desc: 'Clinically advised psychological well-being rest',
    defaultDays: 10,
  },
];

const FITNESS_OPTIONS: Array<{
  value: FitForDutyStatus;
  label: string;
  icon: string;
  desc: string;
}> = [
  {
    value: 'full-rest',
    label: 'Unfit for work (advised rest)',
    icon: '❌',
    desc: 'Complete clinical rest prescribed. Zero work duties.',
  },
  {
    value: 'partial-remote',
    label: 'Fit with restrictions',
    icon: '⚠️',
    desc: 'Suitable for modified hours, light tasks, or remote duty only.',
  },
  {
    value: 'fit-post-leave',
    label: 'Fit for full duties on return',
    icon: '✅',
    desc: 'Unfit during leave; expected fully fit upon conclusion of period.',
  },
];

export default function QuickCreateForm({ clinicProfile, onCreated }: QuickCreateFormProps) {
  const [employeeEmail, setEmployeeEmail] = useState('sarah@company.com');
  const [employeeName, setEmployeeName] = useState('Sarah Jenkins');
  const [selectedLeaveId, setSelectedLeaveId] = useState('maternity');
  const [fromDate, setFromDate] = useState('2026-09-16');
  const [toDate, setToDate] = useState('2026-10-07');
  const [fitnessStatus, setFitnessStatus] = useState<FitForDutyStatus>('full-rest');
  const [attachedDocument, setAttachedDocument] = useState<MedicalDocument | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedOption = LEAVE_OPTIONS.find((o) => o.id === selectedLeaveId) || LEAVE_OPTIONS[0];

  // Calculate day count
  const durationDays = fromDate && toDate ? calculateDaysBetween(fromDate, toDate) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!employeeEmail || !fromDate || !toDate) {
      setFormError('Please fill in employee email, start date, and end date.');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setFormError('Start date cannot be after end date.');
      return;
    }

    setIsSubmitting(true);

    try {
      const attestationId = `LG-ATT-${Math.floor(7000 + Math.random() * 2999)}`;
      const issuedAt = new Date().toISOString();

      // Formulate canonical payload
      const payload = {
        attestationId,
        employeeName: employeeName.trim() || 'Sarah Jenkins',
        employeeId: employeeEmail.trim(),
        fineCategory: selectedOption.fine,
        coarseCategory: selectedOption.coarse,
        categoryLabel: `${selectedOption.label} Entitlement`,
        fitForDuty: fitnessStatus,
        fitForDutyNotes: fitnessStatus === 'partial-remote' ? 'Light duty and remote work only' : undefined,
        startDate: fromDate,
        endDate: toDate,
        expectedReturnDate: toDate,
        issuerId: 'clinic-summit-wh',
        issuerName: clinicProfile.clinicName,
        doctorName: clinicProfile.doctorName,
        issuerRegNumber: clinicProfile.regNumber,
        issuedAt,
      };

      // Native Web Crypto P-256 signing
      const keys = await generateECDSAKeyPair();
      const { signatureBase64, signatureHex } = await signAttestationPayload(
        payload,
        keys.privateKeyJwk
      );

      const newAttestation: SignedAttestation = {
        payload,
        signatureBase64,
        signatureHex,
        publicKeyJwk: keys.publicKeyJwk,
        publicKeyHex: keys.publicKeyHex,
        createdAt: issuedAt,
      };

      // 1. Save attestation to persistent storage
      saveAttestation(newAttestation);

      // 2. Generate Share Code (automatically saves and queues for HR verification)
      const shareCode = await createShareCode(newAttestation, 'maternity-mba-1961', 24);

      // 3. Save local medical document if attached (stored on clinic device only)
      if (attachedDocument) {
        const finalDoc: MedicalDocument = {
          ...attachedDocument,
          attestationId,
        };
        saveClinicDocument(finalDoc);
      }

      onCreated(newAttestation, shareCode, attachedDocument);
    } catch (err: any) {
      console.error('Failed to issue leave proof:', err);
      setFormError(err?.message || 'Cryptographic signing failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <h2 className="text-lg font-bold text-slate-900 font-condensed uppercase tracking-wider">
              Create Leave Proof
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Issue a new leave
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Signs a minimal cryptographic attestation. Zero clinical diagnosis will be disclosed to employer.
        </p>
      </div>

      {formError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Identification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employee Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="email"
                required
                value={employeeEmail}
                onChange={(e) => setEmployeeEmail(e.target.value)}
                placeholder="sarah@company.com"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Employee Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Leave Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Leave Type: *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {LEAVE_OPTIONS.map((opt) => {
              const isSelected = selectedLeaveId === opt.id;
              return (
                <label
                  key={opt.id}
                  onClick={() => setSelectedLeaveId(opt.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition text-left ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-600 text-blue-950 shadow-sm ring-1 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="leaveType"
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => setSelectedLeaveId(opt.id)}
                    className="mt-1 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 border-slate-300"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900">
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      {opt.desc}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Leave Period Date Pickers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              Leave Period: *
            </label>
            {durationDays > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                {durationDays} calendar days
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-[10px] font-mono text-slate-500 mb-1 font-medium">
                From:
              </span>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono shadow-sm"
                />
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-mono text-slate-500 mb-1 font-medium">
                To:
              </span>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Employee Fitness Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Employee Fitness Status: *
          </label>
          <div className="space-y-2">
            {FITNESS_OPTIONS.map((fit) => {
              const isSelected = fitnessStatus === fit.value;
              return (
                <label
                  key={fit.value}
                  onClick={() => setFitnessStatus(fit.value)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition text-left ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-600 text-emerald-950 shadow-sm ring-1 ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="fitnessStatus"
                    value={fit.value}
                    checked={isSelected}
                    onChange={() => setFitnessStatus(fit.value)}
                    className="text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 border-slate-300"
                  />
                  <span className="text-sm">{fit.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900">
                      {fit.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {fit.desc}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Attach Medical Proof (Local-Only Document Upload) */}
        <DocumentUpload
          attestationId="pending"
          currentDoc={attachedDocument}
          onUpload={(doc) => setAttachedDocument(doc)}
          onClear={() => setAttachedDocument(null)}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 font-mono"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Signing ECDSA P-256 Proof...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>✓ SIGN & ISSUE LEAVE PROOF</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
