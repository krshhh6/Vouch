'use client';

import { useState, useEffect } from 'react';
import { 
  IssuerIdentity, 
  FineCategory, 
  CoarseCategory, 
  FitForDutyStatus, 
  AttestationPayload, 
  SignedAttestation 
} from '@/lib/types';
import { TRUSTED_ISSUERS } from '@/lib/registry';
import { 
  getActiveIssuer, 
  setActiveIssuer, 
  saveAttestation, 
  getAttestations, 
  revokeAttestationByIssuer,
  subscribeToStateChange 
} from '@/lib/storage';
import { 
  generateECDSAKeyPair, 
  signAttestationPayload, 
  canonicalizeJson, 
  computeSHA256 
} from '@/lib/crypto';
import { mapFineToCoarseCategory } from '@/lib/policy';
import PaperAttestationQR from '@/components/PaperAttestationQR';
import { 
  Stethoscope, 
  ShieldCheck, 
  Key, 
  Calendar, 
  User, 
  CheckCircle2, 
  FileCheck, 
  Clock, 
  Award, 
  RefreshCw, 
  QrCode
} from 'lucide-react';
import Link from 'next/link';

export default function IssuerPage() {
  const [selectedIssuer, setSelectedIssuer] = useState<IssuerIdentity>(TRUSTED_ISSUERS[0]);
  const [customKeyPair] = useState<{
    privateKeyJwk: JsonWebKey;
    publicKeyJwk: JsonWebKey;
    publicKeyHex: string;
  } | null>(null);

  // Form inputs
  const [employeeName, setEmployeeName] = useState('Sarah Jenkins');
  const [employeeId, setEmployeeId] = useState('EMP-9021');
  const [fineCategory, setFineCategory] = useState<FineCategory>('pregnancy');
  const [fitForDuty, setFitForDuty] = useState<FitForDutyStatus>('full-rest');
  const [fitForDutyNotes, setFitForDutyNotes] = useState('Total pelvic & physical bed rest ordered.');
  const [startDate, setStartDate] = useState('2026-09-16');
  const [endDate, setEndDate] = useState('2026-10-07');
  const [expectedReturnDate, setExpectedReturnDate] = useState('2026-10-08');

  // Derived coarse category
  const coarseCategory: CoarseCategory = mapFineToCoarseCategory(fineCategory);

  // Signing state
  const [isSigning, setIsSigning] = useState(false);
  const [issuedSuccess, setIssuedSuccess] = useState<SignedAttestation | null>(null);
  const [attestationsList, setAttestationsList] = useState<SignedAttestation[]>([]);
  const [payloadHash, setPayloadHash] = useState<string>('');
  const [paperQrAttestation, setPaperQrAttestation] = useState<SignedAttestation | null>(null);

  useEffect(() => {
    const current = getActiveIssuer();
    setSelectedIssuer(current);
    loadAttestations();

    const unsubscribe = subscribeToStateChange(() => {
      loadAttestations();
    });
    return () => unsubscribe();
  }, []);

  const loadAttestations = () => {
    setAttestationsList(getAttestations());
  };

  const handleIssuerChange = (issuerId: string) => {
    setActiveIssuer(issuerId);
    const found = TRUSTED_ISSUERS.find(i => i.id === issuerId);
    if (found) {
      setSelectedIssuer(found);
    }
  };

  const handleRevokeByIssuer = (attestationId: string) => {
    if (confirm(`Revoke attestation ${attestationId}? All active share codes for this credential will fail verification immediately.`)) {
      revokeAttestationByIssuer(attestationId);
    }
  };

  // Compute live hash of payload
  useEffect(() => {
    const tempPayload: AttestationPayload = {
      attestationId: 'PREVIEW-HASH',
      employeeName,
      employeeId,
      fineCategory,
      coarseCategory,
      fitForDuty,
      fitForDutyNotes,
      startDate,
      endDate,
      expectedReturnDate,
      issuerId: selectedIssuer.id,
      issuerName: selectedIssuer.name,
      doctorName: selectedIssuer.doctorName,
      issuerRegNumber: selectedIssuer.regNumber,
      issuedAt: new Date().toISOString()
    };
    computeSHA256(canonicalizeJson(tempPayload)).then(setPayloadHash);
  }, [employeeName, employeeId, fineCategory, coarseCategory, fitForDuty, fitForDutyNotes, startDate, endDate, expectedReturnDate, selectedIssuer]);

  const handleSignAndIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigning(true);

    try {
      const attestationId = `LG-ATT-${Math.floor(1000 + Math.random() * 9000)}`;
      const issuedAt = new Date().toISOString();

      let categoryLabel = 'Certified Medical Leave';
      if (fineCategory === 'pregnancy') categoryLabel = 'Pregnancy & Gestation Care';
      if (fineCategory === 'mental-health') categoryLabel = 'Psychological & Mental Health Care';
      if (fineCategory === 'surgery') categoryLabel = 'Post-Operative Orthopedic Recovery';

      const payload: AttestationPayload = {
        attestationId,
        employeeName,
        employeeId: employeeId.trim() || undefined,
        fineCategory,
        coarseCategory,
        categoryLabel,
        fitForDuty,
        fitForDutyNotes: fitForDutyNotes.trim() || undefined,
        startDate,
        endDate,
        expectedReturnDate,
        issuerId: selectedIssuer.id,
        issuerName: selectedIssuer.name,
        doctorName: selectedIssuer.doctorName,
        issuerRegNumber: selectedIssuer.regNumber,
        issuedAt
      };

      let privateKeyToUse = customKeyPair?.privateKeyJwk;
      let publicKeyJwkToUse = customKeyPair?.publicKeyJwk || selectedIssuer.publicKeyJwk;
      let publicKeyHexToUse = customKeyPair?.publicKeyHex || selectedIssuer.publicKeyHex;

      if (!privateKeyToUse) {
        const freshKeys = await generateECDSAKeyPair();
        privateKeyToUse = freshKeys.privateKeyJwk;
        publicKeyJwkToUse = freshKeys.publicKeyJwk;
        publicKeyHexToUse = freshKeys.publicKeyHex;
      }

      const { signatureBase64, signatureHex } = await signAttestationPayload(
        payload,
        privateKeyToUse
      );

      const newSignedAttestation: SignedAttestation = {
        payload,
        signatureBase64,
        signatureHex,
        publicKeyJwk: publicKeyJwkToUse,
        publicKeyHex: publicKeyHexToUse,
        createdAt: issuedAt
      };

      saveAttestation(newSignedAttestation);
      setIssuedSuccess(newSignedAttestation);
    } catch (err) {
      console.error('Error signing attestation:', err);
      alert('Failed to sign attestation with Web Crypto.');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider font-condensed">Medical Portal</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-700 font-mono">
                ECDSA P-256 Issuer
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-0.5 font-sans">Clinic Attestation Issuance Studio</h1>
            <p className="text-xs text-zinc-400 font-sans">
              Sign certified leave attestations for patients with Web Crypto and paper-first QR print fallback.
            </p>
          </div>
        </div>

        {/* Doctor & Clinic Selector */}
        <div className="bg-black p-3 rounded-xl border border-zinc-800 space-y-1.5 self-start md:self-auto">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block font-condensed">
            Active Signing Identity (NMC Registry Stub)
          </span>
          <select
            value={selectedIssuer.id}
            onChange={(e) => handleIssuerChange(e.target.value)}
            className="w-full bg-zinc-900 text-xs font-semibold text-zinc-200 border border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-white"
          >
            {TRUSTED_ISSUERS.map((i) => (
              <option key={i.id} value={i.id}>
                {i.doctorName} — {i.name}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-sans">
            <span>Reg: <strong className="text-zinc-200 font-mono">{selectedIssuer.regNumber}</strong></span>
            <span className="text-zinc-300 font-medium">✓ Licensed in NMC</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Attestation Issuer Studio */}
        <div className="lg:col-span-7 bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white font-condensed uppercase tracking-wider">Create New Minimal Leave Attestation</h2>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Zero Diagnosis Exposed</span>
          </div>

          <form onSubmit={handleSignAndIssue} className="space-y-5">
            
            {/* Patient Name & ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 font-condensed uppercase tracking-wider">
                  Patient Full Name <span className="text-white">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2 rounded-xl bg-black border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 font-condensed uppercase tracking-wider">
                  Employee ID / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. EMP-9021"
                  className="w-full px-3.5 py-2 rounded-xl bg-black border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-white"
                />
              </div>
            </div>

            {/* Fine Category & Automatic Coarse Category Mapping Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 font-condensed uppercase tracking-wider">
                  Clinical Fine Category (Doctor & Wallet only)
                </label>
                <select
                  value={fineCategory}
                  onChange={(e) => setFineCategory(e.target.value as FineCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-white"
                >
                  <option value="pregnancy">Pregnancy & Early Gestation</option>
                  <option value="surgery">Surgery & Post-Operative</option>
                  <option value="mental-health">Mental Health & Stress Decompression</option>
                  <option value="general-medical">General Medical Need</option>
                  <option value="bereavement">Family Caregiving & Bereavement</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 font-condensed uppercase tracking-wider">
                  Statutory Public Category (Policy F5 Auto-Derived)
                </label>
                <div className="px-3.5 py-2 rounded-xl bg-black border border-zinc-700 text-zinc-200 font-mono text-xs flex items-center justify-between">
                  <span>{coarseCategory}</span>
                  <span className="text-[10px] text-zinc-500 font-sans">Crosses to HR</span>
                </div>
              </div>
            </div>

            {/* Fit for duty */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 font-condensed uppercase tracking-wider">
                Fit-for-Duty Directive
              </label>
              <select
                value={fitForDuty}
                onChange={(e) => setFitForDuty(e.target.value as FitForDutyStatus)}
                className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-white"
              >
                <option value="full-rest">Unfit for Work (Total Rest Mandated)</option>
                <option value="partial-remote">Fit for Modified / Remote Duty Only</option>
                <option value="fit-post-leave">Confirmed Fit to Resume on Return Date</option>
              </select>
            </div>

            {/* Leave Duration Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black p-4 rounded-xl border border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-condensed">
                  <Calendar className="w-3 h-3 text-white" /> Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs font-mono focus:outline-none focus:border-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-condensed">
                  <Calendar className="w-3 h-3 text-white" /> End Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs font-mono focus:outline-none focus:border-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-condensed">
                  <Clock className="w-3 h-3 text-white" /> Return Date
                </label>
                <input
                  type="date"
                  required
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs font-mono focus:outline-none focus:border-white"
                />
              </div>
            </div>

            {/* Optional Accommodations Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 font-condensed uppercase tracking-wider">
                Workplace Accommodation Directive (Zero diagnosis notes)
              </label>
              <textarea
                value={fitForDutyNotes}
                onChange={(e) => setFitForDutyNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Ergonomic seating required; no heavy lifting."
                className="w-full px-3.5 py-2 rounded-xl bg-black border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-white"
              />
            </div>

            {/* Live Cryptographic Payload Preview */}
            <div className="p-3.5 rounded-xl bg-black border border-zinc-800 font-mono text-[11px] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1.5 text-white font-semibold font-condensed uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5" /> Web Crypto Hash (SHA-256)
                </span>
                <span className="text-[10px] text-zinc-500">Deterministic Canonical Digest</span>
              </div>
              <p className="text-zinc-300 break-all bg-zinc-900 p-2 rounded text-[10px] border border-zinc-800">
                {payloadHash || 'computing sha-256 fingerprint...'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSigning}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm shadow-sm transition-all disabled:opacity-40 font-condensed uppercase tracking-wider"
            >
              {isSigning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing with ECDSA P-256 in Browser...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Sign & Issue Attestation (ECDSA P-256)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Issued Success or Ledger */}
        <div className="lg:col-span-5 space-y-6">
          
          {issuedSuccess && (
            <div className="p-6 rounded-2xl bg-black border border-zinc-700 shadow-2xl text-zinc-200 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-condensed uppercase tracking-wider">Attestation Issued & Signed</h3>
                  <p className="text-xs text-zinc-400 font-mono">ID: {issuedSuccess.payload.attestationId}</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 font-condensed uppercase tracking-wider text-xs">
                <Link
                  href="/employee"
                  className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold transition-colors shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span>View in Employee Vault</span>
                </Link>

                <button
                  onClick={() => setPaperQrAttestation(issuedSuccess)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold border border-zinc-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4 text-white" />
                  <span>Print Paper QR</span>
                </button>
              </div>
            </div>
          )}

          {/* Clinic Issuance Ledger with Revocation action */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 font-condensed uppercase tracking-wider">
                <Award className="w-4 h-4 text-white" />
                Clinic Attestation Ledger & Revocation
              </h3>
              <span className="text-xs text-zinc-400 font-mono">{attestationsList.length} Active</span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {attestationsList.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6 font-sans">No attestations issued yet.</p>
              ) : (
                attestationsList.map((att) => (
                  <div 
                    key={att.payload.attestationId}
                    className="p-3.5 rounded-xl bg-black border border-zinc-800 hover:border-zinc-700 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white font-sans">{att.payload.employeeName}</span>
                      <span className="font-mono text-[10px] text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
                        {att.payload.attestationId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-400 text-[11px] font-sans">
                      <span>{att.payload.startDate} → {att.payload.endDate}</span>
                      <span className="text-white font-medium font-mono">{att.payload.coarseCategory}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[10px] text-zinc-500">
                      <span>Doctor: {att.payload.doctorName}</span>
                      
                      <div className="flex items-center gap-2 font-condensed uppercase tracking-wider">
                        <button
                          onClick={() => setPaperQrAttestation(att)}
                          className="text-zinc-300 hover:text-white underline font-sans"
                        >
                          Print QR
                        </button>

                        {!att.isRevokedByIssuer ? (
                          <button
                            onClick={() => handleRevokeByIssuer(att.payload.attestationId)}
                            className="text-zinc-400 hover:text-white underline font-sans"
                            title="Issuer Revocation"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="text-zinc-500 font-bold">REVOKED</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Paper QR Modal */}
      {paperQrAttestation && (
        <PaperAttestationQR
          attestation={paperQrAttestation}
          onClose={() => setPaperQrAttestation(null)}
        />
      )}

    </div>
  );
}
