'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ShieldCheck, 
  ArrowUpDown, 
  MessageSquare,
  Check,
  X
} from 'lucide-react';
import { LeaveApplication } from '@/lib/types';

interface AllEmployeesLeaveTableProps {
  applications: LeaveApplication[];
  onApprove: (app: LeaveApplication) => void;
  onReject: (app: LeaveApplication) => void;
}

export default function AllEmployeesLeaveTable({
  applications,
  onApprove,
  onReject,
}: AllEmployeesLeaveTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const filtered = applications.filter((app) => {
    // Status filter
    if (statusFilter !== 'ALL' && app.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.employeeName.toLowerCase().includes(q);
      const matchId = app.employeeId.toLowerCase().includes(q);
      const matchDept = (app.department || '').toLowerCase().includes(q);
      const matchCat = app.categoryLabel.toLowerCase().includes(q);
      return matchName || matchId || matchDept || matchCat;
    }
    return true;
  });

  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const startFmt = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endFmt = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${startFmt} – ${endFmt}`;
    } catch {
      return `${startStr} – ${endStr}`;
    }
  };

  return (
    <div className="bg-[#111C2E] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 font-sans">
      {/* Table Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold font-condensed uppercase tracking-wider text-white">
              All Employees Leave Status Roster
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Enterprise roster tracking leave eligibility, duration, and review status for all employees.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search employee, dept, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#090F1B] border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 w-48 sm:w-56"
            />
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex items-center bg-[#090F1B] border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster Data Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#090F1B] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Leave Category</th>
              <th className="px-4 py-3">Leave Window</th>
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Proof</th>
              <th className="px-4 py-3 text-right">Confirmation Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  No employee leave records matching your filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((app) => {
                const isPending = app.status === 'PENDING';
                const isApproved = app.status === 'APPROVED';
                const isRejected = app.status === 'REJECTED';

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-[#0E1726] transition-colors"
                  >
                    {/* Employee Name & ID */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white">
                        {app.employeeName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {app.employeeId}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3.5 text-slate-300">
                      {app.department || 'General Staff'}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-200">
                        {app.categoryLabel}
                      </span>
                    </td>

                    {/* Date Window */}
                    <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                      {formatDateRange(app.startDate, app.endDate)}
                    </td>

                    {/* Days */}
                    <td className="px-4 py-3.5 font-bold text-slate-200">
                      {app.durationDays}d
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isApproved && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          APPROVED
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/80 inline-flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-400" />
                          PENDING
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-700/80 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-400" />
                          DECLINED
                        </span>
                      )}
                    </td>

                    {/* Proof Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {app.proofAttached ? (
                        <span className="text-[10px] text-emerald-400 font-mono inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Verified Claim
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Self-Declared
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {isPending ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onApprove(app)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1 shadow-sm"
                            title="Confirm & Approve Leave"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(app)}
                            className="px-2 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 rounded text-[10px] transition flex items-center gap-1"
                            title="Decline Leave"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          {app.reviewedBy ? `Reviewed by ${app.reviewedBy.split('@')[0]}` : 'Completed'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
