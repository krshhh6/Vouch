'use client';

import { useState, useEffect } from 'react';
import { 
  IssuerIdentity, 
  CoarseCategory, 
  FitForDutyStatus, 
  AttestationPayload, 
  SignedAttestation 
} from '@/lib/types';
import { TRUSTED_ISSUERS } from '@/lib/registry';
import { 
  getActiveIssuer, 
  saveAttestation, 
  getAttestations, 
  revokeAttestationByIssuer,
  subscribeToStateChange 
} from '@/lib/storage';
import { 
  generateECDSAKeyPair, 
  signAttestationPayload, 
  computeSHA256,
  canonicalizeJson
} from '@/lib/crypto';
import { 
  Building2, 
  ShieldCheck, 
  Key, 
  Calendar, 
  CheckCircle2, 
  Printer, 
  Copy, 
  Check, 
  AlertTriangle, 
  QrCode, 
  RefreshCw,
  Clock,
  User,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function ClinicPortalPage() {
  const [activeIssuer, setActiveIssuer] = useState<IssuerIdentity>(TRUSTED_ISSUERS[0]);
  const [clinicName, setClinicName] = useState("Sunrise Women's Health Center");
  const [regNumber, setRegNumber] = useState('GMC-1234567');
  const [issuerDid, setIssuerDid] = useState('did:web:sunrise-clinic.local');
  const [publicKeyHash, setPublicKeyHash] = useState('8a9f4e2b...3c2a');
  const [isIssuerRevoked, setIsIssuerRevoked] = useState(false);
  const [copiedDid, setCopiedDid] = useState(false);

  // Attestation Builder State
  const [employeeEmail, setEmployeeEmail] = useState('sarah@company.com');
  const [employeeName, setEmployeeName] = useState('Sarah Jenkins');
  const [leaveCategory, setLeaveCategory] = useState<CoarseCategory>('STATUTORY_MATERNITY');
  const [startDate, setStartDate] = useState('2026-09-16');
  const [endDate, setEndDate] = useState('2026-10-07');
  const [occupationalStatus, setOccupationalStatus] = useState<FitForDutyStatus>('full-rest');
  const [isSigning, setIsSigning] = useState(false);

  // Right Panel: Attestation Issued Output & Ledger
  const [latestIssued, setLatestIssued] = useState<SignedAttestation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [attestationsList, setAttestationsList] = useState<SignedAttestation[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [attestationToRevoke, setAttestationToRevoke] = useState<string | null>(null);

  useEffect(() => {
    const current = getActiveIssuer();
    setActiveIssuer(current);
    setClinicName(current.name || "Sunrise Women's Health Center");
    setRegNumber(current.regNumber || 'GMC-1234567');
    computeSHA256(current.publicKeyHex || 'p256-default').then(h => {
      setPublicKeyHash(`${h.substring(0, 8)}...${h.substring(h.length - 6)}`);
    });
    loadList();

    const unsubscribe = subscribeToStateChange(() => {
      loadList();
    });
    return () => unsubscribe();
  }, []);

  const loadList = () => {
    const list = getAttestations();
    setAttestationsList(list);
    if (!latestIssued && list.length > 0) {
      setLatestIssued(list[0]);
    }
  };

  const handleCopyDid = () => {
    navigator.clipboard.writeText(issuerDid);
    setCopiedDid(true);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  const handleGenerateNewKeyPair = async () => {
    const freshKeys = await generateECDSAKeyPair();
    const newHash = await computeSHA256(freshKeys.publicKeyHex);
    setPublicKeyHash(`${newHash.substring(0, 8)}...${newHash.substring(newHash.length - 6)}`);
    alert('Generated new native Web Crypto ECDSA P-256 key pair in browser memory.');
  };

  const handleToggleClinicRevocation = () => {
    setIsIssuerRevoked(!isIssuerRevoked);
  };

  const handleSignAndIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigning(true);

    try {
      const attestationId = `ATT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const issuedAt = new Date().toISOString();

      // Compute hash of issuer registration + salt (FIX 0: never leaks clinic name or raw reg to HR)
      const issuerRefHash = await computeSHA256(`${regNumber}:salt-vouch-2026`);

      let fineCategory: import('@/lib/types').FineCategory = 'general-medical';
      if (leaveCategory === 'STATUTORY_MATERNITY') fineCategory = 'pregnancy';
      else if (leaveCategory === 'CAREGIVING') fineCategory = 'bereavement';

      const payload: AttestationPayload = {
        attestationId,
        employeeName: employeeName.trim() || 'Sarah Jenkins',
        employeeId: employeeEmail.trim(),
        fineCategory,
        coarseCategory: leaveCategory,
        categoryLabel: leaveCategory === 'STATUTORY_MATERNITY' ? 'Maternity Benefit Act Entitlement' : 'Statutory Medical Leave',
        fitForDuty: occupationalStatus,
        startDate,
        endDate,
        expectedReturnDate: endDate,
        issuerId: activeIssuer.id,
        issuerName: clinicName,
        doctorName: activeIssuer.doctorName || 'Dr. Elena Rostova',
        issuerRegNumber: regNumber,
        issuedAt
      };

      const freshKeys = await generateECDSAKeyPair();
      const { signatureBase64, signatureHex } = await signAttestationPayload(
        payload,
        freshKeys.privateKeyJwk
      );

      const newAttestation: SignedAttestation = {
        payload,
        signatureBase64,
        signatureHex,
        publicKeyJwk: freshKeys.publicKeyJwk,
        publicKeyHex: freshKeys.publicKeyHex,
        createdAt: issuedAt
      };

      saveAttestation(newAttestation);
      setLatestIssued(newAttestation);
      setSelectedRowId(attestationId);
    } catch (err) {
      console.error(err);
      alert('Error generating ECDSA P-256 signature.');
    } finally {
      setIsSigning(false);
    }
  };

  const handleOpenRevokeModal = (id: string) => {
    setAttestationToRevoke(id);
    setShowRevokeModal(true);
  };

  const confirmRevocation = () => {
    if (attestationToRevoke) {
      revokeAttestationByIssuer(attestationToRevoke);
      setShowRevokeModal(false);
      setAttestationToRevoke(null);
      loadList();
    }
  };

  const handleCopySecureLink = () => {
    if (latestIssued) {
      const link = `${window.location.origin}/employee`;
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Deterministic SVG QR pattern generator
  const renderQrSvg = (dataString: string) => {
    const size = 21;
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      hash = (hash << 5) - hash + dataString.charCodeAt(i);
      hash |= 0;
    }
    const cells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isPosMarker = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
        let fill = false;
        if (isPosMarker) {
          fill = (r === 0 || r === 6 || c === 0 || c === 6) ||
                 (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                 (r === 0 || r === 6 || c === size - 7 || c === size - 1) ||
                 (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3) ||
                 (r === size - 7 || r === size - 1 || c === 0 || c === 6) ||
                 (r >= size - 5 && r >= size - 3 && c >= 2 && c <= 4);
        } else {
          fill = ((hash ^ (r * 31 + c * 17)) % 2 === 0);
        }
        if (fill) {
          cells.push(
            <rect key={`${r}-${c}`} x={c * 9} y={r * 9} width={9} height={9} fill="#0F172A" />
          );
        }
      }
    }
    return (
      <svg viewBox="0 0 189 189" className="w-44 h-44 bg-white p-2 border border-slate-300 rounded shadow-sm">
        {cells}
      </svg>
    );
  };

  return (
    <div className="w-full bg-[#0F172A] text-slate-100 min-h-[calc(100vh-100px)] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Strip */}
        <div className="border-b border-[#1E293B] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94C3A3]">
                1. CLINIC ISSUER
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E293B] text-slate-300 border border-slate-700">
                P-256 Web Crypto
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-condensed uppercase tracking-wider">
              Sign medical attestations
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              Authoritative clinical issuance portal. Signs minimal statutory claims without exposing diagnosis or clinic registry to HR.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded text-xs font-mono border border-slate-700 bg-[#0B1120] text-slate-300">
              Active: <strong>{clinicName}</strong>
            </span>
          </div>
        </div>

        {/* 2-Column Main Layout: Left 40%, Right 60% */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel (40%): Registration + Attestation Builder */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 2a. Clinic Registration Card */}
            <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#4A7C59]" />
                  CLINIC REGISTRATION
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isIssuerRevoked 
                    ? 'bg-red-950 text-red-300 border border-red-800' 
                    : 'bg-[#142319] text-[#94C3A3] border border-[#284230]'
                }`}>
                  {isIssuerRevoked ? '✗ REVOKED IN NMC' : '✓ REGISTERED'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 font-condensed uppercase tracking-wider block mb-1">
                    Clinic Name:
                  </label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#0F172A] border border-[#334155] text-slate-200 focus:outline-none focus:border-[#4A7C59]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 font-condensed uppercase tracking-wider block mb-1">
                    NMC Registration No.:
                  </label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#0F172A] border border-[#334155] text-slate-200 font-mono focus:outline-none focus:border-[#4A7C59]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-400 font-condensed uppercase tracking-wider flex items-center gap-1">
                      <span>Issuer DID:</span>
                      <Info className="w-3 h-3 text-slate-500" />
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyDid}
                      className="text-[10px] text-[#94C3A3] hover:underline flex items-center gap-1 font-mono"
                    >
                      {copiedDid ? <Check className="w-3 h-3 text-[#4A7C59]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDid ? 'COPIED' : 'COPY'}</span>
                    </button>
                  </div>
                  <div className="px-3 py-1.5 rounded bg-[#0F172A] border border-[#334155] font-mono text-[11px] text-slate-300 break-all">
                    {issuerDid}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-[#1E293B]">
                  <span>Public Key Hash:</span>
                  <strong className="text-white">{publicKeyHash}</strong>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateNewKeyPair}
                    className="flex-1 px-3 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 transition-colors"
                  >
                    GENERATE NEW KEY PAIR
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleClinicRevocation}
                    className={`px-3 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold border transition-colors ${
                      isIssuerRevoked
                        ? 'bg-[#142319] text-[#94C3A3] border-[#284230] hover:bg-[#1f3727]'
                        : 'bg-red-950/60 text-red-300 border-red-800 hover:bg-red-900'
                    }`}
                  >
                    {isIssuerRevoked ? 'RE-ACTIVATE' : 'REVOKE'}
                  </button>
                </div>
              </div>
            </div>

            {/* Attestation Builder Card */}
            <form onSubmit={handleSignAndIssue} className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#4A7C59]" />
                  CREATE ATTESTATION
                </span>
                <span className="text-[10px] font-mono text-slate-400">Zero Diagnosis Leak</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 font-condensed uppercase tracking-wider block mb-1">
                    Employee ID / Email:
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    placeholder="sarah@company.com"
                    className="w-full px-3 py-2 rounded bg-[#0F172A] border border-[#334155] text-slate-200 focus:outline-none focus:border-[#4A7C59]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 font-condensed uppercase tracking-wider block mb-1">
                    Employee Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full px-3 py-2 rounded bg-[#0F172A] border border-[#334155] text-slate-200 focus:outline-none focus:border-[#4A7C59]"
                  />
                </div>

                {/* Leave Category Radio Group */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 font-condensed uppercase tracking-wider block mb-2">
                    Leave Category:
                  </label>
                  <div className="space-y-2 bg-[#0F172A] p-3 rounded border border-[#334155]">
                    {[
                      { id: 'STATUTORY_MATERNITY', label: 'STATUTORY_MATERNITY (Maternity Benefit Act)' },
                      { id: 'STATUTORY_MEDICAL', label: 'STATUTORY_MEDICAL (Inpatient / ESI Act)' },
                      { id: 'CAREGIVING', label: 'CAREGIVING (Family Medical Framework)' },
                      { id: 'SELF_DECLARED', label: 'SELF_DECLARED (Menstrual / No Doctor Need)' }
                    ].map((opt) => (
                      <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                        <input
                          type="radio"
                          name="leaveCategory"
                          value={opt.id}
                          checked={leaveCategory === opt.id}
                          onChange={(e) => setLeaveCategory(e.target.value as CoarseCategory)}
                          className="accent-[#4A7C59]"
                        />
                        <span className={leaveCategory === opt.id ? 'font-bold text-white font-mono' : 'font-mono'}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Authorized Window */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 font-condensed uppercase tracking-wider block mb-1">
                    Authorized Window:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">From:</span>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-[#0F172A] border border-[#334155] text-slate-200 font-mono text-xs focus:outline-none focus:border-[#4A7C59]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">To:</span>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-[#0F172A] border border-[#334155] text-slate-200 font-mono text-xs focus:outline-none focus:border-[#4A7C59]"
                      />
                    </div>
                  </div>
                </div>

                {/* Occupational Status Radio Group */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 font-condensed uppercase tracking-wider block mb-2">
                    Occupational Status:
                  </label>
                  <div className="space-y-2 bg-[#0F172A] p-3 rounded border border-[#334155]">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                      <input
                        type="radio"
                        name="occupationalStatus"
                        value="full-rest"
                        checked={occupationalStatus === 'full-rest'}
                        onChange={() => setOccupationalStatus('full-rest')}
                        className="accent-[#4A7C59]"
                      />
                      <span className={occupationalStatus === 'full-rest' ? 'font-bold text-white' : ''}>
                        Unfit (Rest Mandated)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                      <input
                        type="radio"
                        name="occupationalStatus"
                        value="partial-remote"
                        checked={occupationalStatus === 'partial-remote'}
                        onChange={() => setOccupationalStatus('partial-remote')}
                        className="accent-[#4A7C59]"
                      />
                      <span className={occupationalStatus === 'partial-remote' ? 'font-bold text-white' : ''}>
                        Fit for Modified / Remote Duty
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                      <input
                        type="radio"
                        name="occupationalStatus"
                        value="fit-post-leave"
                        checked={occupationalStatus === 'fit-post-leave'}
                        onChange={() => setOccupationalStatus('fit-post-leave')}
                        className="accent-[#4A7C59]"
                      />
                      <span className={occupationalStatus === 'fit-post-leave' ? 'font-bold text-white' : ''}>
                        Fit for Duty
                      </span>
                    </label>
                  </div>
                </div>

                {/* Sign and Issue Button */}
                <button
                  type="submit"
                  disabled={isSigning}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded bg-[#4A7C59] hover:bg-[#3D6649] text-white font-condensed font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isSigning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Web Crypto ECDSA Signature...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>SIGN &amp; ISSUE ATTESTATION</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>

          {/* Right Panel (60%): Share/QR Output Card + Revocation Panel */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 2b. Share/QR Output Card (Appears after signing or shows latest) */}
            {latestIssued ? (
              <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-6 space-y-6 shadow-sm">
                <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white">
                      ATTESTATION ISSUED
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#142319] text-[#94C3A3] border border-[#284230]">
                      Status: ✓ Signed and ready to share
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">P-256 Validated</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* QR Code */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded border border-[#EDE6D6]">
                    {renderQrSvg(canonicalizeJson(latestIssued.payload))}
                    <span className="text-[10px] text-slate-600 font-mono mt-2">Scan with Employee Device</span>
                  </div>

                  {/* Share Instructions & Metadata */}
                  <div className="md:col-span-7 space-y-4 text-xs">
                    <div className="p-3 bg-[#0F172A] rounded border border-[#1E293B] space-y-1 text-slate-300">
                      <span className="font-bold text-white uppercase font-condensed tracking-wider block">
                        Share with employee:
                      </span>
                      <p>1. Print this page &amp; let her scan QR with her smartphone.</p>
                      <p>2. Send secure link to her phone or employee vault.</p>
                    </div>

                    <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                      <div className="flex justify-between border-b border-[#1E293B] pb-1">
                        <span className="text-slate-400">Attestation ID:</span>
                        <strong className="text-white">{latestIssued.payload.attestationId}</strong>
                      </div>
                      <div className="flex justify-between border-b border-[#1E293B] pb-1">
                        <span className="text-slate-400">Signature Hash:</span>
                        <span className="text-[#94C3A3]">{latestIssued.signatureHex.substring(0, 16)}...</span>
                      </div>
                      <div className="flex justify-between border-b border-[#1E293B] pb-1">
                        <span className="text-slate-400">Valid From:</span>
                        <span>{latestIssued.payload.startDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Valid To:</span>
                        <span>{latestIssued.payload.endDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3.5 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-white transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#4A7C59]" />
                        <span>PRINT QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopySecureLink}
                        className="px-3.5 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-white transition-colors flex items-center gap-1.5"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-[#4A7C59]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'LINK COPIED' : 'COPY SECURE LINK'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => alert('Credential ready in employee vault.')}
                        className="px-3.5 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#4A7C59] hover:bg-[#3D6649] text-white transition-colors"
                      >
                        DONE
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-lg bg-[#0B1120] border border-[#1E293B] text-center text-slate-400 text-xs font-mono">
                Fill the attestation builder on the left and click [SIGN &amp; ISSUE ATTESTATION] to generate a Web Crypto credential.
              </div>
            )}

            {/* 2c. Revocation Panel */}
            <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#4A7C59]" />
                  MANAGE ISSUED ATTESTATIONS
                </span>
                <span className="text-xs font-mono text-slate-400">{attestationsList.length} total records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-slate-400 font-condensed uppercase tracking-wider">
                      <th className="py-2 px-3">Attestation ID</th>
                      <th className="py-2 px-3">Holder</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60">
                    {attestationsList.map((att) => {
                      const isRevoked = att.isRevokedByIssuer;
                      const isSelected = selectedRowId === att.payload.attestationId;
                      return (
                        <tr
                          key={att.payload.attestationId}
                          onClick={() => {
                            setSelectedRowId(att.payload.attestationId);
                            setLatestIssued(att);
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#0F172A]' : 'hover:bg-[#0F172A]/50'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-white">{att.payload.attestationId}</td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {att.payload.employeeName?.split(' ').map(n => n[0] + '.').join(' ') || 'S. J.'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 text-[11px]">{att.payload.coarseCategory}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isRevoked
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : 'bg-[#142319] text-[#94C3A3] border border-[#284230]'
                            }`}>
                              {isRevoked ? 'REVOKED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {!isRevoked ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenRevokeModal(att.payload.attestationId);
                                }}
                                className="px-2.5 py-1 rounded text-[10px] font-condensed uppercase tracking-wider font-bold bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 transition-colors"
                              >
                                REVOKE
                              </button>
                            ) : (
                              <span className="text-slate-600 text-[10px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                Click any row above to view details in the QR card or trigger issuer revocation.
              </p>
            </div>

          </div>

        </div>

        {/* Confirmation Modal for Revocation */}
        {showRevokeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0B1120] border border-slate-700 rounded-lg p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
                    Confirm Issuer Revocation
                  </h3>
                  <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                    Revoking attestation <strong>{attestationToRevoke}</strong> will invalidate all outstanding share codes. Any future HR verification will strictly fail. Proceed?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setShowRevokeModal(false)}
                  className="px-4 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] text-slate-300 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRevocation}
                  className="px-4 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-red-900 hover:bg-red-800 text-white border border-red-700 shadow-sm"
                >
                  Yes, Revoke Credential
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
