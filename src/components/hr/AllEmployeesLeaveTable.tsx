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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 font-sans">
      {/* Table Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            <h3 className="text-lg font-bold text-slate-900">
              All Employees Leave Status Roster
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
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
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 font-sans focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 w-48 sm:w-56 shadow-xs"
            />
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster Data Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
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
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500 font-sans">
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
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Employee Name & ID */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-xs">
                        {app.employeeName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {app.employeeId}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3.5 text-slate-600">
                      {app.department || 'General Staff'}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-800">
                        {app.categoryLabel}
                      </span>
                    </td>

                    {/* Date Window */}
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap font-mono">
                      {formatDateRange(app.startDate, app.endDate)}
                    </td>

                    {/* Days */}
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {app.durationDays}d
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isApproved && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Approved
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pending Review
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Declined
                        </span>
                      )}
                    </td>

                    {/* Proof Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {app.proofAttached ? (
                        <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Verified Claim
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-sans">
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
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium transition flex items-center gap-1 shadow-xs"
                            title="Confirm & Approve Leave"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(app)}
                            className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded text-xs font-medium transition flex items-center gap-1 shadow-xs"
                            title="Decline Leave"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
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
