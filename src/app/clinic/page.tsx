'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Settings, 
  HelpCircle, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { 
  SignedAttestation, 
  ShareCode, 
  MedicalDocument, 
  ClinicProfile 
} from '@/lib/types';
import { 
  getAttestations, 
  getShareCodes, 
  getClinicProfile, 
  saveClinicProfile, 
  resetAllData, 
  seedDemoData, 
  subscribeToStateChange,
  getClinicDocument,
  createShareCode
} from '@/lib/storage';

import ClinicSetup from '@/components/clinic/ClinicSetup';
import QuickCreateForm from '@/components/clinic/QuickCreateForm';
import RecentlyIssuedList from '@/components/clinic/RecentlyIssuedList';
import ShareCodeModal from '@/components/clinic/ShareCodeModal';
import ClinicHelpModal from '@/components/clinic/ClinicHelpModal';

export default function ClinicPortalPage() {
  const [clinicProfile, setClinicProfile] = useState<ClinicProfile>({
    doctorName: 'Dr. Elena Rostova',
    clinicName: "Summit Women's Health Center",
    regNumber: 'GMC-6849201',
    email: 'dr.elena@summit-health.com',
    isSetup: true,
  });

  const [attestations, setAttestations] = useState<SignedAttestation[]>([]);
  const [shareCodes, setShareCodes] = useState<ShareCode[]>([]);

  // Modals & Active Selections
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Success / Share Code Modal
  const [activeAttestation, setActiveAttestation] = useState<SignedAttestation | null>(null);
  const [activeShareCode, setActiveShareCode] = useState<ShareCode | null>(null);
  const [activeMedicalDoc, setActiveMedicalDoc] = useState<MedicalDocument | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Form Reset Trigger
  const [formKey, setFormKey] = useState(0);

  const loadAllData = () => {
    const profile = getClinicProfile();
    setClinicProfile(profile);
    const attList = getAttestations();
    setAttestations(attList);
    const shares = getShareCodes();
    setShareCodes(shares);
  };

  useEffect(() => {
    seedDemoData();
    loadAllData();

    const unsubscribe = subscribeToStateChange(() => {
      loadAllData();
    });

    return () => unsubscribe();
  }, []);

  const handleCreated = (
    attestation: SignedAttestation,
    shareCode: ShareCode,
    doc: MedicalDocument | null
  ) => {
    setActiveAttestation(attestation);
    setActiveShareCode(shareCode);
    setActiveMedicalDoc(doc);
    setShowShareModal(true);
    loadAllData();
  };

  const handleViewShareCode = async (attestation: SignedAttestation) => {
    const attId = attestation.payload.attestationId;
    let share = shareCodes.find((s) => s.attestationId === attId);
    
    // If not existing, create a share code on the fly
    if (!share) {
      share = await createShareCode(attestation, 'maternity-mba-1961', 24);
    }

    const doc = getClinicDocument(attId);
    setActiveAttestation(attestation);
    setActiveShareCode(share);
    setActiveMedicalDoc(doc);
    setShowShareModal(true);
  };

  const handleCreateAnother = () => {
    setShowShareModal(false);
    setActiveAttestation(null);
    setActiveShareCode(null);
    setActiveMedicalDoc(null);
    setFormKey((prev) => prev + 1);
  };

  const handleConfirmReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    loadAllData();
  };

  return (
    <div className="w-full text-slate-900 min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 font-sans" style={{ backgroundColor: '#e8ecf4' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Strip */}
        <div className="rounded-3xl p-6 transition-all" style={{ backgroundColor: '#e8ecf4', boxShadow: '9px 9px 18px #c4cede, -9px -9px 18px #ffffff' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700">
                  CLINIC ISSUER PORTAL
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-slate-600" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 2px 2px 5px #c5cedd, inset -2px -2px 5px #ffffff' }}>
                  P-256 Web Crypto
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-condensed uppercase tracking-wider">
                VOUCH — CLINIC PORTAL
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2 font-mono">
                <span>
                  Logged in as:{' '}
                  <strong className="text-slate-900">
                    {clinicProfile.doctorName} ({clinicProfile.clinicName})
                  </strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Status: Ready to issue leave proofs
                </span>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowSetupModal(true)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-md text-xs font-mono transition flex items-center gap-1.5 border border-slate-300 shadow-sm"
                title="Configure clinic registration"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>[Setup]</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-md text-xs font-mono transition flex items-center gap-1.5 border border-slate-300 shadow-sm"
                title="Clinic guide & privacy overview"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>[Help]</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-md text-xs font-mono transition flex items-center gap-1.5 border border-slate-300 shadow-sm"
                title="Reset demo data"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>[Reset]</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 1: Clinic Quick Setup banner if not yet setup */}
        {!clinicProfile.isSetup && (
          <ClinicSetup
            isOpen={true}
            isModal={false}
            initialProfile={clinicProfile}
            onSaved={(updated) => {
              setClinicProfile(updated);
            }}
          />
        )}

        {/* Two-Column Responsive Grid: LEFT (60%) / RIGHT (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT (60%): CREATE LEAVE PROOF */}
          <div className="lg:col-span-7">
            <QuickCreateForm
              key={formKey}
              clinicProfile={clinicProfile}
              onCreated={handleCreated}
            />
          </div>

          {/* RIGHT (40%): RECENTLY ISSUED (Past 7 days) */}
          <div className="lg:col-span-5">
            <RecentlyIssuedList
              attestations={attestations}
              shareCodes={shareCodes}
              onViewShareCode={handleViewShareCode}
              onRefresh={loadAllData}
            />
          </div>
        </div>

      </div>

      {/* Success / Share Code Modal */}
      <ShareCodeModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onCreateAnother={handleCreateAnother}
        attestation={activeAttestation}
        shareCode={activeShareCode}
        medicalDoc={activeMedicalDoc}
        onDocumentDeleted={() => {
          loadAllData();
        }}
      />

      {/* Clinic Setup Modal */}
      <ClinicSetup
        isOpen={showSetupModal}
        isModal={true}
        initialProfile={clinicProfile}
        onClose={() => setShowSetupModal(false)}
        onSaved={(updated) => {
          setClinicProfile(updated);
          setShowSetupModal(false);
          loadAllData();
        }}
      />

      {/* Clinic Help Modal */}
      <ClinicHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-2xl space-y-4 font-sans text-slate-900">
            <div className="flex items-center gap-2.5 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 font-condensed uppercase tracking-wider">
                Reset Demo Data?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-mono">
              This will reset all attestations, local clinic medical documents, share codes, and verification receipts to the initial demo baseline.
            </p>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded font-mono uppercase tracking-wider shadow-sm"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
