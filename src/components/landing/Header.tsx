'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';

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
  accentBtn: {
    background: 'linear-gradient(145deg, #3b82f6, #2563eb)',
    color: '#ffffff',
    boxShadow: '6px 6px 16px rgba(37,99,235,0.35), -6px -6px 14px #ffffff',
  },
  textPri: '#192132',
  blue: '#3b82f6',
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Pillars', href: '#pillars' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Live Demo', href: '#demo' },
    { label: 'Portals', href: '#portal-login' },
  ];

  return (
    <header className="sticky top-0 z-50 py-3 px-4 sm:px-8 transition-all duration-200">
      <div
        className="max-w-7xl mx-auto rounded-3xl px-5 sm:px-8 flex items-center justify-between h-16"
        style={NEU.raised}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200"
            style={NEU.raisedSm}
          >
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="font-heading font-extrabold text-xl tracking-tight"
              style={{ color: NEU.textPri }}
            >
              VOUCH
            </span>
            <span
              className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold"
              style={{
                color: '#059669',
                ...NEU.pressed,
              }}
            >
              ZERO-PHI PROTOCOL
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden md:flex items-center gap-2 p-1.5 rounded-2xl"
          style={NEU.pressed}
        >
          {navLinks.map((link) => {
            const isActive = activeTab === link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActiveTab(link.label)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                style={isActive ? NEU.raisedSm : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#portal-login"
            className="text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-2xl transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={NEU.accentBtn}
          >
            <span>Launch Portals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2.5 rounded-xl transition-all"
          style={NEU.raisedSm}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden mt-3 p-5 rounded-3xl flex flex-col gap-3 animate-in fade-in"
          style={NEU.raised}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700"
              style={NEU.raisedSm}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/redaction-lab"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 flex items-center justify-between"
            style={NEU.raisedSm}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>Redaction Lab</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="mt-2 text-center text-xs font-bold uppercase tracking-wider py-3 rounded-xl"
            style={NEU.accentBtn}
            onClick={() => setMobileMenuOpen(false)}
          >
            Try Interactive Demo
          </Link>
        </div>
      )}
    </header>
  );
}
