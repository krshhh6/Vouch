'use client';

import { useState } from 'react';
import { SignedAttestation, BreakGlassRequest } from '@/lib/types';
import { createBreakGlassRequest, signBreakGlassByEmployee } from '@/lib/storage';
import { 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  Clock, 
  Lock, 
  KeyRound, 
  FileText,
  UserCheck
} from 'lucide-react';

interface BreakGlassModalProps {
  attestation: SignedAttestation;
  onClose: () => void;
  onUnsealed?: (request: BreakGlassRequest) => void;
}

export default function BreakGlassModal({ attestation, onClose, onUnsealed }: BreakGlassModalProps) {
  const [grievanceOfficer, setGrievanceOfficer] = useState('Adv. Rajesh Sharma (Labour Grievance Officer)');
  const [disputeReason, setDisputeReason] = useState('Formal Labour Dispute Appeal #LD-2026-88: Disputed medical leave denial arbitration');
  const [activeRequest, setActiveRequest] = useState<BreakGlassRequest | null>(null);
  const [isEmployeeConsentGiven, setIsEmployeeConsentGiven] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInitiateByOfficer = () => {
    const req = createBreakGlassRequest(
      `LG-DISPUTE-${attestation.payload.attestationId}`,
      attestation.payload.attestationId,
      disputeReason,
      grievanceOfficer
    );
    setActiveRequest(req);
  };

  const handleEmployeeConsentSign = async () => {
    if (!activeRequest) return;
    setIsProcessing(true);
    const updated = await signBreakGlassByEmployee(activeRequest.id);
    setIsProcessing(false);
    if (updated) {
      setActiveRequest(updated);
      if (onUnsealed) onUnsealed(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Dual-Consent Break-Glass Protocol</h3>
              <p className="text-xs text-slate-500 font-sans">Formal dispute arbitration with mandatory mutual consent</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[80vh] overflow-y-auto">
          
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed font-sans">
            <strong className="text-slate-900">Strict Protocol Rule:</strong> Neither HR nor System Administrators can unseal records unilaterally. Unsealing requires the cryptographic digital signatures of <em>both</em> the designated Grievance Officer and the Employee. The unsealed view is strictly time-boxed to 2 hours and permanently writes an immutable receipt to the audit chain.
          </div>

          {!activeRequest ? (
            /* Step 1: Officer Initiation */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Designated Grievance / Labour Officer
                </label>
                <input
                  type="text"
                  value={grievanceOfficer}
                  onChange={(e) => setGrievanceOfficer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Formal Dispute Legal Citation / Reason
                </label>
                <textarea
                  rows={2}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs"
                />
              </div>

              <button
                onClick={handleInitiateByOfficer}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Sign as Grievance Officer &amp; Request Employee Co-Sign</span>
              </button>
            </div>
          ) : !activeRequest.isUnsealed ? (
            /* Step 2: Employee Mutual Consent Step */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">1. Grievance Officer Signature:</span>
                  <span className="text-emerald-800 font-bold flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> SIGNED
                  </span>
                </div>
                <p className="text-xs text-slate-500 italic">
                  Officer: {activeRequest.grievanceOfficerName}
                </p>
                <p className="text-xs text-slate-600">
                  Reason: &ldquo;{activeRequest.reason}&rdquo;
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-bold uppercase tracking-wider text-xs">2. Employee Co-Signature Required:</span>
                  <span className="text-amber-800 font-semibold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">PENDING CONSENT</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  As the employee ({attestation.payload.employeeName}), signing this allows the grievance officer to inspect the underlying clinical note for the dispute arbitration window (2 hours).
                </p>

                <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isEmployeeConsentGiven}
                    onChange={(e) => setIsEmployeeConsentGiven(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-900">
                    I grant dual-consent for time-boxed dispute arbitration
                  </span>
                </label>
              </div>

              <button
                onClick={handleEmployeeConsentSign}
                disabled={!isEmployeeConsentGiven || isProcessing}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isProcessing ? 'Executing Dual Unseal...' : 'Co-Sign & Execute Break-Glass Unseal'}</span>
              </button>
            </div>
          ) : (
            /* Step 3: Unsealed View */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-emerald-900 text-sm">Record Dual-Consent Unsealed</span>
                </div>
                <p className="text-xs text-slate-600 font-sans">
                  Unsealed at {new Date(activeRequest.unsealedAt || '').toLocaleTimeString()}. Access expires at {new Date(activeRequest.expiresAt || '').toLocaleTimeString()}.
                </p>
                <p className="text-xs font-mono text-slate-600">
                  Immutable Receipt Appended to Chain: <strong className="text-slate-900">{activeRequest.receiptId}</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] uppercase font-bold text-slate-500 block">
                  Unsealed Clinical Details (Dispute Scope Only)
                </span>
                <p className="text-xs text-slate-900">
                  <strong>Patient:</strong> {attestation.payload.employeeName}
                </p>
                <p className="text-xs text-slate-900">
                  <strong>Accredited Authority:</strong> {attestation.payload.issuerName} ({attestation.payload.doctorName})
                </p>
                <p className="text-xs text-slate-900">
                  <strong>Clinical Category:</strong> {attestation.payload.fineCategory} ({attestation.payload.categoryLabel})
                </p>
                <p className="text-xs text-slate-700 italic pt-1">
                  &ldquo;{attestation.payload.fitForDutyNotes}&rdquo;
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
