'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import DemoSection from '@/components/landing/DemoSection';
import PortalLogin from '@/components/PortalLogin';
import Footer from '@/components/landing/Footer';
import { 
  UserCheck, 
  Building2, 
  Stethoscope, 
  ArrowUp, 
  LogIn, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

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
    boxShadow: 'inset 3px 3px 6px #c5cedd, inset -3px -3px 6px #ffffff',
  },
  accentBtn: {
    background: 'linear-gradient(145deg, #3b82f6, #2563eb)',
    color: '#ffffff',
    boxShadow: '6px 6px 16px rgba(37,99,235,0.35), -6px -6px 14px #ffffff',
  },
};

export default function HomePage() {
  const [showQuickDock, setShowQuickDock] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowQuickDock(true);
      } else {
        setShowQuickDock(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#e8ecf4] text-[#192132] font-sans selection:bg-blue-200 selection:text-blue-900 flex flex-col">
      
      {/* 1. Neumorphic Floating Navigation Bar */}
      <Header />

      {/* Main Neumorphic Experience Flow */}
      <main className="flex-1 w-full space-y-4">
        
        {/* 2. Hero: Physical Cryptographic Console & Rotary Dial */}
        <HeroSection />

        {/* 3. 4 Pillars of Neumorphic Privacy (01 - 04) */}
        <div id="pillars" className="border-t border-slate-200/50">
          <FeaturesSection />
        </div>

        {/* 4. Protocol Flow: 3 Roles & Zero-Knowledge Boundary Matrix */}
        <div id="how-it-works" className="border-t border-slate-200/50">
          <HowItWorksSection />
        </div>

        {/* 5. Live Cryptographic Verifier Simulator */}
        <div id="demo" className="border-t border-slate-200/50">
          <DemoSection />
        </div>

        {/* 6. Dedicated Neumorphic Portal Login (Worker & HR Cards) */}
        <section id="portal-login" className="py-14 sm:py-20 border-t border-slate-200/50 bg-[#e8ecf4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <PortalLogin />
          </div>
        </section>

      </main>

      {/* 7. Joni Ive Quote Card & Neumorphic Compliance Footer */}
      <Footer />

      {/* 8. Pure Neumorphic Floating Quick-Dock */}
      <aside
        aria-label="Quick Access Dock"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${
          showQuickDock ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        }`}
      >
        <div 
          className="flex items-center gap-2 p-2 rounded-2xl select-none"
          style={NEU.raised}
        >
          <button
            onClick={scrollToTop}
            title="Scroll to Top"
            className="p-2.5 rounded-xl text-slate-500 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono font-bold"
            style={NEU.raisedSm}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TOP</span>
          </button>

          <div className="w-px h-5 bg-slate-300/80 mx-0.5"></div>

          <Link
            href="/employee"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            style={NEU.raisedSm}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>EMPLOYEE</span>
          </Link>

          <Link
            href="/hr"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold text-blue-700 hover:text-blue-800 transition-colors"
            style={NEU.raisedSm}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>HR VERIFIER</span>
          </Link>

          <Link
            href="/clinic"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold text-teal-700 hover:text-teal-800 transition-colors"
            style={NEU.raisedSm}
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>CLINIC</span>
          </Link>

          <button
            onClick={() => scrollToSection('portal-login')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white transition-all cursor-pointer hover:scale-105"
            style={NEU.accentBtn}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>PORTAL LOGIN</span>
          </button>
        </div>
      </aside>

    </div>
  );
}
