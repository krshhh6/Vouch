'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  getAttestations, 
  getShareCodes, 
  getApprovals, 
  getNotifications, 
  getAuditLogs,
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
  AuditLogEntry 
} from '@/lib/types';
import AttestationWallet from '@/components/employee/AttestationWallet';
import CredentialDetail from '@/components/employee/CredentialDetail';
import ApprovalHistory from '@/components/employee/ApprovalHistory';
import NotificationCenter from '@/components/employee/NotificationCenter';
import ShareCodeModal from '@/components/employee/ShareCodeModal';
import PersonalAuditLogModal from '@/components/employee/PersonalAuditLogModal';
import { Lock, ShieldCheck } from 'lucide-react';

export default function EmployeePortalPage() {
  const [attestations, setAttestations] = useState<SignedAttestation[]>([]);
  const [selectedAttestation, setSelectedAttestation] = useState<SignedAttestation | null>(null);
  const [shareCodes, setShareCodes] = useState<ShareCode[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  
  // Real-time notification toast
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const [dismissedApprovalCard, setDismissedApprovalCard] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);

  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load all local data
  const loadData = () => {
    const attList = getAttestations();
    setAttestations(attList);
    setShareCodes(getShareCodes());
    const appList = getApprovals('EMP-9021');
    setApprovals(appList);
    const notifs = getNotifications('EMP-9021');
    setNotifications(notifs);
    setAuditLogs(getAuditLogs());

    // Check for unread approval toast
    const unreadApproval = notifs.find(n => !n.read && n.type === 'LEAVE_APPROVED');
    if (unreadApproval) {
      setActiveToast(unreadApproval);
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

    // Subscribe to real-time storage & custom events
    const unsubscribe = subscribeToStateChange(() => {
      loadData();
    });

    // Polling interval (every 4 seconds) to catch HR background approvals & notifications
    const interval = setInterval(() => {
      loadData();
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      // Fetch notifications from API route
      try {
        const res = await fetch('/api/notifications?employeeId=EMP-9021');
        if (res.ok) {
          const data = await res.json();
          if (data.notifications && data.notifications.length > 0) {
            // merge if needed
          }
        }
      } catch {
        // Fallback to local storage
      }
      loadData();
      await new Promise(r => setTimeout(r, 400));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDismissToast = () => {
    if (activeToast) {
      markNotificationRead(activeToast.id);
      setActiveToast(null);
    }
  };

  const handleViewToastDetails = (approvalId?: string) => {
    if (activeToast) {
      markNotificationRead(activeToast.id);
      setActiveToast(null);
    }
    if (approvalId) {
      setSelectedApprovalId(approvalId);
      // Smooth scroll to approval history
      const rightCol = document.getElementById('approval-history-col');
      if (rightCol) {
        rightCol.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    loadData();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead('EMP-9021');
    loadData();
  };

  // Find latest share for selected attestation
  const latestShare = selectedAttestation
    ? shareCodes.find(s => s.attestationId === selectedAttestation.payload.attestationId) || null
    : null;

  // Find corresponding approval record
  const currentApproval = selectedAttestation
    ? approvals.find(
        a => (latestShare && a.shareCode === latestShare.code) ||
             (a.category === selectedAttestation.payload.coarseCategory && a.validFrom === selectedAttestation.payload.startDate)
      ) || null
    : null;

  return (
    <div className="w-full bg-[#0F172A] text-slate-100 min-h-[calc(100vh-100px)] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Bar */}
        <div className="border-b border-[#1E293B] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94C3A3]">
                EMPLOYEE PORTAL (/employee)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E293B] text-slate-300 border border-slate-700">
                Self-Sovereign Storage
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-condensed uppercase tracking-wider">
              Your Medical Leave Attestations
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              Credentials stored locally on your device. Generate selective 24-hour verification codes for HR with 0% health data leakage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 bg-[#0B1120] px-3 py-1.5 rounded-lg border border-slate-800 hidden md:inline-block">
              Vault Holder: <strong>Sarah Jenkins (EMP-9021)</strong>
            </span>

            {/* Notification Bell (E8) + Toast Banner (E5) */}
            <NotificationCenter
              notifications={notifications}
              activeToast={activeToast}
              onDismissToast={handleDismissToast}
              onViewToastDetails={handleViewToastDetails}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
            />
          </div>
        </div>

        {/* Main 3-Column Layout: Left (30%), Center (40%), Right (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel (30% / 3.6 cols) - E1 Attestation Wallet */}
          <div className="lg:col-span-4">
            <AttestationWallet
              attestations={attestations}
              selectedAttestation={selectedAttestation}
              onSelectAttestation={(att) => {
                setSelectedAttestation(att);
                setDismissedApprovalCard(false);
              }}
              shareCodes={shareCodes}
              approvals={approvals}
              onRefreshStatus={handleRefreshStatus}
              isRefreshing={isRefreshing}
            />
          </div>

          {/* Center Panel (40% / 4.8 cols) - E2 Credential Details + Leakage Meter + Actions */}
          <div className="lg:col-span-5">
            <CredentialDetail
              attestation={selectedAttestation}
              latestShare={latestShare}
              approval={dismissedApprovalCard ? null : currentApproval}
              onOpenShareModal={() => setShowShareModal(true)}
              onOpenAuditLog={() => setShowAuditModal(true)}
              onDismissApprovalCard={() => setDismissedApprovalCard(true)}
              onViewApprovalDetails={() => {
                if (currentApproval) {
                  setSelectedApprovalId(currentApproval.approvalId);
                }
              }}
            />
          </div>

          {/* Right Panel (30% / 3.6 cols) - E6 Approval History */}
          <div className="lg:col-span-3" id="approval-history-col">
            <ApprovalHistory
              approvals={approvals}
              onSelectApproval={(app) => setSelectedApprovalId(app.approvalId)}
              selectedApprovalId={selectedApprovalId}
            />
          </div>

        </div>

      </div>

      {/* E3. Share Code Modal */}
      <ShareCodeModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        attestation={selectedAttestation}
        onShareCreated={(share) => {
          loadData();
        }}
      />

      {/* E7. Personal Audit Log Modal */}
      <PersonalAuditLogModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        auditLogs={auditLogs}
        selectedAttestation={selectedAttestation}
      />
    </div>
  );
}
