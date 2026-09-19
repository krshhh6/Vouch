'use client';

import React, { useState, useEffect } from 'react';
import { 
  getAttestations, 
  getShareCodes, 
  getApprovals, 
  getNotifications, 
  getAuditLogs,
  getLeaveApplications,
  getCurrentUser,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToStateChange,
  seedDemoData
} from '@/lib/storage';
import { 
  SignedAttestation, 
  ShareCode, 
  ApprovalRecord, 
  NotificationItem, 
  AuditLogEntry,
  LeaveApplication,
  UserSession
} from '@/lib/types';
import AttestationWallet from '@/components/employee/AttestationWallet';
import CredentialDetail from '@/components/employee/CredentialDetail';
import NotificationCenter from '@/components/employee/NotificationCenter';
import ShareCodeModal from '@/components/employee/ShareCodeModal';
import PersonalAuditLogModal from '@/components/employee/PersonalAuditLogModal';
import LeaveStatusTracker from '@/components/employee/LeaveStatusTracker';
import ApplyLeaveModal from '@/components/employee/ApplyLeaveModal';
import { 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Bell 
} from 'lucide-react';

export default function EmployeePortalPage() {
  const [currentUser, setCurrentUser] = useState<UserSession>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<'tracker' | 'wallet'>('tracker');

  const [attestations, setAttestations] = useState<SignedAttestation[]>([]);
  const [selectedAttestation, setSelectedAttestation] = useState<SignedAttestation | null>(null);
  const [shareCodes, setShareCodes] = useState<ShareCode[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [applications, setApplications] = useState<LeaveApplication[]>([]);

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Real-time toast
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  const loadData = () => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const attList = getAttestations();
    setAttestations(attList);
    setShareCodes(getShareCodes());
    setApprovals(getApprovals(user.employeeId || 'EMP-9021'));
    
    const notifs = getNotifications(user.employeeId || 'EMP-9021');
    setNotifications(notifs);
    setAuditLogs(getAuditLogs());

    const apps = getLeaveApplications(user.employeeId || 'EMP-9021');
    setApplications(apps);

    // Toast alert for unread approvals
    const unread = notifs.find(n => !n.read && (n.type === 'LEAVE_APPROVED' || n.type === 'LEAVE_REJECTED'));
    if (unread) {
      setActiveToast(unread);
    }

    if (!selectedAttestation && attList.length > 0) {
      setSelectedAttestation(attList[0]);
    } else if (selectedAttestation) {
      const refreshed = attList.find(a => a.payload.attestationId === selectedAttestation.payload.attestationId);
      if (refreshed) setSelectedAttestation(refreshed);
    }
  };

  useEffect(() => {
    seedDemoData();
    loadData();

    const unsubscribe = subscribeToStateChange(() => {
      loadData();
    });

    const interval = setInterval(() => {
      loadData();
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleDismissToast = () => {
    if (activeToast) {
      markNotificationRead(activeToast.id);
      setActiveToast(null);
    }
  };

  const handleApplicationSubmitted = (app: LeaveApplication) => {
    loadData();
    setActiveTab('tracker');
  };

  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;

  return (
    <div className="w-full bg-[#0A101D] text-slate-100 min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Real-Time Toast Notification for HR decisions */}
        {activeToast && (
          <div className="bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-condensed uppercase tracking-wider">
                  {activeToast.title || 'HR Notification'}
                </h4>
                <p className="text-xs text-emerald-100 mt-0.5">
                  {activeToast.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismissToast}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-mono transition"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header Strip */}
        <div className="bg-[#111C2E] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  PORTAL 1 • WORKER SELF-SERVICE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Private Vault
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-condensed uppercase tracking-wider">
                EMPLOYEE PORTAL
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-2 font-mono">
                <span>
                  Logged in as: <strong className="text-white">{currentUser.name}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400">
                  ID: {currentUser.employeeId || 'EMP-9021'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{currentUser.department}</span>
              </div>
            </div>

            {/* Quick Apply Button */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowApplyModal(true)}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Apply For Leave</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs font-mono">
            <div className="p-3 bg-[#0A101D] border border-slate-800 rounded-xl">
              <span className="text-slate-500 block text-[10px]">TOTAL REQUESTS</span>
              <span className="text-white font-bold text-base">{applications.length}</span>
            </div>
            <div className="p-3 bg-[#0A101D] border border-slate-800 rounded-xl">
              <span className="text-amber-400 block text-[10px]">PENDING HR</span>
              <span className="text-amber-400 font-bold text-base">{pendingCount}</span>
            </div>
            <div className="p-3 bg-[#0A101D] border border-slate-800 rounded-xl">
              <span className="text-emerald-400 block text-[10px]">APPROVED LEAVES</span>
              <span className="text-emerald-400 font-bold text-base">{approvedCount}</span>
            </div>
            <div className="p-3 bg-[#0A101D] border border-slate-800 rounded-xl">
              <span className="text-slate-500 block text-[10px]">CREDENTIALS</span>
              <span className="text-slate-300 font-bold text-base">{attestations.length} Verified</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher: 1. Leave Requests & Status, 2. Medical Credentials & Wallet */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('tracker')}
            className={`px-5 py-3 text-xs font-condensed uppercase tracking-wider font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'tracker'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>My Leave Requests &amp; Status</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className={`px-5 py-3 text-xs font-condensed uppercase tracking-wider font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'wallet'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Doctor Credentials &amp; Wallet</span>
          </button>
        </div>

        {/* Tab 1 Content: Leave Status Tracker */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            <LeaveStatusTracker
              applications={applications}
              onOpenApplyModal={() => setShowApplyModal(true)}
            />
          </div>
        )}

        {/* Tab 2 Content: Medical Credential Wallet */}
        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <AttestationWallet
                attestations={attestations}
                selectedAttestation={selectedAttestation}
                onSelectAttestation={(att) => setSelectedAttestation(att)}
                shareCodes={shareCodes}
                approvals={approvals}
                onRefreshStatus={loadData}
              />
            </div>

            <div className="lg:col-span-7">
              {selectedAttestation ? (
                <CredentialDetail
                  attestation={selectedAttestation}
                  latestShare={shareCodes.length > 0 ? shareCodes[0] : null}
                  approval={approvals.length > 0 ? approvals[0] : null}
                  onOpenShareModal={() => setShowShareModal(true)}
                  onOpenAuditLog={() => setShowAuditModal(true)}
                />
              ) : (
                <div className="p-8 bg-[#111C2E] border border-slate-800 rounded-xl text-center text-slate-500 text-xs font-mono">
                  Select a credential on the left to view details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notification Center */}
        <NotificationCenter
          notifications={notifications}
          activeToast={activeToast}
          onDismissToast={handleDismissToast}
          onViewToastDetails={() => {
            setActiveTab('tracker');
            handleDismissToast();
          }}
          onMarkRead={markNotificationRead}
          onMarkAllRead={() => markAllNotificationsRead(currentUser.employeeId || 'EMP-9021')}
        />

      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        currentUser={currentUser}
        attestations={attestations}
        onSubmitted={handleApplicationSubmitted}
      />

      {/* Share Code Modal */}
      <ShareCodeModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        attestation={selectedAttestation}
        onShareCreated={loadData}
      />

      {/* Audit Log Modal */}
      <PersonalAuditLogModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        auditLogs={auditLogs}
        selectedAttestation={selectedAttestation}
      />

    </div>
  );
}
