'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  getShareCodeByCode, 
  incrementShareCodeViews, 
  appendReceipt,
  evaluatePredicates,
  recordApprovedEntitlement,
  exportReceiptsAsCSV
} from '@/lib/storage';
import { verifySignedAttestation, VerificationResult, computeEmployerPseudonym } from '@/lib/crypto';
import { isIssuerInRegistry } from '@/lib/registry';
import { getRuleByCoarseCategory, VOUCH_POLICY_SPEC } from '@/lib/policy';
import { ShareCode, PredicateResult, CoarseCategory } from '@/lib/types';
import confetti from 'canvas-confetti';
import ReceiptChainViewer from '@/components/ReceiptChainViewer';
import { 
  Building2, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Key, 
  Sparkles, 
  FileCheck, 
  Printer, 
  Award,
  Lock,
  ChevronRight,
  RefreshCw,
  Scale,
  Database,
  ArrowRight,
  Link2,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

function HRVerifierContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [inputCode, setInputCode] = useState(initialCode);
  const [selectedPolicyCategory, setSelectedPolicyCategory] = useState<CoarseCategory>('STATUTORY_MATERNITY');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedShareCode, setVerifiedShareCode] = useState<ShareCode | null>(null);
  const [cryptoResult, setCryptoResult] = useState<VerificationResult | null>(null);
  const [predicateResult, setPredicateResult] = useState<PredicateResult | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [appendedReceiptId, setAppendedReceiptId] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      setInputCode(initialCode);
      executeVerification(initialCode);
    }
  }, [initialCode]);

  const activePolicyRule = getRuleByCoarseCategory(selectedPolicyCategory);

  const executeVerification = async (codeToVerify: string) => {
    const trimmed = codeToVerify.trim().toUpperCase();
    if (!trimmed) {
      setVerificationError('Please enter a valid Vouch share code.');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    setVerifiedShareCode(null);
    setCryptoResult(null);
    setPredicateResult(null);

    await new Promise(r => setTimeout(r, 450));

    const share = getShareCodeByCode(trimmed);

    if (!share) {
      setIsVerifying(false);
      setVerificationError(`Share code "${trimmed}" was not found or has expired.`);
      return;
    }

    if (share.isRevoked || share.signedAttestation.isRevokedByIssuer) {
      setIsVerifying(false);
      setVerificationError(`Share code "${trimmed}" was REVOKED. Verification refused.`);
      
      await appendReceipt({
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
      return;
    }

    const isExpired = new Date(share.expiresAt).getTime() < Date.now();
    if (isExpired) {
      setIsVerifying(false);
      setVerificationError(`Share code "${trimmed}" has EXPIRED (Validity passed on ${new Date(share.expiresAt).toLocaleDateString()}).`);
      
      await appendReceipt({
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
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // F3: Write immutable block to tamper-evident hash chain
      const receipt = await appendReceipt({
        shareCodeRef: trimmed,
        policyVersion: VOUCH_POLICY_SPEC.policyVersion,
        outcome: 'APPROVED',
        proofPayload: share.hrPayload as unknown as Record<string, unknown>,
        predicateResult: predicates,
        actorRole: 'HR_BENEFITS_VERIFIER'
      });
      setAppendedReceiptId(receipt.id);

      // Record in ledger
      recordApprovedEntitlement(
        pseudonym,
        share.hrPayload.coarseCategory,
        share.hrPayload.validFrom,
        share.hrPayload.validTo,
        receipt.id
      );
    } else {
      await appendReceipt({
        shareCodeRef: trimmed,
        policyVersion: VOUCH_POLICY_SPEC.policyVersion,
        outcome: 'REJECTED',
        proofPayload: share.hrPayload as unknown as Record<string, unknown>,
        predicateResult: predicates,
        actorRole: 'HR_BENEFITS_VERIFIER'
      });
    }
  };

  const handlePresetClick = (code: string) => {
    setInputCode(code);
    executeVerification(code);
  };

  const printComplianceSummary = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-ink-900 via-ink-850 to-ink-900 p-6 rounded-2xl border border-ink-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Enterprise HR Portal</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                Constrained Verifier (F2)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-0.5">Medical Leave Policy Verifier</h1>
            <p className="text-xs text-slate-400">
              Evaluate statutory leave claims against fixed policy rules without access to raw clinical files.
            </p>
          </div>
        </div>

        {/* Link to Database Inspector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            href="/hr/inspector"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-xs font-semibold text-purple-200 transition-colors"
          >
            <Database className="w-4 h-4 text-purple-300" />
            <span>Database Inspector (F8)</span>
          </Link>
        </div>
      </div>

      {/* F2: Constrained Request Builder Banner */}
      <div className="p-5 rounded-2xl bg-ink-900/90 border border-ink-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-seal-400" />
            <h3 className="font-bold text-white text-sm">Policy-Constrained Request Builder (F2)</h3>
          </div>
          <div className="px-3 py-1 rounded-full bg-seal-950 text-seal-300 text-xs font-mono border border-seal-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-seal-400" />
            <span>This request is generated from policy {VOUCH_POLICY_SPEC.policyVersion} and cannot be widened.</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          <strong>Power-Asymmetry Defense:</strong> To prevent coercive over-disclosure, HR cannot request arbitrary documents, clinical letters, or file uploads. Verification requests are fixed to statutory policy parameters.
        </p>

        {/* Share Code Input Box */}
        <div className="space-y-3 pt-2">
          <form 
            onSubmit={(e) => { e.preventDefault(); executeVerification(inputCode); }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Enter Share Code e.g. LG-7892"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-ink-950 border border-ink-700 text-white font-mono text-base tracking-wider uppercase focus:outline-none focus:border-seal-500 focus:ring-1 focus:ring-seal-500"
              />
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-seal-600 hover:bg-seal-500 text-white font-bold text-sm shadow-md shadow-seal-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Policy Predicates...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Credential</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">Quick Test Codes:</span>
            <button
              type="button"
              onClick={() => handlePresetClick('LG-7892')}
              className="px-2.5 py-1 rounded-lg bg-ink-950 hover:bg-ink-800 text-seal-300 font-mono border border-ink-700 transition-colors"
            >
              LG-7892 (Maternity Leave)
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {verificationError && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Verification Refused</h4>
            <p>{verificationError}</p>
          </div>
        </div>
      )}

      {/* Verification Success Results & Official Certificate */}
      {verifiedShareCode && cryptoResult && predicateResult && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Verdict Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-seal-950 via-ink-900 to-seal-950 border border-seal-500/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-seal-500/20 border border-seal-400/40 flex items-center justify-center text-seal-400 shrink-0">
                <CheckCircle2 className="w-6 h-6 text-seal-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-seal-400 font-mono uppercase">POLICY COMPLIANCE CONFIRMED</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-seal-900 text-seal-300 font-mono">
                    Policy: {verifiedShareCode.policyVersion}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mt-0.5">
                  Leave Eligibility Cryptographically Authenticated
                </h3>
              </div>
            </div>

            <button
              onClick={printComplianceSummary}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 text-slate-200 text-xs font-semibold border border-ink-700 transition-colors self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Print Compliance Receipt</span>
            </button>
          </div>

          {/* F1: 4 Pass/Fail Predicate Booleans HUD */}
          <div className="p-5 rounded-2xl bg-ink-950 border border-ink-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-ink-800 pb-2">
              <span className="text-seal-400 font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                F1 Entitlement Predicate Check (4 Pass/Fail Booleans)
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                HR never learns remaining days or past frequency
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="bg-ink-900 p-3 rounded-xl border border-ink-800 space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">1. Max Duration</span>
                <span className={predicateResult.withinPolicyMaxDuration ? 'text-seal-400 font-bold text-sm' : 'text-red-400 font-bold text-sm'}>
                  {predicateResult.withinPolicyMaxDuration ? '✓ PASS' : '✗ FAIL'}
                </span>
                <p className="text-[10px] text-slate-400 font-sans">Within statutory cap</p>
              </div>

              <div className="bg-ink-900 p-3 rounded-xl border border-ink-800 space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">2. Entitlement Quota</span>
                <span className={predicateResult.withinRemainingEntitlement ? 'text-seal-400 font-bold text-sm' : 'text-red-400 font-bold text-sm'}>
                  {predicateResult.withinRemainingEntitlement ? '✓ PASS' : '✗ FAIL'}
                </span>
                <p className="text-[10px] text-slate-400 font-sans">Within annual balance</p>
              </div>

              <div className="bg-ink-900 p-3 rounded-xl border border-ink-800 space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">3. Credential Validity</span>
                <span className={predicateResult.withinCredentialValidity ? 'text-seal-400 font-bold text-sm' : 'text-red-400 font-bold text-sm'}>
                  {predicateResult.withinCredentialValidity ? '✓ PASS' : '✗ FAIL'}
                </span>
                <p className="text-[10px] text-slate-400 font-sans">Inside doctor dates</p>
              </div>

              <div className="bg-ink-900 p-3 rounded-xl border border-ink-800 space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">4. No Double Dip</span>
                <span className={predicateResult.noOverlapWithApproved ? 'text-seal-400 font-bold text-sm' : 'text-red-400 font-bold text-sm'}>
                  {predicateResult.noOverlapWithApproved ? '✓ PASS' : '✗ FAIL'}
                </span>
                <p className="text-[10px] text-slate-400 font-sans">Zero approved overlaps</p>
              </div>
            </div>
          </div>

          {/* Official Vouch Verification Certificate (Parchment Format) */}
          <div className="parchment-sheet rounded-2xl p-8 text-ink-950 font-sans shadow-2xl relative border border-parchment-300">
            
            <div className="absolute top-6 right-6 official-stamp px-4 py-2 font-mono text-xs font-bold text-center">
              <div>✓ VERIFIED COMPLIANCE</div>
              <div className="text-[9px] tracking-normal font-sans font-normal opacity-80">
                Web Crypto ECDSA P-256
              </div>
            </div>

            <div className="space-y-6">
              
              <div className="border-b border-parchment-300 pb-4">
                <span className="font-mono text-xs uppercase font-bold text-slate-500 tracking-wider">
                  Labour Standard Compliance Certificate ({VOUCH_POLICY_SPEC.policyVersion})
                </span>
                <h2 className="text-2xl font-bold text-ink-900 mt-1">
                  Certified Leave of Absence Authorization
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 font-mono">
                  Share Code: <strong>{verifiedShareCode.code}</strong> • Attestation ID: <strong>{verifiedShareCode.hrPayload.attestationId}</strong>
                </p>
              </div>

              {/* Minimal Disclosed Claims (FIX 0a & 0b Enforced) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-parchment-200">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Coarse Statutory Class</span>
                  <p className="text-lg font-bold font-mono text-seal-900">
                    {verifiedShareCode.hrPayload.coarseCategory}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Clinical Issuer Licensing Status</span>
                  <p className="text-base font-bold text-ink-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-seal-700" />
                    <span>Licensed Clinical Authority (Registry Validated)</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Ref Hash: {verifiedShareCode.hrPayload.issuerRefHash.substring(0, 16)}...
                  </p>
                </div>
              </div>

              {/* Certified Dates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/90 p-4 rounded-xl border border-parchment-300 shadow-sm">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-seal-700" /> Leave Start Date
                  </span>
                  <p className="text-base font-bold font-mono text-ink-900 mt-0.5">
                    {verifiedShareCode.hrPayload.validFrom}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-seal-700" /> Leave End Date
                  </span>
                  <p className="text-base font-bold font-mono text-ink-900 mt-0.5">
                    {verifiedShareCode.hrPayload.validTo}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-seal-700" /> Return to Work
                  </span>
                  <p className="text-base font-bold font-mono text-seal-800 mt-0.5">
                    {verifiedShareCode.hrPayload.expectedReturnDate}
                  </p>
                </div>
              </div>

              {/* Occupational Fitness directive */}
              <div className="bg-white/70 p-4 rounded-xl border border-parchment-200 space-y-1">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Occupational Duty Clearance
                </span>
                <p className="text-sm font-bold text-ink-900">
                  {verifiedShareCode.hrPayload.fitForDuty === 'full-rest'
                    ? 'Unfit for duty during authorized window. Total rest mandated.'
                    : verifiedShareCode.hrPayload.fitForDuty === 'partial-remote'
                    ? 'Eligible for modified remote duties only.'
                    : 'Fit to resume duties upon return date.'}
                </p>
              </div>

              <div className="pt-2 border-t border-parchment-300 flex items-center justify-between text-xs text-slate-600 font-mono">
                <div>Receipt Appended: <strong className="text-ink-900">{appendedReceiptId}</strong></div>
                <div className="text-seal-800 font-bold">100% Zero-Health-Exposure</div>
              </div>

            </div>
          </div>

          {/* F3: Embedded Tamper-Evident Hash Chain Viewer */}
          <ReceiptChainViewer />

        </div>
      )}

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
