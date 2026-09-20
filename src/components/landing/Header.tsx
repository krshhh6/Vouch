'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import Button from './Button';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-navy-900 text-white px-6 sm:px-8 py-4 sticky top-0 z-50 border-b border-navy-800 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-primary-600/15 border border-primary-500/30 flex items-center justify-center text-primary-400 group-hover:text-primary-300 transition-colors">
            <ShieldCheck className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-wide text-white font-sans">VOUCH</span>
            <span className="text-xs font-mono text-gray-400 bg-navy-800 px-2 py-0.5 rounded border border-navy-700">
              v2026.1
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#overview" className="hover:text-white transition-colors">
            Overview
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Key Features
          </a>
          <a href="#demo" className="hover:text-white transition-colors">
            Demo
          </a>
          <Link href="/redaction-lab" className="hover:text-primary-400 transition-colors flex items-center gap-1">
            Redaction Lab
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button href="/login" variant="small" className="px-6 py-2">
            Try Demo
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-navy-800 mt-3 space-y-3 animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-2 text-sm text-gray-300 font-medium">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-white hover:bg-navy-800 rounded"
            >
              Overview
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-white hover:bg-navy-800 rounded"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-white hover:bg-navy-800 rounded"
            >
              Key Features
            </a>
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 hover:text-white hover:bg-navy-800 rounded"
            >
              Demo Walkthrough
            </a>
            <Link
              href="/redaction-lab"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 text-primary-400 hover:bg-navy-800 rounded flex items-center justify-between"
            >
              <span>Redaction Lab</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
          <div className="pt-2">
            <Button href="/login" variant="primary" className="w-full py-2.5 text-sm">
              Try Interactive Demo
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
