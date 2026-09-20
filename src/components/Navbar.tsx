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

export default function Navbar() {
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
    { label: 'Employee Portal', href: '/employee', icon: UserCheck, color: 'text-emerald-400' },
    { label: 'HR Portal', href: '/hr', icon: Building2, color: 'text-blue-400' },
    { label: 'Clinic Issuer', href: '/clinic', icon: Stethoscope, color: 'text-teal-400' },
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

  if (pathname === '/') {
    return null;
  }

  const isLoginPage = pathname === '/login';

  return (
    <header className="w-full bg-[#0F172A] border-b border-slate-800 sticky top-0 z-50 select-none shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Header Line */}
        <div className="py-3 flex items-center justify-between border-b border-slate-800">
          <Link href="/login" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-500 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-condensed font-bold text-lg tracking-wider text-white">VOUCH</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                  OFFICIAL PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-tight">
                Statutory Medical Leave Verification System
              </p>
            </div>
          </Link>

          {/* Current User Session & Actions */}
          <div className="flex items-center gap-3">
            {!isLoginPage && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono">
                <span className={`w-2 h-2 rounded-full ${pathname.startsWith('/hr') ? 'bg-blue-400' : pathname.startsWith('/clinic') ? 'bg-teal-400' : 'bg-emerald-400'}`}></span>
                <span className="text-slate-100 font-medium">
                  {currentUser.name}
                </span>
                <span className="text-slate-400">
                  ({currentUser.role === 'HR' ? 'HR Admin' : pathname.startsWith('/clinic') ? 'Clinician' : 'Employee'})
                </span>
              </div>
            )}

            {!isLoginPage && (
              <button
                type="button"
                onClick={handleToggleRole}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition border border-slate-700 shadow-sm"
                title="Switch between Employee and HR portal"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Switch to</span>
                <span>{pathname.startsWith('/employee') ? 'HR Portal' : 'Employee'}</span>
              </button>
            )}

            {!isLoginPage && (
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Logout / Change User"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Reset Demo Button */}
            <button
              onClick={handleResetDemo}
              title="Reset data and restore initial baseline"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-condensed uppercase tracking-wider font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">RESET</span>
            </button>
          </div>
        </div>

        {/* Navigation Tab Line */}
        <div className="flex items-center justify-between py-1">
          <nav className="flex items-center gap-2 sm:gap-4">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-xs font-condensed uppercase tracking-wider font-bold whitespace-nowrap transition-colors ${
                    active
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${link.color}`} />
                  <span>{link.label}</span>
                  {active && (
                    <span className={`absolute bottom-0 left-2 right-2 h-0.5 ${link.href === '/hr' ? 'bg-blue-500' : link.href === '/clinic' ? 'bg-teal-500' : 'bg-emerald-500'}`}></span>
                  )}
                </Link>
              );
            })}
          </nav>
          
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>Role-Based Portal</span>
            <span>•</span>
            <span>Zero-PHI Protocol</span>
          </div>
        </div>

      </div>
    </header>
  );
}
