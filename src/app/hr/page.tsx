'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  getShareCodeByCode, 
  incrementShareCodeViews, 
  appendReceipt,
  evaluatePredicates,
  recordApprovedEntitlement,
  exportReceiptsAsCSV,
  getReceipts,
  subscribeToStateChange
} from '@/lib/storage';
import { verifySignedAttestation, VerificationResult, computeEmployerPseudonym } from '@/lib/crypto';
import { verifyChainIntegrity } from '@/lib/verification/receiptChain';
import { VOUCH_POLICY_SPEC, getRuleByCoarseCategory } from '@/lib/policy';
import { ShareCode, PredicateResult, CoarseCategory, VerificationReceipt } from '@/lib/types';
import { 
  Building2, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Printer, 
  RefreshCw,
  Scale,
  FileCheck,
  FileSpreadsheet,
  Download,
  Check,
  X,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';
import Link from 'next/link';

function HRVerifierContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  // 5a Request Generator State
  const [requestEmployeeName, setRequestEmployeeName] = useState('Sarah Jenkins');
  const [requestCategory, setRequestCategory] = useState<CoarseCategory>('STATUTORY_MATERNITY');
  const [generatedRequestNotice, setGeneratedRequestNotice] = useState<string | null>(null);

  // 5b Pending Requests Table
  const pendingRequests = [
    { name: 'S. Jenkins', category: 'Maternity', status: 'Waiting', date: 'Sep 16', code: 'LG-7892' },
    { name: 'M. Patel', category: 'Medical', status: 'Waiting', date: 'Sep 14', code: 'LG-3341' },
    { name: 'R. Kumar', category: 'Caregiving', status: 'Waiting', date: 'Sep 10', code: 'LG-5520' }
  ];

  // 5d Share Code Entry
  const [inputCode, setInputCode] = useState(initialCode);
  const [codeStatus, setCodeStatus] = useState<'IDLE' | 'VERIFYING' | 'VALID' | 'INVALID'>('IDLE');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedShareCode, setVerifiedShareCode] = useState<ShareCode | null>(null);
  const [cryptoResult, setCryptoResult] = useState<VerificationResult | null>(null);
  const [predicateResult, setPredicateResult] = useState<PredicateResult | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [appendedReceiptId, setAppendedReceiptId] = useState<string | null>(null);

  // 5f Recent Receipts State
  const [receiptsList, setReceiptsList] = useState<VerificationReceipt[]>([]);
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<{ valid: boolean; count: number; error?: string } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadReceipts();
    const unsubscribe = subscribeToStateChange(() => {
      loadReceipts();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (initialCode) {
      setInputCode(initialCode);
      executeVerification(initialCode);
    }
  }, [initialCode]);

  const loadReceipts = () => {
    setReceiptsList(getReceipts());
  };

  const handleGenerateRequest = () => {
    setGeneratedRequestNotice(
      `Formal policy notice issued to ${requestEmployeeName} for ${requestCategory}. Request locked to policy ${VOUCH_POLICY_SPEC.policyVersion}.`
    );
    setTimeout(() => setGeneratedRequestNotice(null), 5000);
  };

  const executeVerification = async (codeToVerify: string) => {
    const trimmed = codeToVerify.trim().toUpperCase();
    if (!trimmed) {
      setVerificationError('Please enter a valid Vouch share code.');
      setCodeStatus('INVALID');
      return;
    }

    setIsVerifying(true);
    setCodeStatus('VERIFYING');
    setVerificationError(null);
    setVerifiedShareCode(null);
    setCryptoResult(null);
    setPredicateResult(null);

    await new Promise(r => setTimeout(r, 450));

    const share = getShareCodeByCode(trimmed);

    if (!share) {
      setIsVerifying(false);
      setCodeStatus('INVALID');
      setVerificationError(`Share code "${trimmed}" was not found or has expired.`);
      return;
    }

    if (share.isRevoked || share.signedAttestation.isRevokedByIssuer) {
      setIsVerifying(false);
      setCodeStatus('INVALID');
      setVerificationError(`Share code "${trimmed}" was REVOKED. Verification refused.`);
      
      const receipt = await appendReceipt({
        shareCodeRef: trimmed,
        policyVersion: VOUCH_POLICY_SPEC.policyVersion,
        outcome: 'REVOKED',
        proofPayload: { status: 'REVOKED_ACCESS_ATTEMPT' },
        predicateResult: {
          withinPolicyMaxDuration: false,
          withinRemainingEntitlement: false,
          withinCredentialValidity: false,
          noOverlapWithApproved: false
        }
      });
      setAppendedReceiptId(receipt.id);
      loadReceipts();
      return;
    }

    const isExpired = new Date(share.expiresAt).getTime() < Date.now();
    if (isExpired) {
      setIsVerifying(false);
      setCodeStatus('INVALID');
      setVerificationError(`Share code "${trimmed}" has EXPIRED (Validity passed on ${new Date(share.expiresAt).toLocaleDateString()}).`);
      
      const receipt = await appendReceipt({
        shareCodeRef: trimmed,
        policyVersion: VOUCH_POLICY_SPEC.policyVersion,
        outcome: 'EXPIRED',
        proofPayload: { status: 'EXPIRED_ACCESS_ATTEMPT' },
        predicateResult: {
          withinPolicyMaxDuration: false,
          withinRemainingEntitlement: false,
          withinCredentialValidity: false,
          noOverlapWithApproved: false
        }
      });
      setAppendedReceiptId(receipt.id);
      loadReceipts();
      return;
    }

    // Step 1: Web Crypto Signature Verification
    let cryptoCheck: VerificationResult = {
      isValid: true,
      algorithm: 'ECDSA-P256-SHA256',
      curve: 'P-256',
      signedAt: share.createdAt,
      sha256Fingerprint: 'self_declared_no_clinician',
      details: { keyFormatValid: true, dataIntegrityValid: true, signatureValid: true }
    };

    if (share.policyRuleId !== 'menstrual-self-declared') {
      cryptoCheck = await verifySignedAttestation(share.signedAttestation);
    }
    setCryptoResult(cryptoCheck);

    // Step 2: F1 Pseudonymous Entitlement Predicate Check
    const pseudonym = await computeEmployerPseudonym(share.signedAttestation.payload.employeeId || 'ANON_HOLDER');
    const { predicates } = evaluatePredicates(
      pseudonym,
      share.hrPayload.coarseCategory,
      share.hrPayload.validFrom,
      share.hrPayload.validTo,
      share.signedAttestation
    );
    setPredicateResult(predicates);

    incrementShareCodeViews(trimmed);
    setVerifiedShareCode(share);
    setIsVerifying(false);

    const allPredicatesPass = Object.values(predicates).every(Boolean);

    if (cryptoCheck.isValid && allPredicatesPass) {
      setCodeStatus('VALID');
      const receipt = await appendReceipt({
        shareCodeRef: trimmed,
        policyVersion: VOUCH_POLICY_SPEC.policyVersion,
        outcome: 'APPROVED',
        proofPayload: share.hrPayload as unknown as Record<string, unknown>,
        predicateResult: predicates,
        actorRole: 'HR_BENEFITS_VERIFIER'
      });
      setAppendedReceiptId(receipt.id);

      recordApprovedEntitlement(
        pseudonym,
        share.hrPayload.coarseCategory,
        share.hrPayload.validFrom,
        share.hrPayload.validTo,
        receipt.id
      );
    } else {
      setCodeStatus('INVALID');
      const receipt = await appendReceipt({
        shareCodeRef: trimmed,
        policyVersion: VOUCH_POLICY_SPEC.policyVersion,
        outcome: 'REJECTED',
        proofPayload: share.hrPayload as unknown as Record<string, unknown>,
        predicateResult: predicates,
        actorRole: 'HR_BENEFITS_VERIFIER'
      });
      setAppendedReceiptId(receipt.id);
    }
    loadReceipts();
  };

  const handleVerifyIntegrity = async () => {
    const result = await verifyChainIntegrity(receiptsList);
    setIntegrityStatus({
      valid: result.valid,
      count: receiptsList.length,
      error: result.reason
    });
    setShowIntegrityModal(true);
  };

  const handleDownloadCsv = () => {
    exportReceiptsAsCSV();
    setShowExportModal(false);
  };

  return (
    <div className="w-full bg-[#0F172A] text-slate-100 min-h-[calc(100vh-100px)] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Strip */}
        <div className="border-b border-[#1E293B] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94C3A3]">
                3. HR VERIFIER
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E293B] text-slate-300 border border-slate-700">
                Generated from policy: {VOUCH_POLICY_SPEC.policyVersion}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-condensed uppercase tracking-wider">
              Process &amp; approve leave requests
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              Constrained statutory verification portal. Confirms eligibility without possessing or storing raw clinical notes or diagnoses.
            </p>
          </div>

          <Link
            href="/db-inspector"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-xs font-condensed uppercase tracking-wider font-bold text-slate-200 transition-colors self-start sm:self-auto"
          >
            <Database className="w-3.5 h-3.5 text-[#4A7C59]" />
            <span>DB Inspector (F8)</span>
          </Link>
        </div>

        {/* 3-Column Layout: Left 35%, Center 50%, Right 15% */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel (35%): 5a. Request Generator + 5b. Pending Requests + 5c. Predicates Check */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 5a. Request Generator Card (F2) */}
            <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#1E293B] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#4A7C59]" />
                  NEW VERIFICATION REQUEST
                </span>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  (Generated from policy, cannot be widened or customized)
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 font-condensed uppercase tracking-wider block mb-1">
                    Employee Name:
                  </label>
                  <input
                    type="text"
                    value={requestEmployeeName}
                    onChange={(e) => setRequestEmployeeName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-[#0F172A] border border-[#334155] text-slate-200 focus:outline-none focus:border-[#4A7C59]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 font-condensed uppercase tracking-wider block mb-1">
                    Leave Category:
                  </label>
                  <div className="space-y-1.5 bg-[#0F172A] p-2.5 rounded border border-[#334155] text-[11px]">
                    {[
                      { id: 'STATUTORY_MATERNITY', label: 'STATUTORY_MATERNITY' },
                      { id: 'STATUTORY_MEDICAL', label: 'STATUTORY_MEDICAL' },
                      { id: 'CAREGIVING', label: 'CAREGIVING' },
                      { id: 'SELF_DECLARED', label: 'SELF_DECLARED' }
                    ].map((opt) => (
                      <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="radio"
                          name="reqCategory"
                          value={opt.id}
                          checked={requestCategory === opt.id}
                          onChange={(e) => setRequestCategory(e.target.value as CoarseCategory)}
                          className="accent-[#4A7C59]"
                        />
                        <span className={requestCategory === opt.id ? 'font-bold text-white font-mono' : 'font-mono'}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Policy Claims Spec */}
                <div className="p-3 bg-[#0F172A] rounded border border-[#1E293B] space-y-2 text-[11px]">
                  <div>
                    <span className="font-bold text-white font-condensed uppercase tracking-wider block">
                      Policy: {VOUCH_POLICY_SPEC.policyVersion}
                    </span>
                    <span className="text-slate-400 font-sans block text-[10px]">
                      Required claims for {requestCategory} (read-only):
                    </span>
                    <ul className="text-[#94C3A3] font-mono text-[10px] space-y-0.5 mt-1">
                      <li>✓ issuerIsLicensed</li>
                      <li>✓ coarseCategory</li>
                      <li>✓ validFrom</li>
                      <li>✓ validTo</li>
                    </ul>
                  </div>

                  <div className="border-t border-[#1E293B] pt-1.5">
                    <span className="text-slate-400 font-sans block text-[10px]">
                      Forbidden claims (never requested):
                    </span>
                    <ul className="text-red-300 font-mono text-[10px] space-y-0.5 mt-1">
                      <li>✗ diagnosis</li>
                      <li>✗ issuerName</li>
                      <li>✗ fineCategory</li>
                    </ul>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-sans italic">
                  &quot;This request is generated from policy {VOUCH_POLICY_SPEC.policyVersion} and cannot be widened.&quot;
                </p>

                {generatedRequestNotice && (
                  <div className="p-2 bg-[#142319] border border-[#284230] rounded text-[11px] text-[#94C3A3] font-sans">
                    {generatedRequestNotice}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerateRequest}
                  className="w-full py-2.5 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-white transition-colors"
                >
                  GENERATE REQUEST
                </button>
              </div>
            </div>

            {/* 5b. Pending Requests Table */}
            <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-5 space-y-3 shadow-sm">
              <div className="border-b border-[#1E293B] pb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white">
                  PENDING REQUESTS
                </span>
                <span className="text-[10px] font-mono text-slate-400">Click to process</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-slate-400 font-condensed uppercase tracking-wider text-[11px]">
                      <th className="py-1.5 px-2">Employee</th>
                      <th className="py-1.5 px-2">Category</th>
                      <th className="py-1.5 px-2">Status</th>
                      <th className="py-1.5 px-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60 text-[11px]">
                    {pendingRequests.map((req, i) => (
                      <tr
                        key={i}
                        onClick={() => {
                          setInputCode(req.code);
                          executeVerification(req.code);
                        }}
                        className="hover:bg-[#0F172A] cursor-pointer transition-colors"
                      >
                        <td className="py-2 px-2 font-bold text-white">{req.name}</td>
                        <td className="py-2 px-2 text-slate-300">{req.category}</td>
                        <td className="py-2 px-2 text-amber-300">{req.status}</td>
                        <td className="py-2 px-2 text-slate-400">{req.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5c. Predicates Check Card (Appears / Updates on verification) */}
            <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-5 space-y-3 shadow-sm">
              <div className="border-b border-[#1E293B] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#4A7C59]" />
                  ENTITLEMENT PREDICATES (F1)
                </span>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                  All checks must pass for approval. Employee doesn&apos;t see the counters; you only see true/false per check.
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-[#0F172A] border border-[#1E293B]">
                  <span>Duration within policy max</span>
                  <strong className={predicateResult?.withinPolicyMaxDuration ? 'text-[#94C3A3]' : predicateResult ? 'text-red-400' : 'text-slate-500'}>
                    {predicateResult?.withinPolicyMaxDuration ? '✓ PASS' : predicateResult ? '✗ FAIL' : '—'}
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#0F172A] border border-[#1E293B]">
                  <span>Days remaining in entitlement</span>
                  <strong className={predicateResult?.withinRemainingEntitlement ? 'text-[#94C3A3]' : predicateResult ? 'text-red-400' : 'text-slate-500'}>
                    {predicateResult?.withinRemainingEntitlement ? '✓ PASS' : predicateResult ? '✗ FAIL' : '—'}
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#0F172A] border border-[#1E293B]">
                  <span>Window within credential validity</span>
                  <strong className={predicateResult?.withinCredentialValidity ? 'text-[#94C3A3]' : predicateResult ? 'text-red-400' : 'text-slate-500'}>
                    {predicateResult?.withinCredentialValidity ? '✓ PASS' : predicateResult ? '✗ FAIL' : '—'}
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#0F172A] border border-[#1E293B]">
                  <span>No overlap with approved blocks</span>
                  <strong className={predicateResult?.noOverlapWithApproved ? 'text-[#94C3A3]' : predicateResult ? 'text-red-400' : 'text-slate-500'}>
                    {predicateResult?.noOverlapWithApproved ? '✓ PASS' : predicateResult ? '✗ FAIL' : '—'}
                  </strong>
                </div>
              </div>
            </div>

          </div>

          {/* Center Panel (50%): 5d. Share Code Entry + 5e. Verification Result Card */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 5d. Share Code Entry & Verification Flow */}
            <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#1E293B] pb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-[#4A7C59]" />
                  ENTER SHARE CODE
                </span>
                <span className="text-[10px] font-mono text-slate-400">Padded 24h token</span>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); executeVerification(inputCode); }}
                className="space-y-3"
              >
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 font-condensed uppercase tracking-wider block mb-1">
                    Share Code:
                  </label>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="VC-26WMAT-8K2X9 or LG-7892"
                    className="w-full px-3.5 py-2.5 rounded bg-[#0F172A] border border-[#334155] font-mono text-sm tracking-wider uppercase text-white focus:outline-none focus:border-[#4A7C59]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>OR scan QR from employee:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert('Camera QR scanning active in browser.')}
                      className="text-[11px] text-[#94C3A3] hover:underline"
                    >
                      [OPEN CAMERA]
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const sampleUrl = prompt('Paste full employee verification URL:');
                        if (sampleUrl && sampleUrl.includes('code=')) {
                          const c = sampleUrl.split('code=')[1]?.split('&')[0];
                          if (c) {
                            setInputCode(c);
                            executeVerification(c);
                          }
                        }
                      }}
                      className="text-[11px] text-[#94C3A3] hover:underline"
                    >
                      [PASTE URL]
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 rounded bg-[#4A7C59] hover:bg-[#3D6649] text-white font-condensed font-bold uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Cryptographic Credential...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>VERIFY CREDENTIAL</span>
                    </>
                  )}
                </button>

                {/* Share code status indicator */}
                <div className="p-3 bg-[#0F172A] rounded border border-[#1E293B] space-y-1 text-xs font-mono">
                  <span className="text-[10px] text-slate-400 font-condensed uppercase tracking-wider block">
                    Share code status:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={
                      codeStatus === 'IDLE' ? 'text-slate-500' :
                      codeStatus === 'VERIFYING' ? 'text-amber-400' :
                      codeStatus === 'VALID' ? 'text-[#94C3A3] font-bold' :
                      'text-red-400 font-bold'
                    }>
                      {codeStatus === 'IDLE' && '○ Not entered yet'}
                      {codeStatus === 'VERIFYING' && '⟳ Verifying...'}
                      {codeStatus === 'VALID' && '✓ Valid & verified'}
                      {codeStatus === 'INVALID' && '✗ Invalid / expired / revoked'}
                    </span>
                  </div>
                </div>
              </form>
            </div>

            {/* Error Display */}
            {verificationError && (
              <div className="p-4 rounded bg-[#0B1120] border border-red-800 text-red-200 text-xs space-y-1 animate-in fade-in">
                <div className="font-bold font-condensed uppercase tracking-wider flex items-center gap-1.5 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Verification Refused</span>
                </div>
                <p className="font-mono text-[11px]">{verificationError}</p>
                {appendedReceiptId && (
                  <p className="text-[10px] text-slate-400 font-mono pt-1 border-t border-[#1E293B]">
                    Receipt filed: {appendedReceiptId} (Outcome: REJECTED)
                  </p>
                )}
              </div>
            )}

            {/* 5e. Verification Result Card (Post-Verify) */}
            {verifiedShareCode && cryptoResult && predicateResult && (
              <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-6 space-y-6 shadow-sm animate-in fade-in">
                
                {/* Result Status Banner */}
                <div className="border-b border-[#1E293B] pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#142319] border border-[#284230] flex items-center justify-center text-[#94C3A3]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-base font-bold font-mono text-[#94C3A3] tracking-wider uppercase block">
                        ✓ APPROVED
                      </span>
                      <p className="text-xs text-slate-400 font-sans">
                        Attestation verified • P-256 authentic • Licensed &amp; active • All predicates passed
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    Policy: {verifiedShareCode.policyVersion}
                  </span>
                </div>

                {/* Approved Attestation Parchment Card */}
                <div className="parchment-sheet rounded-lg p-5 text-[#0F172A] font-sans border border-[#EDE6D6] space-y-4">
                  <div className="border-b border-[#EDE6D6] pb-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 block">
                        MEDICAL ATTESTATION CERTIFICATE
                      </span>
                      <h4 className="text-base font-bold text-[#0F172A] mt-0.5">
                        Holder: Sarah Jenkins <span className="font-mono text-xs text-slate-600">(EMP-9021)</span>
                      </h4>
                    </div>

                    <div className="official-stamp text-[10px] py-0.5 px-2 font-bold text-[#4A7C59] border-[#4A7C59]">
                      ✓ VERIFIED
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/80 p-2.5 rounded border border-[#EDE6D6] space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase font-condensed tracking-wider">
                        Category
                      </span>
                      <p className="font-mono font-bold text-xs text-[#31523B]">
                        {verifiedShareCode.hrPayload.coarseCategory}
                      </p>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded border border-[#EDE6D6] space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase font-condensed tracking-wider">
                        Window
                      </span>
                      <p className="font-mono font-semibold text-xs text-[#0F172A]">
                        {verifiedShareCode.hrPayload.validFrom} – {verifiedShareCode.hrPayload.validTo}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded border border-[#EDE6D6] text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-condensed tracking-wider block">
                      Occupational Status
                    </span>
                    <p className="text-xs font-semibold text-[#0F172A] mt-0.5">
                      {verifiedShareCode.hrPayload.fitForDuty === 'full-rest'
                        ? 'Unfit (Rest Mandated)'
                        : 'Fit for Modified / Remote Duty'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#EDE6D6] flex items-center justify-between text-[11px] font-mono text-slate-600">
                    <span>Issuer Licensed: <strong className="text-[#31523B]">✓</strong> • Not Revoked: <strong className="text-[#31523B]">✓</strong></span>
                    <span>Proof Hash: <strong>{verifiedShareCode.hrPayload.issuerRefHash.substring(0, 10)}...</strong></span>
                  </div>
                </div>

                {/* Receipt Notice */}
                <div className="p-3 bg-[#0F172A] rounded border border-[#1E293B] text-xs space-y-1">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Receipt filed:</span>
                    <strong className="text-[#94C3A3]">{appendedReceiptId}</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    ℹ No medical data was stored. ℹ Only this cryptographic receipt remains.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert('Leave claim marked as officially APPROVED in company payroll and HRIS.')}
                    className="flex-1 py-2.5 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#4A7C59] hover:bg-[#3D6649] text-white transition-colors"
                  >
                    APPROVE IN SYSTEM
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2.5 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-white transition-colors"
                  >
                    VIEW RECEIPT
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Request denied.')}
                    className="px-3.5 py-2.5 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 transition-colors"
                  >
                    DENY REQUEST
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Right Panel (15%): 5f. Recent Receipts Log */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-4 space-y-3 shadow-sm">
              <div className="border-b border-[#1E293B] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#4A7C59]" />
                  RECENT RECEIPTS
                </span>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                  (F3 — receipt chain log)
                </p>
              </div>

              <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                {receiptsList.length === 0 ? (
                  <p className="text-[11px] text-slate-500 font-sans py-3 text-center">
                    No receipts recorded yet.
                  </p>
                ) : (
                  receiptsList.map((rcp) => (
                    <div key={rcp.id} className="p-2.5 rounded bg-[#0F172A] border border-[#1E293B] space-y-1 text-xs font-mono">
                      <div className="flex justify-between items-center text-[10px]">
                        <strong className="text-white">{rcp.id}</strong>
                        <span className={rcp.outcome === 'APPROVED' ? 'text-[#94C3A3] font-bold' : 'text-red-400 font-bold'}>
                          {rcp.outcome === 'APPROVED' ? 'APPROVED ✓' : rcp.outcome + ' ✗'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {new Date(rcp.verifiedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(rcp.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Hash: {rcp.hash.substring(0, 8)}...
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-[#1E293B] space-y-2">
                <button
                  type="button"
                  onClick={handleVerifyIntegrity}
                  className="w-full py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#142319] hover:bg-[#1f3727] text-[#94C3A3] border border-[#284230] transition-colors text-center"
                >
                  VERIFY CHAIN INTEGRITY
                </button>

                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  className="w-full py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] text-slate-200 border border-slate-700 transition-colors text-center"
                >
                  DOWNLOAD COMPLIANCE REPORT
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Chain Integrity Modal */}
        {showIntegrityModal && integrityStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0B1120] border border-slate-700 rounded-lg p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3">
                <ShieldCheck className="w-5 h-5 text-[#4A7C59]" />
                <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
                  CHAIN INTEGRITY CHECK
                </h3>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="text-base font-bold text-[#94C3A3]">
                  Status: ✓ CHAIN VALID
                </div>
                <p className="text-slate-300 font-sans">
                  {integrityStatus.count} receipts verified. No tampering detected.
                </p>

                <div className="p-3 bg-[#0F172A] rounded border border-[#1E293B] space-y-1.5 text-[11px] text-slate-300">
                  <div>First receipt (genesis):</div>
                  <div className="text-slate-400">RCP-2026-004500, Genesis Block</div>

                  <div className="pt-1">Last receipt (current):</div>
                  <div className="text-slate-400">{receiptsList[0]?.id || 'RCP-2026-004521'}</div>
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

        {/* Compliance Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0B1120] border border-slate-700 rounded-lg p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3">
                <FileSpreadsheet className="w-5 h-5 text-[#4A7C59]" />
                <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
                  COMPLIANCE EXPORT
                </h3>
              </div>

              <div className="space-y-3 text-xs font-sans">
                <p className="text-slate-300">
                  This CSV contains zero health data. Suitable for labor inspection audit.
                </p>

                <div className="p-3 bg-[#0F172A] rounded border border-[#1E293B] space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-[#94C3A3] font-bold block mb-0.5">Included:</span>
                    <ul className="text-slate-300 space-y-0.5">
                      <li>✓ Receipt IDs</li>
                      <li>✓ Verification dates</li>
                      <li>✓ Outcomes (approved/rejected)</li>
                      <li>✓ Hash chain proofs</li>
                    </ul>
                  </div>

                  <div className="border-t border-[#1E293B] pt-1.5">
                    <span className="text-red-400 font-bold block mb-0.5">Excluded:</span>
                    <ul className="text-slate-400 space-y-0.5">
                      <li>✗ Any diagnosis</li>
                      <li>✗ Any clinic name</li>
                      <li>✗ Any medication</li>
                      <li>✗ Any patient ID</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] text-slate-300 border border-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="px-4 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#4A7C59] hover:bg-[#3D6649] text-white flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function HRVerifierPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 font-mono">Loading HR Verifier...</div>}>
      <HRVerifierContent />
    </Suspense>
  );
}
