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
          <div className="bg-white border-2 border-emerald-600 text-slate-900 p-4 rounded-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-emerald-800 tracking-tight font-sans">
                    {activeToast.title || 'Leave approved!'}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                    Live HR Update
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-sans leading-relaxed">
                  {activeToast.message || `Your leave request (${activeToast.validFrom} – ${activeToast.validTo}) has been approved by HR.`}
                </p>
                <div className="text-xs font-mono text-slate-500 flex flex-wrap gap-2 pt-0.5">
                  <span>Approval ID: <strong className="text-slate-900 font-mono">{activeToast.approvalId || 'APR-2026-004521'}</strong></span>
                  <span>•</span>
                  <span>Approved: {new Date(activeToast.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(activeToast.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => onViewToastDetails(activeToast.approvalId)}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-xs"
              >
                View Details
              </button>
              <button
                type="button"
                onClick={onDismissToast}
                className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition-colors shadow-xs"
        title="View Notifications"
      >
        <div className="relative">
          <Bell className="w-4 h-4 text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
          Notifications: <strong>{unreadCount}</strong>
        </span>
      </button>

      {/* Notification Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-700" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Notifications ({notifications.length})
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-xs text-blue-700 hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-sans">
                No notifications received yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg text-xs space-y-1 transition-colors ${
                    !n.read ? 'bg-blue-50/60 border-l-2 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                      {n.type === 'LEAVE_APPROVED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      {n.title || (n.type === 'LEAVE_APPROVED' ? 'Leave Approved' : 'Notification')}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-sans leading-snug">
                    {n.message}
                  </p>
                  {n.approvalId && (
                    <div className="flex items-center justify-between pt-1 text-xs font-mono text-slate-500">
                      <span>Approval: <strong className="text-slate-800">{n.approvalId}</strong></span>
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => onMarkRead(n.id)}
                          className="text-blue-700 hover:underline flex items-center gap-1 font-medium"
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
