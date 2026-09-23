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
    <div className="w-full text-slate-900 min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 font-sans" style={{ backgroundColor: '#e8ecf4' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Real-Time Toast Notification for HR decisions */}
        {activeToast && (
          <div className="rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 animate-in fade-in duration-300 text-slate-900" style={{ backgroundColor: '#e8ecf4', boxShadow: '9px 9px 18px #c4cede, -9px -9px 18px #ffffff' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-700" style={{ backgroundColor: '#e8ecf4', boxShadow: '4px 4px 10px #c5cedd, -4px -4px 10px #ffffff' }}>
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-condensed uppercase tracking-wider">
                  {activeToast.title || 'HR Notification'}
                </h4>
                <p className="text-xs text-slate-700 mt-0.5">
                  {activeToast.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismissToast}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-mono transition shadow-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header Strip */}
        <div className="rounded-3xl p-6 transition-all" style={{ backgroundColor: '#e8ecf4', boxShadow: '9px 9px 18px #c4cede, -9px -9px 18px #ffffff' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  PORTAL 1 • WORKER SELF-SERVICE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-600 font-bold" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 2px 2px 5px #c5cedd, inset -2px -2px 5px #ffffff' }}>
                  Private Vault
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-heading uppercase tracking-tight">
                EMPLOYEE PORTAL
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                <span>
                  Logged in as: <strong className="text-slate-900 font-semibold">{currentUser.name}</strong>
                </span>
                <span>•</span>
                <span className="font-mono text-[11px]">{currentUser.email}</span>
                <span>•</span>
                <span className="font-mono text-[11px]">{currentUser.employeeId}</span>
                <span>•</span>
                <span>{currentUser.department}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowApplyModal(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white transition hover:scale-105 active:scale-95 flex items-center gap-2"
                style={{ background: 'linear-gradient(145deg, #059669, #047857)', boxShadow: '5px 5px 12px rgba(5,150,105,0.35), -5px -5px 12px #ffffff' }}
              >
                <Plus className="w-4 h-4" />
                <span>Apply for Leave</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAuditModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-700 transition hover:scale-105 active:scale-95 flex items-center gap-1.5"
                style={{ backgroundColor: '#e8ecf4', boxShadow: '4px 4px 10px #c5cedd, -4px -4px 10px #ffffff' }}
                title="View cryptographically hash-chained audit ledger"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Audit Log</span>
              </button>
            </div>
          </div>

          {/* Mini Status Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-200/50">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff' }}>
              <span className="text-slate-500 block text-[10px] uppercase font-bold font-mono">TOTAL LEAVES</span>
              <span className="text-slate-900 font-black text-base">{applications.length} Requests</span>
            </div>
            <div className="p-3 rounded-2xl" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff' }}>
              <span className="text-slate-500 block text-[10px] uppercase font-bold font-mono">PENDING HR</span>
              <span className="text-amber-700 font-black text-base">{pendingCount} Waiting</span>
            </div>
            <div className="p-3 rounded-2xl" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff' }}>
              <span className="text-slate-500 block text-[10px] uppercase font-bold font-mono">APPROVED</span>
              <span className="text-emerald-700 font-black text-base">{approvedCount}</span>
            </div>
            <div className="p-3 rounded-2xl" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff' }}>
              <span className="text-slate-500 block text-[10px] uppercase font-bold font-mono">CREDENTIALS</span>
              <span className="text-slate-700 font-black text-base">{attestations.length} Verified</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher: 1. Leave Requests & Status, 2. Medical Credentials & Wallet */}
        <div className="p-1.5 rounded-2xl flex gap-2 w-fit" style={{ backgroundColor: '#e6ebf3', boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff' }}>
          <button
            type="button"
            onClick={() => setActiveTab('tracker')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 ${
              activeTab === 'tracker'
                ? 'text-emerald-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            style={activeTab === 'tracker' ? { backgroundColor: '#e8ecf4', boxShadow: '4px 4px 10px #c5cedd, -4px -4px 10px #ffffff' } : undefined}
          >
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>My Leave Requests &amp; Status</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 ${
              activeTab === 'wallet'
                ? 'text-emerald-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            style={activeTab === 'wallet' ? { backgroundColor: '#e8ecf4', boxShadow: '4px 4px 10px #c5cedd, -4px -4px 10px #ffffff' } : undefined}
          >
            <Lock className="w-4 h-4 text-emerald-700" />
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
