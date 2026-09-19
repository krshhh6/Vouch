'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Clock, X, Eye, Check } from 'lucide-react';
import { NotificationItem } from '@/lib/types';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  activeToast: NotificationItem | null;
  onDismissToast: () => void;
  onViewToastDetails: (approvalId?: string) => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationCenter({
  notifications,
  activeToast,
  onDismissToast,
  onViewToastDetails,
  onMarkRead,
  onMarkAllRead,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Real-time Top Toast Banner (E5) */}
      {activeToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-[#0B1120] border-2 border-[#4A7C59] text-white p-4 rounded-xl shadow-2xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#142319] border border-[#284230] flex items-center justify-center text-[#94C3A3] shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#94C3A3] uppercase tracking-wide font-condensed">
                    {activeToast.title || '✓ Leave approved!'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#142319] text-[#94C3A3] rounded border border-[#284230]">
                    Live HR Update
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  {activeToast.message || `Your leave request (${activeToast.validFrom} – ${activeToast.validTo}) has been approved by HR.`}
                </p>
                <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-2 pt-0.5">
                  <span>Approval ID: <strong className="text-white font-mono">{activeToast.approvalId || 'APR-2026-004521'}</strong></span>
                  <span>•</span>
                  <span>Approved: {new Date(activeToast.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(activeToast.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => onViewToastDetails(activeToast.approvalId)}
                className="px-3 py-1.5 rounded text-xs font-condensed font-bold uppercase tracking-wider bg-[#4A7C59] hover:bg-[#3D6649] text-white transition-colors"
              >
                VIEW DETAILS
              </button>
              <button
                type="button"
                onClick={onDismissToast}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Notification Bell Trigger (E8) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 text-xs font-mono transition-colors"
        title="View Notifications"
      >
        <div className="relative">
          <Bell className="w-4 h-4 text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="font-condensed uppercase tracking-wider text-xs hidden sm:inline">
          Notification bell: <strong>{unreadCount}</strong>
        </span>
      </button>

      {/* Notification Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0B1120] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3.5 border-b border-[#1E293B] flex items-center justify-between bg-[#0F172A]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#94C3A3]" />
              <span className="text-xs font-bold text-white uppercase font-condensed tracking-wider">
                Notifications ({notifications.length})
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-[10px] text-[#94C3A3] hover:underline font-mono"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#1E293B] p-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-sans">
                No notifications received yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg text-xs space-y-1 transition-colors ${
                    !n.read ? 'bg-[#142319]/40 border-l-2 border-[#4A7C59]' : 'hover:bg-[#0F172A]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white font-condensed tracking-wide flex items-center gap-1.5">
                      {n.type === 'LEAVE_APPROVED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#94C3A3]" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      {n.title || (n.type === 'LEAVE_APPROVED' ? 'Leave Approved' : 'Notification')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-snug">
                    {n.message}
                  </p>
                  {n.approvalId && (
                    <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                      <span>Approval: <strong className="text-white">{n.approvalId}</strong></span>
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => onMarkRead(n.id)}
                          className="text-[#94C3A3] hover:underline flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Mark read
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
