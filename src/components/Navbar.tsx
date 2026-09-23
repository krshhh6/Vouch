'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  RotateCcw, 
  UserCheck, 
  Building2, 
  ArrowLeftRight, 
  LogOut,
  Stethoscope
} from 'lucide-react';
import { 
  resetDemoData, 
  getCurrentUser, 
  setCurrentUser, 
  TEST_USERS, 
  subscribeToStateChange 
} from '@/lib/storage';
import { UserSession } from '@/lib/types';

const NEU = {
  raised: {
    backgroundColor: '#e8ecf4',
    boxShadow: '9px 9px 18px #c4cede, -9px -9px 18px #ffffff',
  },
  raisedSm: {
    backgroundColor: '#e8ecf4',
    boxShadow: '4px 4px 10px #c5cedd, -4px -4px 10px #ffffff',
  },
  pressed: {
    backgroundColor: '#e6ebf3',
    boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff',
  },
  pressedDeep: {
    backgroundColor: '#e2e8f1',
    boxShadow: 'inset 4px 4px 8px #bfc9d8, inset -4px -4px 8px #ffffff',
  },
  textPri: '#192132',
  textSec: '#57657a',
  blue: '#3b82f6',
};

export default function Navbar({ forceVisible = false }: { forceVisible?: boolean } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setSessionUser] = useState<UserSession>(TEST_USERS.EMPLOYEE);

  useEffect(() => {
    setSessionUser(getCurrentUser());
    const unsub = subscribeToStateChange(() => {
      setSessionUser(getCurrentUser());
    });
    return () => unsub();
  }, []);

  // Update session based on pathname
  useEffect(() => {
    if (pathname.startsWith('/employee')) {
      const user = { ...TEST_USERS.EMPLOYEE };
      setCurrentUser(user);
      setSessionUser(user);
    } else if (pathname.startsWith('/hr')) {
      const user = { ...TEST_USERS.HR };
      setCurrentUser(user);
      setSessionUser(user);
    }
  }, [pathname]);

  const navLinks = [
    { label: 'Employee Portal', href: '/employee', icon: UserCheck, color: 'text-emerald-600' },
    { label: 'HR Portal', href: '/hr', icon: Building2, color: 'text-blue-600' },
    { label: 'Clinic Issuer', href: '/clinic', icon: Stethoscope, color: 'text-teal-600' },
  ];

  const isActive = (href: string) => {
    if (href === '/employee') return pathname.startsWith('/employee');
    if (href === '/hr') return pathname.startsWith('/hr');
    if (href === '/clinic') return pathname.startsWith('/clinic');
    return pathname === href;
  };

  const handleToggleRole = () => {
    if (pathname.startsWith('/employee')) {
      setCurrentUser(TEST_USERS.HR);
      router.push('/hr');
    } else {
      setCurrentUser(TEST_USERS.EMPLOYEE);
      router.push('/employee');
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const handleResetDemo = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      resetDemoData();
      router.push('/login');
      setTimeout(() => {
        window.location.reload();
      }, 50);
    }
  };

  if (pathname === '/' && !forceVisible) {
    return null;
  }

  const isLoginPage = pathname === '/login';

  return (
    <header className="w-full py-2.5 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 select-none transition-all duration-200">
      <div
        className="max-w-7xl mx-auto rounded-3xl p-3 sm:px-6 space-y-2.5"
        style={NEU.raised}
      >
        {/* Brand & Actions Line */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
          <Link href="/" className="flex items-center gap-3 group" title="Return to Vouch Home Landing Page">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-blue-600 transition-all group-hover:scale-105"
              style={NEU.raisedSm}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="font-heading font-extrabold text-lg tracking-tight"
                  style={{ color: NEU.textPri }}
                >
                  VOUCH
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-blue-600 uppercase"
                  style={NEU.pressed}
                >
                  OFFICIAL PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal leading-tight">
                Statutory Medical Leave Verification System
              </p>
            </div>
          </Link>

          {/* User Session & Role Switches */}
          <div className="flex items-center gap-2.5">
            {!isLoginPage && (
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-700"
                style={NEU.pressed}
              >
                <span className={`w-2 h-2 rounded-full ${pathname.startsWith('/hr') ? 'bg-blue-500' : pathname.startsWith('/clinic') ? 'bg-teal-500' : 'bg-emerald-500'}`}></span>
                <span className="font-semibold text-slate-800">
                  {currentUser.name}
                </span>
                <span className="text-slate-500 text-[11px]">
                  ({currentUser.role === 'HR' ? 'HR Admin' : pathname.startsWith('/clinic') ? 'Clinician' : 'Employee'})
                </span>
              </div>
            )}

            {!isLoginPage && (
              <button
                type="button"
                onClick={handleToggleRole}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 transition hover:scale-105 active:scale-95"
                style={NEU.raisedSm}
                title="Switch between Employee and HR portal"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Switch to</span>
                <span>{pathname.startsWith('/employee') ? 'HR Portal' : 'Employee'}</span>
              </button>
            )}

            {!isLoginPage && (
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-xl transition hover:scale-105 active:scale-95"
                style={NEU.raisedSm}
                title="Logout / Change User"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Neumorphic Reset Button */}
            <button
              onClick={handleResetDemo}
              title="Reset data and restore initial baseline"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 transition hover:scale-105 active:scale-95"
              style={NEU.raisedSm}
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>RESET</span>
            </button>
          </div>
        </div>

        {/* Navigation Tab Bar */}
        <div className="flex items-center justify-between">
          <nav
            className="flex items-center gap-1.5 p-1 rounded-2xl overflow-x-auto"
            style={NEU.pressed}
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                    active
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  style={active ? NEU.raisedSm : undefined}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-blue-600' : link.color}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="hidden md:flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-1 rounded-xl" style={NEU.pressed}>
            <span>Role-Based Portal</span>
            <span>•</span>
            <span className="text-blue-600 font-bold">Zero-PHI Protocol</span>
          </div>
        </div>

      </div>
    </header>
  );
}
