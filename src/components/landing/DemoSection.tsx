'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Stethoscope, Share2, ShieldCheck, BellRing, Sparkles } from 'lucide-react';
import Button from './Button';
import Card from './Card';

export default function DemoSection() {
  const steps = [
    {
      step: '01',
      title: 'Clinic signs',
      desc: 'Doctor fills standard attestation form and applies digital signature in one click.',
      icon: Stethoscope,
      pill: 'ECDSA Signature',
    },
    {
      step: '02',
      title: 'Employee shares',
      desc: 'Worker generates an ephemeral 4-digit share code without revealing medical diagnosis.',
      icon: Share2,
      pill: 'Code: LG-8429',
    },
    {
      step: '03',
      title: 'HR verifies',
      desc: 'HR enters share code for instant cryptographic audit & policy predicate validation.',
      icon: ShieldCheck,
      pill: '✓ Policy Pass',
    },
    {
      step: '04',
      title: 'Employee notified',
      desc: 'Leave is approved on the company ledger; worker receives real-time approval notice.',
      icon: BellRing,
      pill: 'Leave Approved',
    },
  ];

  return (
    <section id="demo" className="bg-navy-900 text-white py-16 sm:py-24 px-6 sm:px-8 border-t border-navy-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-sm text-primary-400 font-semibold mb-4 tracking-wider uppercase font-mono">
          04 &bull; INTERACTIVE DEMO
        </div>

        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-sans">
            See It In Action
          </h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-sans">
            Experience the complete cryptographic lifecycle from clinic certificate signing to HR statutory leave confirmation in under 60 seconds.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.step} 
                variant="dark" 
                className="p-6 text-center flex flex-col justify-between group hover:border-primary-500/50"
              >
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-primary-500 mb-3 font-mono">
                    {item.step}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-navy-950 border border-navy-700 mx-auto flex items-center justify-center text-primary-400 mb-3 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-semibold text-lg mb-2 text-white font-sans">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-navy-700/60">
                  <span className="inline-block text-[10px] font-mono text-primary-300 bg-primary-950/60 border border-primary-800/80 px-2.5 py-1 rounded-full">
                    {item.pill}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-14 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/login" variant="primary" className="shadow-lg group text-base px-10 py-3.5">
            <span>Launch Full Interactive Demo</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button href="/clinic" variant="secondary" className="text-base px-8 py-3.5">
            Clinic Issuer Sandbox
          </Button>
        </div>

      </div>
    </section>
  );
}
