'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  ArrowRight, 
} from 'lucide-react';
import { setCurrentUser, TEST_USERS } from '@/lib/storage';

const NEU = {
  raised: {
    backgroundColor: '#e8ecf4',
    boxShadow: '9px 9px 18px #c4cede, -9px -9px 18px #ffffff',
  },
  raisedSm: {
    backgroundColor: '#e8ecf4',
    boxShadow: '5px 5px 12px #c5cedd, -5px -5px 12px #ffffff',
  },
  pressed: {
    backgroundColor: '#e6ebf3',
    boxShadow: 'inset 4px 4px 8px #c5cedd, inset -4px -4px 8px #ffffff',
  },
  convex: {
    background: 'linear-gradient(145deg, #f7faff, #d9e2ee)',
    boxShadow: '8px 8px 16px #c4cede, -8px -8px 16px #ffffff',
  },
  btnEmployee: {
    background: 'linear-gradient(145deg, #059669, #047857)',
    color: '#ffffff',
    boxShadow: '6px 6px 16px rgba(5,150,105,0.35), -6px -6px 14px #ffffff',
  },
  btnHr: {
    background: 'linear-gradient(145deg, #2563eb, #1d4ed8)',
    color: '#ffffff',
    boxShadow: '6px 6px 16px rgba(37,99,235,0.35), -6px -6px 14px #ffffff',
  },
  btnDark: {
    background: 'linear-gradient(145deg, #1e293b, #0f172a)',
    color: '#ffffff',
    boxShadow: '5px 5px 12px #c5cedd, -5px -5px 12px #ffffff',
  },
  textPri: '#192132',
  textSec: '#57657a',
  blue: '#3b82f6',
};

export default function PortalLogin() {
  const router = useRouter();
  const [customEmail, setCustomEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'EMPLOYEE' | 'HR'>('EMPLOYEE');

  const handleLoginAs = (role: 'EMPLOYEE' | 'HR') => {
    const user = role === 'EMPLOYEE' ? TEST_USERS.EMPLOYEE : TEST_USERS.HR;
    setCurrentUser(user);
    router.push(role === 'EMPLOYEE' ? '/employee' : '/hr');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;

    if (selectedRole === 'EMPLOYEE') {
      setCurrentUser({
        email: customEmail,
        name: customEmail.split('@')[0].replace('.', ' '),
        role: 'EMPLOYEE',
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        department: 'General Operations'
      });
      router.push('/employee');
    } else {
      setCurrentUser({
        email: customEmail,
        name: customEmail.split('@')[0].replace('.', ' '),
        role: 'HR',
        department: 'People Operations & Benefits'
      });
      router.push('/hr');
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full space-y-12">
        
        {/* Portal Header */}
        <div className="text-center space-y-4">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold text-blue-600"
            style={NEU.raisedSm}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="tracking-wider uppercase">Dual-Portal Enterprise System</span>
          </div>
          
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tight leading-tight uppercase"
            style={{ color: NEU.textPri }}
          >
            VOUCH PORTAL LOGIN
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
            Select your role to sign into the dedicated portal. Separate interfaces engineered for Employees and HR Benefits Officers.
          </p>
        </div>

        {/* 2 Dedicated Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Employee Portal Card */}
          <div
            className="rounded-3xl p-8 space-y-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]"
            style={NEU.raised}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-600"
                  style={NEU.raisedSm}
                >
                  <UserCheck className="w-7 h-7" />
                </div>
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider"
                  style={NEU.pressed}
                >
                  PORTAL 1
                </span>
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 block">
                  Worker Self-Service
                </span>
                <h2
                  className="text-2xl font-black tracking-tight uppercase mt-1"
                  style={{ color: NEU.textPri }}
                >
                  Employee Portal
                </h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                  Apply for statutory leave in seconds, track real-time HR approval statuses, and protect your diagnosis with zero-knowledge credentials.
                </p>
              </div>

              {/* Test User Badge */}
              <div className="p-4 rounded-2xl space-y-1.5 font-mono text-xs" style={NEU.pressed}>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
                  TEST ACCOUNT
                </span>
                <p className="text-slate-900 font-black text-sm">{TEST_USERS.EMPLOYEE.name}</p>
                <p className="text-emerald-700 font-bold text-xs">{TEST_USERS.EMPLOYEE.email}</p>
                <p className="text-slate-500 text-[11px]">{TEST_USERS.EMPLOYEE.employeeId} • {TEST_USERS.EMPLOYEE.department}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLoginAs('EMPLOYEE')}
              className="w-full py-4 px-5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={NEU.btnEmployee}
            >
              <span>CONTINUE AS EMPLOYEE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* HR Portal Card */}
          <div
            className="rounded-3xl p-8 space-y-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]"
            style={NEU.raised}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600"
                  style={NEU.raisedSm}
                >
                  <Building2 className="w-7 h-7" />
                </div>
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-mono font-bold text-blue-700 uppercase tracking-wider"
                  style={NEU.pressed}
                >
                  PORTAL 2
                </span>
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 block">
                  Benefits Operations
                </span>
                <h2
                  className="text-2xl font-black tracking-tight uppercase mt-1"
                  style={{ color: NEU.textPri }}
                >
                  HR Verifier Portal
                </h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                  Review all employee leave statuses across the company, receive live application alerts, and confirm or decline leaves with full statutory receipts.
                </p>
              </div>

              {/* Test User Badge */}
              <div className="p-4 rounded-2xl space-y-1.5 font-mono text-xs" style={NEU.pressed}>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
                  TEST ACCOUNT
                </span>
                <p className="text-slate-900 font-black text-sm">{TEST_USERS.HR.name}</p>
                <p className="text-blue-700 font-bold text-xs">{TEST_USERS.HR.email}</p>
                <p className="text-slate-500 text-[11px]">Administrator • {TEST_USERS.HR.department}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLoginAs('HR')}
              className="w-full py-4 px-5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={NEU.btnHr}
            >
              <span>CONTINUE AS HR ADMIN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Manual Login Option */}
        <div
          className="rounded-3xl p-7 text-center max-w-xl mx-auto space-y-4"
          style={NEU.raised}
        >
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
            Or Login with Custom Email
          </span>
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 font-mono neu-input"
              />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'EMPLOYEE' | 'HR')}
                className="px-4 py-3 rounded-2xl text-xs text-slate-800 font-mono neu-input cursor-pointer"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR">HR Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              style={NEU.btnDark}
            >
              Sign In to Selected Portal
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
