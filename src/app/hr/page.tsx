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
    <div className="w-full text-slate-900 min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 font-sans" style={{ backgroundColor: '#e8ecf4' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Strip */}
        <div className="rounded-3xl p-6 transition-all" style={{ backgroundColor: '#e8ecf4', boxShadow: '9px 9px 18px #c4cede, -9px -9px 18px #ffffff' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Portal 2 • HR Enterprise Benefits
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-slate-600" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 2px 2px 5px #c5cedd, inset -2px -2px 5px #ffffff' }}>
                  Zero-PHI Verifier
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-heading uppercase tracking-tight">
                HR Benefits Verification Portal
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                <span>
                  Logged in as: <strong className="text-slate-900 font-semibold">{currentUser.name}</strong>
                </span>
                <span>•</span>
                <span>{currentUser.department || 'People Operations & Benefits'}</span>
                <span>•</span>
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Statutory Rule: <span className="font-mono text-[11px] font-bold">{VOUCH_POLICY_SPEC.policyVersion}</span>
                </span>
              </div>
            </div>
          </div>

          {/* KPI Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-200/50 text-xs font-mono">
            <div className="p-3.5 rounded-2xl" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff' }}>
              <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">ALL LEAVE REQUESTS</span>
              <span className="text-slate-900 font-black text-lg">{applications.length} Roster</span>
            </div>
            <div className="p-3.5 rounded-2xl" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff' }}>
              <span className="text-amber-800 block text-[10px] font-bold uppercase tracking-wider">PENDING CONFIRMATIONS</span>
              <span className="text-amber-900 font-black text-lg">{pendingCount} Action Required</span>
            </div>
            <div className="p-3.5 rounded-2xl" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff' }}>
              <span className="text-emerald-800 block text-[10px] font-bold uppercase tracking-wider">CONFIRMED &amp; APPROVED</span>
              <span className="text-emerald-900 font-black text-lg">{approvedCount} Active</span>
            </div>
            <div className="p-3.5 rounded-2xl" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff' }}>
              <span className="text-blue-800 block text-[10px] font-bold uppercase tracking-wider">ZERO-PHI COMPLIANCE</span>
              <span className="text-blue-900 font-black text-lg">100% Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="p-1.5 rounded-2xl flex gap-2 overflow-x-auto w-fit" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff' }}>
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'roster'
                ? 'text-blue-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            style={activeTab === 'roster' ? { backgroundColor: '#e8ecf4', boxShadow: '4px 4px 10px #c5cedd, -4px -4px 10px #ffffff' } : undefined}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>All Employees Leave Status Roster</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('desk')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'desk'
                ? 'text-blue-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            style={activeTab === 'desk' ? { backgroundColor: '#e8ecf4', boxShadow: '4px 4px 10px #c5cedd, -4px -4px 10px #ffffff' } : undefined}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Single Code Verification Desk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('receipts')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'receipts'
                ? 'text-blue-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            style={activeTab === 'receipts' ? { backgroundColor: '#e8ecf4', boxShadow: '4px 4px 10px #c5cedd, -4px -4px 10px #ffffff' } : undefined}
          >
            <FileCheck className="w-4 h-4 text-blue-600" />
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
