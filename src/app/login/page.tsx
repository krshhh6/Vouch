'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  ArrowRight, 
  Lock, 
  Mail, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { setCurrentUser, TEST_USERS } from '@/lib/storage';

export default function LoginPage() {
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
    <div className="min-h-[calc(100vh-80px)] bg-[#0A101D] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        
        {/* Portal Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111C2E] border border-slate-800 text-xs font-mono font-medium text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dual-Portal Enterprise System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-condensed uppercase tracking-wider">
            VOUCH PORTAL LOGIN
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Select your role to sign into the dedicated portal. Separate interfaces engineered for Employees and HR Benefits Officers.
          </p>
        </div>

        {/* 2 Dedicated Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Employee Portal Card */}
          <div className="bg-[#111C2E] border border-slate-800 hover:border-emerald-500/80 rounded-2xl p-7 shadow-xl space-y-6 flex flex-col justify-between transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-[#0A101D] text-emerald-400 border border-slate-800">
                  PORTAL 1
                </span>
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Worker Self-Service
                </span>
                <h2 className="text-xl font-bold text-white font-condensed uppercase tracking-wider mt-0.5">
                  Employee Portal
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Apply for statutory leave in seconds, track real-time HR approval statuses, and protect your diagnosis with zero-knowledge credentials.
                </p>
              </div>

              {/* Test User Badge */}
              <div className="p-3.5 bg-[#0A101D] border border-slate-800/80 rounded-xl space-y-1 font-mono text-xs">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
                  TEST ACCOUNT
                </span>
                <p className="text-white font-bold">{TEST_USERS.EMPLOYEE.name}</p>
                <p className="text-emerald-400 text-[11px]">{TEST_USERS.EMPLOYEE.email}</p>
                <p className="text-slate-400 text-[10px]">{TEST_USERS.EMPLOYEE.employeeId} • {TEST_USERS.EMPLOYEE.department}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLoginAs('EMPLOYEE')}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>CONTINUE AS EMPLOYEE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* HR Portal Card */}
          <div className="bg-[#111C2E] border border-slate-800 hover:border-blue-500/80 rounded-2xl p-7 shadow-xl space-y-6 flex flex-col justify-between transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-950/50 border border-blue-800/60 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-[#0A101D] text-blue-400 border border-slate-800">
                  PORTAL 2
                </span>
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Benefits Operations
                </span>
                <h2 className="text-xl font-bold text-white font-condensed uppercase tracking-wider mt-0.5">
                  HR Verifier Portal
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Review all employee leave statuses across the company, receive live application alerts, and confirm or decline leaves with full statutory receipts.
                </p>
              </div>

              {/* Test User Badge */}
              <div className="p-3.5 bg-[#0A101D] border border-slate-800/80 rounded-xl space-y-1 font-mono text-xs">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
                  TEST ACCOUNT
                </span>
                <p className="text-white font-bold">{TEST_USERS.HR.name}</p>
                <p className="text-blue-400 text-[11px]">{TEST_USERS.HR.email}</p>
                <p className="text-slate-400 text-[10px]">Administrator • {TEST_USERS.HR.department}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleLoginAs('HR')}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>CONTINUE AS HR ADMIN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Manual Login Option */}
        <div className="bg-[#111C2E]/60 border border-slate-800/80 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-4">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Or Login with Custom Email
          </span>
          <form onSubmit={handleCustomLogin} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[#090F1B] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'EMPLOYEE' | 'HR')}
                className="px-3 py-2.5 bg-[#090F1B] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none font-mono"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR">HR Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold rounded-lg transition"
            >
              Sign In to Selected Portal
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
