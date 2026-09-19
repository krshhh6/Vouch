'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  getShareCodeByCode, 
  getShareCodes,
  getReceipts, 
  getPendingQueue,
  approveLeaveRequest,
  subscribeToStateChange,
  seedDemoData,
  logAuditView,
  incrementShareCodeViews
} from '@/lib/storage';
import { 
  ShareCode, 
  QueueItem, 
  CoarseCategory, 
  VerificationReceipt, 
  ApprovalRecord 
} from '@/lib/types';
import PendingQueue from '@/components/hr/PendingQueue';
import PolicySelector from '@/components/hr/PolicySelector';
import ShareCodeEntry from '@/components/hr/ShareCodeEntry';
import VerificationResult from '@/components/hr/VerificationResult';
import ReceiptLog from '@/components/hr/ReceiptLog';
import { VOUCH_POLICY_SPEC } from '@/lib/policy';
import { verifySignedAttestation, computeEmployerPseudonym } from '@/lib/crypto';
import { evaluatePredicates } from '@/lib/storage';
import { Database, Building2 } from 'lucide-react';
import Link from 'next/link';

function HRVerifierContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  // State
  const [selectedCategory, setSelectedCategory] = useState<CoarseCategory>('STATUTORY_MATERNITY');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [receipts, setReceipts] = useState<VerificationReceipt[]>([]);
  
  // Verification flow
  const [inputCode, setInputCode] = useState(initialCode);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeStatus, setCodeStatus] = useState<'IDLE' | 'VERIFYING' | 'VALID' | 'INVALID'>('IDLE');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  const [verifiedShareCode, setVerifiedShareCode] = useState<ShareCode | null>(null);
  const [currentReceipt, setCurrentReceipt] = useState<VerificationReceipt | null>(null);

  // Approval flow
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);
  const [approvalCompleted, setApprovalCompleted] = useState<ApprovalRecord | null>(null);

  const loadData = () => {
    setQueue(getPendingQueue());
    setReceipts(getReceipts());
  };

  useEffect(() => {
    seedDemoData();
    loadData();

    const unsubscribe = subscribeToStateChange(() => {
      loadData();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (initialCode) {
      setInputCode(initialCode);
      executeVerification(initialCode);
    }
  }, [initialCode]);

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
    setApprovalCompleted(null);

    // Call API /api/verify/credential first, with client fallback
    try {
      const response = await fetch('/api/verify/credential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareCode: trimmed,
          policyId: selectedCategory === 'STATUTORY_MATERNITY' ? 'maternity-mba-1961' : 'medical-statutory-1972'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Look up full share or build mock
        let share = getShareCodeByCode(trimmed);
        if (!share) {
          // Use client store
          const shares = getShareCodes();
          share = shares.find(s => s.code.toUpperCase() === trimmed);
        }

        if (share) {
          incrementShareCodeViews(trimmed);
          logAuditView({
            id: `audit_${Date.now()}`,
            attestationId: share.attestationId,
            shareCode: trimmed,
            viewerEmail: 'alice@acmecorp.com',
            viewedAt: new Date().toISOString(),
            outcome: 'VERIFIED'
          });
          setVerifiedShareCode(share);
          setCurrentReceipt(data.receipt || null);
          setCodeStatus('VALID');
          setIsVerifying(false);
          loadData();
          return;
        }
      }
    } catch {
      // Fallback to client-side verification
    }

    // Client-side verification fallback
    await new Promise(r => setTimeout(r, 350));
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
      setVerificationError(`Share code "${trimmed}" was REVOKED by the clinic or holder.`);
      return;
    }

    const isExpired = new Date(share.expiresAt).getTime() < Date.now();
    if (isExpired) {
      setIsVerifying(false);
      setCodeStatus('INVALID');
      setVerificationError(`Share code "${trimmed}" has EXPIRED.`);
      return;
    }

    // Verify ECDSA signature
    const cryptoCheck = await verifySignedAttestation(share.signedAttestation);
    const pseudonym = await computeEmployerPseudonym(share.signedAttestation.payload.employeeId || 'ANON_HOLDER');
    const { predicates } = evaluatePredicates(
      pseudonym,
      share.hrPayload.coarseCategory,
      share.hrPayload.validFrom,
      share.hrPayload.validTo,
      share.signedAttestation
    );

    const allPass = Object.values(predicates).every(Boolean);

    if (cryptoCheck.isValid && allPass) {
      incrementShareCodeViews(trimmed);
      logAuditView({
        id: `audit_${Date.now()}`,
        attestationId: share.attestationId,
        shareCode: trimmed,
        viewerEmail: 'alice@acmecorp.com',
        viewedAt: new Date().toISOString(),
        outcome: 'VERIFIED'
      });
      setCodeStatus('VALID');
      setVerifiedShareCode(share);
    } else {
      setCodeStatus('INVALID');
      setVerificationError('Verification checks failed or policy predicates breached.');
    }

    setIsVerifying(false);
    loadData();
  };

  const handleSelectRequestFromQueue = (item: QueueItem) => {
    setInputCode(item.shareCode);
    setSelectedCategory(item.category);
    executeVerification(item.shareCode);
  };

  const handleApprove = async (comment: string): Promise<ApprovalRecord | null> => {
    if (!verifiedShareCode) return null;
    setIsProcessingApproval(true);

    try {
      // 1. Call /api/approve route
      try {
        await fetch('/api/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shareCode: verifiedShareCode.code,
            approvalDecision: 'APPROVED',
            comment,
            employeeId: verifiedShareCode.employeeId || 'EMP-9021',
            category: verifiedShareCode.hrPayload.coarseCategory,
            validFrom: verifiedShareCode.hrPayload.validFrom,
            validTo: verifiedShareCode.hrPayload.validTo,
            approvedBy: 'alice@acmecorp.com'
          })
        });
      } catch {
        // Fallback
      }

      // 2. Commit to storage layer with real-time notification
      const { approval } = await approveLeaveRequest({
        shareCode: verifiedShareCode.code,
        employeeId: verifiedShareCode.employeeId || 'EMP-9021',
        employeeName: verifiedShareCode.signedAttestation?.payload.employeeName || 'Sarah Jenkins',
        category: verifiedShareCode.hrPayload.coarseCategory,
        validFrom: verifiedShareCode.hrPayload.validFrom,
        validTo: verifiedShareCode.hrPayload.validTo,
        approvalDecision: 'APPROVED',
        approvedBy: 'alice@acmecorp.com',
        comment
      });

      setApprovalCompleted(approval);
      loadData();
      return approval;
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handleReject = async (comment: string): Promise<void> => {
    if (!verifiedShareCode) return;
    setIsProcessingApproval(true);

    try {
      try {
        await fetch('/api/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shareCode: verifiedShareCode.code,
            approvalDecision: 'REJECTED',
            comment,
            employeeId: verifiedShareCode.employeeId || 'EMP-9021',
            category: verifiedShareCode.hrPayload.coarseCategory,
            validFrom: verifiedShareCode.hrPayload.validFrom,
            validTo: verifiedShareCode.hrPayload.validTo,
            approvedBy: 'alice@acmecorp.com'
          })
        });
      } catch {
        // Fallback
      }

      await approveLeaveRequest({
        shareCode: verifiedShareCode.code,
        employeeId: verifiedShareCode.employeeId || 'EMP-9021',
        employeeName: verifiedShareCode.signedAttestation?.payload.employeeName || 'Sarah Jenkins',
        category: verifiedShareCode.hrPayload.coarseCategory,
        validFrom: verifiedShareCode.hrPayload.validFrom,
        validTo: verifiedShareCode.hrPayload.validTo,
        approvalDecision: 'REJECTED',
        approvedBy: 'alice@acmecorp.com',
        comment
      });

      setVerificationError(`Leave claim for ${verifiedShareCode.code} was officially REJECTED.`);
      setVerifiedShareCode(null);
      loadData();
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handleNextRequest = () => {
    setApprovalCompleted(null);
    setVerifiedShareCode(null);
    setInputCode('');
    setCodeStatus('IDLE');

    // Pick next waiting request from queue if any
    const nextWaiting = queue.find(q => q.status === 'WAITING' || q.status === 'VERIFIED');
    if (nextWaiting) {
      handleSelectRequestFromQueue(nextWaiting);
    }
  };

  return (
    <div className="w-full bg-[#0F172A] text-slate-100 min-h-[calc(100vh-100px)] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Strip */}
        <div className="border-b border-[#1E293B] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94C3A3]">
                HR VERIFIER PORTAL (/hr)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E293B] text-slate-300 border border-slate-700">
                Policy: {VOUCH_POLICY_SPEC.policyVersion}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-condensed uppercase tracking-wider">
              Verify &amp; Approve Leave Requests
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              Statutory verification portal. Validates eligibility without possessing or storing raw clinical notes or diagnoses.
            </p>
          </div>

          <Link
            href="/db-inspector"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-xs font-condensed uppercase tracking-wider font-bold text-slate-200 transition-colors self-start sm:self-auto"
          >
            <Database className="w-3.5 h-3.5 text-[#4A7C59]" />
            <span>DB Inspector (F8)</span>
          </Link>
        </div>

        {/* 3-Column Layout: Left (25%), Center (50%), Right (25%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel (25% / 3 cols): H1 Queue & H2 Policy Builder */}
          <div className="lg:col-span-3 space-y-6">
            <PendingQueue
              queue={queue}
              onSelectRequest={handleSelectRequestFromQueue}
              activeShareCode={inputCode}
              onRefreshQueue={loadData}
            />

            <PolicySelector
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />
          </div>

          {/* Center Panel (50% / 6 cols): H3 Share Code Entry + H4/H5 Verification & Approval Flow */}
          <div className="lg:col-span-6 space-y-6">
            <ShareCodeEntry
              inputCode={inputCode}
              onCodeChange={(code) => setInputCode(code)}
              onVerify={executeVerification}
              isVerifying={isVerifying}
              codeStatus={codeStatus}
              errorMessage={verificationError}
            />

            {verifiedShareCode && (
              <VerificationResult
                shareCode={verifiedShareCode}
                receipt={currentReceipt}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={isProcessingApproval}
                approvalCompleted={approvalCompleted}
                onNextRequest={handleNextRequest}
              />
            )}
          </div>

          {/* Right Panel (25% / 3 cols): H7 Receipts Log + H8 Export + H9 Dashboard */}
          <div className="lg:col-span-3">
            <ReceiptLog
              receipts={receipts}
              pendingCount={queue.filter(q => q.status === 'WAITING').length}
            />
          </div>

        </div>

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
