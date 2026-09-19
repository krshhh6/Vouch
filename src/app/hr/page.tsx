'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  getShareCodeByCode, 
  getShareCodes,
  getReceipts, 
  getPendingQueue,
  getLeaveApplications,
  reviewLeaveApplication,
  approveLeaveRequest,
  getCurrentUser,
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
  ApprovalRecord,
  LeaveApplication,
  UserSession
} from '@/lib/types';
import PendingQueue from '@/components/hr/PendingQueue';
import PolicySelector from '@/components/hr/PolicySelector';
import ShareCodeEntry from '@/components/hr/ShareCodeEntry';
import VerificationResult from '@/components/hr/VerificationResult';
import ReceiptLog from '@/components/hr/ReceiptLog';
import AllEmployeesLeaveTable from '@/components/hr/AllEmployeesLeaveTable';
import LeaveConfirmationModal from '@/components/hr/LeaveConfirmationModal';
import { VOUCH_POLICY_SPEC } from '@/lib/policy';
import { verifySignedAttestation, computeEmployerPseudonym } from '@/lib/crypto';
import { evaluatePredicates } from '@/lib/storage';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileCheck, 
  Lock, 
  SlidersHorizontal 
} from 'lucide-react';

function HRVerifierContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [currentUser, setCurrentUser] = useState<UserSession>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<'roster' | 'desk' | 'receipts'>('roster');

  // Roster & Queue state
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [receipts, setReceipts] = useState<VerificationReceipt[]>([]);

  // Confirmation Modal
  const [modalApp, setModalApp] = useState<LeaveApplication | null>(null);
  const [modalMode, setModalMode] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Single code verification flow
  const [selectedCategory, setSelectedCategory] = useState<CoarseCategory>('STATUTORY_MATERNITY');
  const [inputCode, setInputCode] = useState(initialCode);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeStatus, setCodeStatus] = useState<'IDLE' | 'VERIFYING' | 'VALID' | 'INVALID'>('IDLE');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedShareCode, setVerifiedShareCode] = useState<ShareCode | null>(null);
  const [currentReceipt, setCurrentReceipt] = useState<VerificationReceipt | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [latestApproval, setLatestApproval] = useState<ApprovalRecord | null>(null);

  const loadAll = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setApplications(getLeaveApplications());
    setQueue(getPendingQueue());
    setReceipts(getReceipts());
  };

  useEffect(() => {
    seedDemoData();
    loadAll();

    const unsubscribe = subscribeToStateChange(() => {
      loadAll();
    });

    const interval = setInterval(() => {
      loadAll();
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleOpenApproveModal = (app: LeaveApplication) => {
    setModalApp(app);
    setModalMode('APPROVE');
    setShowConfirmModal(true);
  };

  const handleOpenRejectModal = (app: LeaveApplication) => {
    setModalApp(app);
    setModalMode('REJECT');
    setShowConfirmModal(true);
  };

  const handleExecuteDecision = (
    appId: string,
    decision: 'APPROVED' | 'REJECTED',
    comment?: string
  ) => {
    reviewLeaveApplication(appId, decision, currentUser.email || 'alice.hr@acmecorp.com', comment);
    loadAll();
  };

  // Verification flow for share code
  const handleVerifyCode = async (codeToVerify: string) => {
    if (!codeToVerify) return;
    setIsVerifying(true);
    setCodeStatus('VERIFYING');
    setVerificationError(null);
    setVerifiedShareCode(null);
    setCurrentReceipt(null);
    setLatestApproval(null);

    try {
      const share = getShareCodeByCode(codeToVerify);
      if (!share) {
        setCodeStatus('INVALID');
        setVerificationError('Share code not found or expired.');
        return;
      }

      if (share.isRevoked) {
        setCodeStatus('INVALID');
        setVerificationError('Attestation revoked by issuer clinic or employee.');
        return;
      }

      const isValidSignature = await verifySignedAttestation(share.signedAttestation);
      if (!isValidSignature) {
        setCodeStatus('INVALID');
        setVerificationError('Cryptographic ECDSA P-256 signature invalid.');
        return;
      }

      incrementShareCodeViews(share.code);
      setVerifiedShareCode(share);
      setCodeStatus('VALID');
      logAuditView({
        id: `aud_${Date.now()}`,
        attestationId: share.attestationId,
        shareCode: share.code,
        viewerEmail: currentUser.email,
        viewedAt: new Date().toISOString(),
        outcome: 'VERIFIED'
      });
    } catch (err: any) {
      setCodeStatus('INVALID');
      setVerificationError(err?.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;
  const approvedCount = applications.filter((a) => a.status === 'APPROVED').length;

  return (
    <div className="w-full bg-[#0A101D] text-slate-100 min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Strip */}
        <div className="bg-[#111C2E] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                  PORTAL 2 • HR ENTERPRISE BENEFITS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Zero-PHI Verifier
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-condensed uppercase tracking-wider">
                HR VERIFIER PORTAL
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-2 font-mono">
                <span>
                  Logged in as: <strong className="text-white">{currentUser.name}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-blue-400">{currentUser.department || 'People Operations & Benefits'}</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Statutory Rule: {VOUCH_POLICY_SPEC.policyVersion}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs font-mono">
            <div className="p-3 bg-[#0A101D] border border-slate-800 rounded-xl">
              <span className="text-slate-500 block text-[10px]">ALL LEAVE REQUESTS</span>
              <span className="text-white font-bold text-base">{applications.length} Roster</span>
            </div>
            <div className="p-3 bg-[#0A101D] border border-slate-800 rounded-xl">
              <span className="text-amber-400 block text-[10px]">PENDING CONFIRMATIONS</span>
              <span className="text-amber-400 font-bold text-base">{pendingCount} Action Required</span>
            </div>
            <div className="p-3 bg-[#0A101D] border border-slate-800 rounded-xl">
              <span className="text-emerald-400 block text-[10px]">CONFIRMED &amp; APPROVED</span>
              <span className="text-emerald-400 font-bold text-base">{approvedCount} Active</span>
            </div>
            <div className="p-3 bg-[#0A101D] border border-slate-800 rounded-xl">
              <span className="text-blue-400 block text-[10px]">ZERO-PHI COMPLIANCE</span>
              <span className="text-blue-300 font-bold text-base">100% Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-5 py-3 text-xs font-condensed uppercase tracking-wider font-bold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'roster'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>All Employees Leave Status Roster</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('desk')}
            className={`px-5 py-3 text-xs font-condensed uppercase tracking-wider font-bold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'desk'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Single Code Verification Desk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('receipts')}
            className={`px-5 py-3 text-xs font-condensed uppercase tracking-wider font-bold border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'receipts'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4 text-blue-400" />
            <span>Tamper-Evident Receipt Chain Log</span>
          </button>
        </div>

        {/* Tab 1: All Employees Leave Status Roster */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <AllEmployeesLeaveTable
              applications={applications}
              onApprove={handleOpenApproveModal}
              onReject={handleOpenRejectModal}
            />
          </div>
        )}

        {/* Tab 2: Single Code Verification Desk */}
        {activeTab === 'desk' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-6">
              <PendingQueue
                queue={queue}
                onSelectRequest={(item) => {
                  setInputCode(item.shareCode);
                  handleVerifyCode(item.shareCode);
                }}
                activeShareCode={inputCode}
              />
              <PolicySelector
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            <div className="lg:col-span-8 space-y-6">
              <ShareCodeEntry
                inputCode={inputCode}
                onCodeChange={setInputCode}
                onVerify={(code) => handleVerifyCode(code || inputCode)}
                isVerifying={isVerifying}
                codeStatus={codeStatus}
                errorMessage={verificationError}
              />

              {verifiedShareCode && (
                <VerificationResult
                  shareCode={verifiedShareCode}
                  receipt={currentReceipt}
                  onApprove={async (comment: string) => {
                    if (!verifiedShareCode) return null;
                    setIsApproving(true);
                    try {
                      const res = await approveLeaveRequest({
                        shareCode: verifiedShareCode.code,
                        employeeId: verifiedShareCode.employeeId || 'EMP-9021',
                        employeeName: 'Sarah Jenkins',
                        category: verifiedShareCode.hrPayload.coarseCategory,
                        validFrom: verifiedShareCode.hrPayload.validFrom,
                        validTo: verifiedShareCode.hrPayload.validTo,
                        approvalDecision: 'APPROVED',
                        approvedBy: currentUser.email,
                        comment,
                      });
                      setLatestApproval(res.approval);
                      setCurrentReceipt(res.receipt as any);
                      loadAll();
                      return res.approval;
                    } finally {
                      setIsApproving(false);
                    }
                  }}
                  onReject={async (comment: string) => {
                    if (!verifiedShareCode) return;
                    setIsApproving(true);
                    try {
                      const res = await approveLeaveRequest({
                        shareCode: verifiedShareCode.code,
                        employeeId: verifiedShareCode.employeeId || 'EMP-9021',
                        employeeName: 'Sarah Jenkins',
                        category: verifiedShareCode.hrPayload.coarseCategory,
                        validFrom: verifiedShareCode.hrPayload.validFrom,
                        validTo: verifiedShareCode.hrPayload.validTo,
                        approvalDecision: 'REJECTED',
                        approvedBy: currentUser.email,
                        comment,
                      });
                      setLatestApproval(res.approval);
                      setCurrentReceipt(res.receipt as any);
                      loadAll();
                    } finally {
                      setIsApproving(false);
                    }
                  }}
                  isProcessing={isApproving}
                  approvalCompleted={latestApproval}
                  onNextRequest={() => {
                    setVerifiedShareCode(null);
                    setInputCode('');
                    setCurrentReceipt(null);
                    setLatestApproval(null);
                    setCodeStatus('IDLE');
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Tamper-Evident Receipts */}
        {activeTab === 'receipts' && (
          <div className="space-y-6">
            <ReceiptLog receipts={receipts} pendingCount={pendingCount} />
          </div>
        )}

      </div>

      {/* Confirmation Modal */}
      <LeaveConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        application={modalApp}
        mode={modalMode}
        onConfirm={handleExecuteDecision}
      />
    </div>
  );
}

export default function HRPortalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-mono text-xs">Loading HR Portal...</div>}>
      <HRVerifierContent />
    </Suspense>
  );
}
