'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  ArrowRight, 
  Stethoscope, 
  Lock, 
  ChevronDown,
  Sparkles,
  Zap
} from 'lucide-react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const DigitalSerenity: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseGradientStyle, setMouseGradientStyle] = useState({
    left: '0px',
    top: '0px',
    opacity: 0,
  });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const floatingElementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const animateWords = () => {
      const wordElements = document.querySelectorAll<HTMLElement>('.word-animate');
      wordElements.forEach(word => {
        const delay = parseInt(word.getAttribute('data-delay') || '0', 10);
        setTimeout(() => {
          if (word) word.style.animation = 'word-appear 0.8s ease-out forwards';
        }, delay);
      });
    };
    const timeoutId = setTimeout(animateWords, 350);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right
      ) {
        setMouseGradientStyle({
          left: `${e.clientX}px`,
          top: `${e.clientY}px`,
          opacity: 1,
        });
      } else {
        setMouseGradientStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };
    const handleMouseLeave = () => {
      setMouseGradientStyle(prev => ({ ...prev, opacity: 0 }));
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current || !containerRef.current.contains(e.target as Node)) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRipple: Ripple = { 
        id: Date.now(), 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 1000);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  useEffect(() => {
    const wordElements = document.querySelectorAll<HTMLElement>('.word-animate');
    const handleMouseEnter = (e: Event) => { 
      const target = e.target as HTMLElement | null;
      if (target) target.style.textShadow = '0 0 24px rgba(96, 165, 250, 0.7)'; 
    };
    const handleMouseLeave = (e: Event) => { 
      const target = e.target as HTMLElement | null;
      if (target) target.style.textShadow = 'none'; 
    };
    wordElements.forEach(word => {
      word.addEventListener('mouseenter', handleMouseEnter);
      word.addEventListener('mouseleave', handleMouseLeave);
    });
    return () => {
      wordElements.forEach(word => {
        if (word) {
          word.removeEventListener('mouseenter', handleMouseEnter);
          word.removeEventListener('mouseleave', handleMouseLeave);
        }
      });
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.floating-element-animate');
    floatingElementsRef.current = Array.from(elements);
    const handleScroll = () => {
      if (!scrolled) {
        setScrolled(true);
        floatingElementsRef.current.forEach((el, index) => {
          setTimeout(() => {
            if (el) {
              el.style.animationPlayState = 'running';
              el.style.opacity = ''; 
            }
          }, (parseFloat(el.style.animationDelay || "0") * 1000) + index * 100);
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-slate-900 text-slate-100 font-sans overflow-hidden relative select-none flex flex-col justify-between"
    >
      {/* Background Interactive SVG Grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <pattern id="gridReactDarkResponsive" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridReactDarkResponsive)" />
        <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: '0.5s' }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: '1s' }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: '1.5s' }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: '2s' }} />
        <line x1="50%" y1="0" x2="50%" y2="100%" className="grid-line" style={{ animationDelay: '2.5s', opacity: '0.08' }} />
        <line x1="0" y1="50%" x2="100%" y2="50%" className="grid-line" style={{ animationDelay: '3s', opacity: '0.08' }} />
        <circle cx="20%" cy="20%" r="2.5" className="detail-dot" style={{ animationDelay: '3s' }} />
        <circle cx="80%" cy="20%" r="2.5" className="detail-dot" style={{ animationDelay: '3.2s' }} />
        <circle cx="20%" cy="80%" r="2.5" className="detail-dot" style={{ animationDelay: '3.4s' }} />
        <circle cx="80%" cy="80%" r="2.5" className="detail-dot" style={{ animationDelay: '3.6s' }} />
        <circle cx="50%" cy="50%" r="2" className="detail-dot" style={{ animationDelay: '4s' }} />
      </svg>

      {/* Responsive Floating Background Particles */}
      <div className="floating-element-animate" style={{ top: '25%', left: '15%', animationDelay: '0.5s' }}></div>
      <div className="floating-element-animate" style={{ top: '60%', left: '85%', animationDelay: '1s' }}></div>
      <div className="floating-element-animate" style={{ top: '40%', left: '10%', animationDelay: '1.5s' }}></div>
      <div className="floating-element-animate" style={{ top: '75%', left: '90%', animationDelay: '2s' }}></div>

      {/* TOP GLASSPROOF HEADER NAVIGATION */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center justify-between py-3 px-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl">
          
          {/* Logo & Protocol Badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-wider text-white">VOUCH</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50">
                  ZERO-PHI VERIFIED
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Shortcuts */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-300">
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Protocol Flow
            </button>
            <button 
              onClick={() => scrollToSection('live-demo')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Live Verifier Demo
            </button>
            <button 
              onClick={() => scrollToSection('portal-login')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Portals
            </button>
          </nav>

          {/* Quick Direct CTA */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => scrollToSection('portal-login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-slate-200 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 hover:border-blue-400 transition-all hover:scale-105 cursor-pointer shadow-lg shadow-blue-500/10"
            >
              <span>Launch Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>

        </div>
      </header>

      {/* CENTRAL HERO CONTENT & CALLS TO ACTION */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 max-w-5xl mx-auto w-full text-center">
        
        {/* Eyebrow Protocol Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium text-slate-300 bg-slate-900/80 border border-slate-800 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="uppercase tracking-widest text-[11px] text-slate-300">
            Zero-Knowledge Selective Disclosure Protocol
          </span>
        </div>

        {/* Animated Central Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight leading-tight tracking-tight text-slate-50 text-decoration-animate max-w-4xl mx-auto">
          <div className="mb-2 md:mb-4">
            <span className="word-animate font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-200" data-delay="600">
              Mathematical
            </span>
            <span className="word-animate font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400" data-delay="800">
              Certainty.
            </span>
          </div>
          <div className="text-lg sm:text-2xl md:text-3xl font-thin text-slate-300 leading-relaxed tracking-wide mt-3 max-w-3xl mx-auto">
            <span className="word-animate" data-delay="1100">Prove</span>
            <span className="word-animate" data-delay="1200">statutory</span>
            <span className="word-animate" data-delay="1300">leave</span>
            <span className="word-animate" data-delay="1400">eligibility</span>
            <span className="word-animate" data-delay="1500">without</span>
            <span className="word-animate" data-delay="1600">exposing</span>
            <span className="word-animate" data-delay="1700">sensitive</span>
            <span className="word-animate" data-delay="1800">clinical</span>
            <span className="word-animate" data-delay="1900">diagnoses.</span>
          </div>
        </h1>

        {/* Actionable Hero Buttons — Immediate 1-Click Access */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5 w-full max-w-md">
          <Link
            href="/employee"
            className="flex-1 min-w-[190px] py-3 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40 shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <UserCheck className="w-4 h-4 text-emerald-200" />
            <span>Employee Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/hr"
            className="flex-1 min-w-[190px] py-3 px-4 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/40 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <Building2 className="w-4 h-4 text-blue-200" />
            <span>HR Verifier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Live Cryptographic Metrics Pill Strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>0.0% PHI Leakage</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>ECDSA P-256 Web Crypto</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>Neon Lakebase Ledger</span>
          </div>
        </div>

      </main>

      {/* BOTTOM SCROLL INDICATOR */}
      <footer className="relative z-30 pb-6 text-center">
        <button
          onClick={() => scrollToSection('how-it-works')}
          aria-label="Scroll to explore protocol"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono tracking-widest uppercase text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-800 border border-slate-800/80 transition-all hover:scale-105 cursor-pointer group"
        >
          <span>Explore Protocol Flow</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white animate-bounce" />
        </button>
      </footer>

      {/* Interactive Mouse Gradient */}
      <div 
        id="mouse-gradient-react"
        className="w-60 h-60 blur-xl sm:w-80 sm:h-80 sm:blur-2xl md:w-96 md:h-96 md:blur-3xl"
        style={{
          left: mouseGradientStyle.left,
          top: mouseGradientStyle.top,
          opacity: mouseGradientStyle.opacity,
        }}
      ></div>

      {/* Interactive Click Ripples */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="ripple-effect"
          style={{ left: `${ripple.x}px`, top: `${ripple.y}px` }}
        ></div>
      ))}
    </div>
  );
};

export default DigitalSerenity;
