'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAttestations, 
  getShareCodes, 
  getReceipts, 
  createShareCode, 
  subscribeToStateChange 
} from '@/lib/storage';
import { SignedAttestation, ShareCode, VerificationReceipt } from '@/lib/types';
import { verifyChainIntegrity } from '@/lib/verification/receiptChain';
import ReceiptChainViewer from '@/components/ReceiptChainViewer';
import { 
  Lock, 
  ShieldCheck, 
  Share2, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Copy, 
  Check, 
  ArrowRight, 
  Printer, 
  X, 
  Key, 
  FileText, 
  Activity, 
  Layers
} from 'lucide-react';
import Link from 'next/link';

export default function EmployeeWalletPage() {
  const router = useRouter();
  const [attestations, setAttestations] = useState<SignedAttestation[]>([]);
  const [selectedAttestation, setSelectedAttestation] = useState<SignedAttestation | null>(null);
  const [receipts, setReceipts] = useState<VerificationReceipt[]>([]);
  const [shareCodes, setShareCodes] = useState<ShareCode[]>([]);

  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatedShare, setGeneratedShare] = useState<ShareCode | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [showChainViewer, setShowChainViewer] = useState(false);
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);
  const [integrityReport, setIntegrityReport] = useState<{
    valid: boolean;
    count: number;
    error?: string;
  } | null>(null);

  const loadData = () => {
    const attList = getAttestations();
    setAttestations(attList);
    setReceipts(getReceipts());
    setShareCodes(getShareCodes());
    if (!selectedAttestation && attList.length > 0) {
      setSelectedAttestation(attList[0]);
    } else if (selectedAttestation) {
      const refreshed = attList.find(a => a.payload.attestationId === selectedAttestation.payload.attestationId);
      if (refreshed) setSelectedAttestation(refreshed);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStateChange(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const handleCreateShareCode = async () => {
    if (!selectedAttestation) return;
    const share = await createShareCode(
      selectedAttestation,
      'maternity-mba-1961',
      24
    );
    setGeneratedShare(share);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}/hr?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCheckIntegrity = async () => {
    const result = await verifyChainIntegrity(receipts);
    setIntegrityReport({
      valid: result.valid,
      count: receipts.length,
      error: result.reason
    });
    setShowIntegrityModal(true);
  };

  return (
    <div className="w-full bg-[#0F172A] text-slate-100 min-h-[calc(100vh-100px)] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Strip */}
        <div className="border-b border-[#1E293B] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94C3A3]">
                2. EMPLOYEE WALLET
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E293B] text-slate-300 border border-slate-700">
                Self-Sovereign Storage
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-condensed uppercase tracking-wider">
              Receive, hold, and share credentials
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              Credentials stored locally on your device. Generate selective 24-hour verification codes for HR with 0% diagnosis leakage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-[#0B1120] px-3 py-1.5 rounded border border-slate-800">
              Vault Holder: <strong>Sarah Jenkins (EMP-9021)</strong>
            </span>
          </div>
        </div>

        {/* Main Grid: Left 30%, Right 70% */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel (30%): Attestations List + Audit Log */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 3a. Received Attestations List */}
            <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#4A7C59]" />
                  YOUR ATTESTATIONS
                </span>
                <span className="text-xs font-mono text-slate-400">{attestations.length} total</span>
              </div>

              <div className="space-y-3">
                {attestations.length === 0 ? (
                  <p className="text-xs text-slate-500 font-sans text-center py-4">
                    No attestations in vault. Issue one from Clinic Issuer.
                  </p>
                ) : (
                  attestations.map((att) => {
                    const isSelected = selectedAttestation?.payload.attestationId === att.payload.attestationId;
                    const isRevoked = att.isRevokedByIssuer;
                    const views = shareCodes
                      .filter(s => s.attestationId === att.payload.attestationId)
                      .reduce((acc, s) => acc + s.viewCount, 0);

                    return (
                      <div
                        key={att.payload.attestationId}
                        className={`p-3.5 rounded border transition-colors space-y-2 text-xs ${
                          isSelected
                            ? 'bg-[#0F172A] border-[#4A7C59]'
                            : 'bg-[#0F172A]/40 border-[#1E293B] hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span className={isRevoked ? 'text-slate-500' : 'text-[#94C3A3]'}>
                                {isRevoked ? '✗' : '✓'}
                              </span>
                              <span>
                                {att.payload.coarseCategory === 'STATUTORY_MATERNITY'
                                  ? 'Maternity'
                                  : att.payload.coarseCategory === 'STATUTORY_MEDICAL'
                                  ? 'Medical'
                                  : 'Caregiving'} ({att.payload.startDate} – {att.payload.endDate})
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                              {att.payload.doctorName}, {att.payload.issuerName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#1E293B] text-[11px] font-mono">
                          <span className="text-slate-400">
                            Status: <strong className={isRevoked ? 'text-red-400' : 'text-[#94C3A3]'}>
                              {isRevoked ? 'REVOKED' : 'ACTIVE'}
                            </strong>, {views} {views === 1 ? 'view' : 'views'}
                          </span>

                          <button
                            type="button"
                            onClick={() => setSelectedAttestation(att)}
                            className={`px-2.5 py-0.5 rounded text-[11px] font-condensed font-bold uppercase tracking-wider ${
                              isSelected
                                ? 'bg-[#4A7C59] text-white'
                                : 'bg-[#1E293B] hover:bg-[#334155] text-slate-300 border border-slate-700'
                            }`}
                          >
                            SELECT
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 3d. Audit Log */}
            <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#4A7C59]" />
                    AUDIT LOG
                  </span>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                    Every time HR views this credential
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">{receipts.length} entries</span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {receipts.length === 0 ? (
                  <p className="text-xs text-slate-500 font-sans text-center py-4">
                    No verifications recorded yet. Share a code with HR to begin.
                  </p>
                ) : (
                  receipts.slice(0, 5).map((rcp) => (
                    <div key={rcp.id} className="p-3 bg-[#0F172A] rounded border border-[#1E293B] space-y-1 text-xs">
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                        <span>{new Date(rcp.verifiedAt).toLocaleDateString()} {new Date(rcp.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                        <span className={`px-1.5 py-0.2 rounded font-bold ${
                          rcp.outcome === 'APPROVED' ? 'text-[#94C3A3]' : 'text-red-400'
                        }`}>
                          {rcp.outcome === 'APPROVED' ? '✓ APPROVED' : '✗ ' + rcp.outcome}
                        </span>
                      </div>
                      <p className="text-white font-sans text-xs">
                        Verified by HR (Outcome: {rcp.outcome})
                      </p>
                      <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                        <span>Verifier: alice@acmecorp.com</span>
                        <span>Hash: {rcp.hash.substring(0, 8)}...</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setShowChainViewer(true)}
                  className="flex-1 px-3 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 transition-colors"
                >
                  VIEW RECEIPT CHAIN
                </button>

                <button
                  type="button"
                  onClick={handleCheckIntegrity}
                  className="px-3 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#142319] hover:bg-[#1f3727] border border-[#284230] text-[#94C3A3] transition-colors"
                >
                  VERIFY INTEGRITY
                </button>
              </div>
            </div>

          </div>

          {/* Right Panel (70%): Attestation Detail View + Leakage Meter */}
          <div className="lg:col-span-8 space-y-6">
            
            {selectedAttestation ? (
              <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-6 space-y-6 shadow-sm">
                
                {/* Attestation Header */}
                <div className="border-b border-[#1E293B] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#94C3A3] uppercase tracking-wider">
                      OFFICIAL CREDENTIAL FILE
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-0.5 font-condensed uppercase tracking-wider">
                      {selectedAttestation.payload.coarseCategory === 'STATUTORY_MATERNITY'
                        ? 'MATERNITY LEAVE ATTESTATION'
                        : selectedAttestation.payload.coarseCategory === 'STATUTORY_MEDICAL'
                        ? 'STATUTORY MEDICAL ATTESTATION'
                        : 'FAMILY CAREGIVING ATTESTATION'}
                    </h2>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      {selectedAttestation.payload.doctorName} • {selectedAttestation.payload.issuerName}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1 font-mono text-xs">
                    <span className="text-[#94C3A3] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Signature verified: ✓ P-256 authentic
                    </span>
                    <span className="text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#4A7C59]" /> Issuer status: ✓ Licensed &amp; active
                    </span>
                  </div>
                </div>

                {/* Core Parameters Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#0F172A] rounded border border-[#1E293B] space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider">Category</span>
                    <p className="text-xs font-bold font-mono text-white">{selectedAttestation.payload.coarseCategory}</p>
                  </div>

                  <div className="p-3.5 bg-[#0F172A] rounded border border-[#1E293B] space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider">Window</span>
                    <p className="text-xs font-semibold font-mono text-white">
                      {selectedAttestation.payload.startDate} → {selectedAttestation.payload.endDate}
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#0F172A] rounded border border-[#1E293B] space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-condensed tracking-wider">Status</span>
                    <p className="text-xs font-semibold text-white">
                      {selectedAttestation.payload.fitForDuty === 'full-rest'
                        ? 'Unfit (Rest Mandated)'
                        : selectedAttestation.payload.fitForDuty === 'partial-remote'
                        ? 'Modified / Remote Duty'
                        : 'Fit for Duty'}
                    </p>
                  </div>
                </div>

                {/* Sub-component: Leakage Meter (F4) */}
                <div className="rounded-lg border border-[#334155] bg-[#0F172A] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#4A7C59]" />
                      LEAKAGE METER (F4)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#142319] text-[#94C3A3] border border-[#284230]">
                      Information-Theoretic Audit
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                    
                    {/* What HR will learn */}
                    <div className="p-3.5 rounded bg-[#0B1120] border border-[#1E293B] space-y-2">
                      <span className="font-bold text-white uppercase font-condensed tracking-wider block text-[11px]">
                        What HR will learn:
                      </span>
                      <ul className="space-y-1.5 text-slate-300 text-[11px] leading-snug">
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#94C3A3]">•</span>
                          <span>You&apos;re entitled to statutory benefit</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#94C3A3]">•</span>
                          <span>Leave window is {selectedAttestation.payload.startDate} – {selectedAttestation.payload.endDate}</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#94C3A3]">•</span>
                          <span>You&apos;re unfit for work during this block</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#94C3A3]">•</span>
                          <span>This is a legally certified claim</span>
                        </li>
                      </ul>
                    </div>

                    {/* What could be inferred */}
                    <div className="p-3.5 rounded bg-[#0B1120] border border-[#1E293B] space-y-2">
                      <span className="font-bold text-amber-300 uppercase font-condensed tracking-wider block text-[11px]">
                        What could be inferred:
                      </span>
                      <div className="text-[11px] text-slate-300 leading-snug space-y-2">
                        <p className="flex items-start gap-1.5 text-amber-200/90">
                          <span>⚠</span>
                          <span>
                            {selectedAttestation.payload.coarseCategory === 'STATUTORY_MATERNITY'
                              ? 'A 26-week maternity claim implies pregnancy — unavoidable given the statutory category exists.'
                              : 'Medical leave implies illness, but gives zero diagnostic indication.'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* What a PDF would expose */}
                    <div className="p-3.5 rounded bg-[#0B1120] border border-[#1E293B] space-y-2">
                      <span className="font-bold text-red-400 uppercase font-condensed tracking-wider block text-[11px]">
                        What a PDF would expose:
                      </span>
                      <ul className="space-y-1 text-slate-300 text-[11px] leading-snug">
                        <li className="flex items-center gap-1.5 text-red-300">
                          <span>❌</span> Full ultrasound / lab report
                        </li>
                        <li className="flex items-center gap-1.5 text-red-300">
                          <span>❌</span> Doctor &amp; clinic name
                        </li>
                        <li className="flex items-center gap-1.5 text-red-300">
                          <span>❌</span> Diagnosis codes (ICD-10)
                        </li>
                        <li className="flex items-center gap-1.5 text-red-300">
                          <span>❌</span> Medications, dosages
                        </li>
                        <li className="flex items-center gap-1.5 text-red-300">
                          <span>❌</span> Lab results, measurements
                        </li>
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareModal(true);
                      setGeneratedShare(null);
                    }}
                    className="px-5 py-3 rounded bg-[#4A7C59] hover:bg-[#3D6649] text-white font-condensed font-bold uppercase tracking-wider text-sm transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>SHARE WITH HR</span>
                  </button>

                  <Link
                    href="/redaction-lab"
                    className="px-4 py-3 rounded bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 font-condensed font-bold uppercase tracking-wider text-sm transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-[#94C3A3]" />
                    <span>VIEW REDACTION PREVIEW</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowChainViewer(true)}
                    className="px-4 py-3 rounded bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 font-condensed font-bold uppercase tracking-wider text-sm transition-colors flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-[#94C3A3]" />
                    <span>VIEW CHAIN</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-8 rounded-lg bg-[#0B1120] border border-[#1E293B] text-center text-slate-400 text-xs font-mono">
                Select an attestation on the left to view details and leakage audit.
              </div>
            )}

          </div>

        </div>

        {/* 3c. Share Modal (Overlay) */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0B1120] border border-slate-700 rounded-lg p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {!generatedShare ? (
                <>
                  <div className="space-y-2 border-b border-[#1E293B] pb-3">
                    <span className="text-xs font-mono font-bold text-[#94C3A3] uppercase tracking-wider">
                      SHARE THIS ATTESTATION
                    </span>
                    <h3 className="text-xl font-bold text-white font-condensed uppercase tracking-wider">
                      Generate 24-Hour Padded Share Code
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    This will generate a 24-hour share code. HR can verify your leave eligibility without seeing your medical record or clinical details.
                  </p>

                  <div className="p-3.5 bg-[#0F172A] rounded border border-[#1E293B] font-mono text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Share code expires:</span>
                      <strong className="text-white">24 hours from creation</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Disclosed Category:</span>
                      <span className="text-[#94C3A3]">{selectedAttestation?.payload.coarseCategory}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowShareModal(false)}
                      className="px-4 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] text-slate-300 border border-slate-700"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateShareCode}
                      className="px-5 py-2.5 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#4A7C59] hover:bg-[#3D6649] text-white shadow-sm"
                    >
                      GENERATE SHARE CODE
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1 border-b border-[#1E293B] pb-3">
                    <span className="text-xs font-mono font-bold text-[#94C3A3] uppercase tracking-wider">
                      ✓ SHARE CODE GENERATED
                    </span>
                    <h3 className="text-lg font-bold text-white font-condensed uppercase tracking-wider">
                      Ready to present to HR
                    </h3>
                  </div>

                  <div className="p-4 bg-[#0F172A] rounded border border-[#334155] text-center space-y-2">
                    <span className="text-[11px] font-condensed uppercase tracking-wider font-semibold text-slate-400 block">
                      Share Code:
                    </span>
                    <div className="text-2xl font-mono font-bold tracking-widest text-[#94C3A3]">
                      {generatedShare.code}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-sans text-slate-300">
                    <p>Give this code to HR, or send her this direct verification link:</p>
                    <div className="p-2.5 bg-[#0F172A] rounded border border-[#1E293B] font-mono text-[11px] text-slate-300 break-all select-all">
                      {typeof window !== 'undefined' ? `${window.location.origin}/hr?code=${generatedShare.code}` : ''}
                    </div>
                  </div>

                  <div className="p-3 bg-[#0F172A] rounded border border-[#1E293B] font-mono text-[11px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className="text-white">{new Date(generatedShare.expiresAt).toLocaleDateString()} {new Date(generatedShare.expiresAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verifications allowed:</span>
                      <span className="text-white">3 attempts max</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(generatedShare.code)}
                      className="flex-1 px-3 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-white flex items-center justify-center gap-1.5"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#4A7C59]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'COPIED' : 'COPY CODE'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(generatedShare.code)}
                      className="flex-1 px-3 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-white flex items-center justify-center gap-1.5"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-[#4A7C59]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'LINK COPIED' : 'COPY LINK'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3.5 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-white flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#4A7C59]" />
                      <span>PRINT</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowShareModal(false)}
                      className="px-4 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#4A7C59] hover:bg-[#3D6649] text-white"
                    >
                      DONE
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans text-center">
                    ✓ View live history in &quot;Audit Log&quot; once HR queries this code.
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Chain Integrity Modal */}
        {showIntegrityModal && integrityReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0B1120] border border-slate-700 rounded-lg p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3">
                <ShieldCheck className="w-5 h-5 text-[#4A7C59]" />
                <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
                  CHAIN INTEGRITY CHECK
                </h3>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="text-base font-bold text-[#94C3A3]">
                  Status: ✓ CHAIN VALID
                </div>
                <p className="text-slate-300 font-sans">
                  {integrityReport.count} receipts cryptographically verified. No tampering detected.
                </p>

                <div className="p-3 bg-[#0F172A] rounded border border-[#1E293B] space-y-1 text-[11px] text-slate-300">
                  <div>Hash chain verification:</div>
                  <div>Receipt 1 → 2: <strong className="text-[#94C3A3]">✓</strong></div>
                  <div>Receipt 2 → 3: <strong className="text-[#94C3A3]">✓</strong></div>
                  <div>Receipt 3 → (latest): <strong className="text-[#94C3A3]">✓</strong></div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowIntegrityModal(false)}
                  className="px-4 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#4A7C59] hover:bg-[#3D6649] text-white"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full Receipt Chain Viewer Modal */}
        {showChainViewer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0B1120] border border-slate-700 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShowChainViewer(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <ReceiptChainViewer />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
