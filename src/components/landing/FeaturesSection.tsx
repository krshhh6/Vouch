'use client';

import React from 'react';
import { 
  ShieldCheck, 
  EyeOff, 
  Clock, 
  CheckCircle2, 
  FileLock2, 
  Layers, 
  Scale, 
  Fingerprint 
} from 'lucide-react';
import Card from './Card';

export default function FeaturesSection() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'ECDSA P-256 Signatures',
      description: 'Cryptographic proof that an authorized clinical authority signed the attestation using Web Crypto keys, verifiable without phone-home tracking.',
      tag: 'NIST P-256 / SHA-256',
    },
    {
      icon: EyeOff,
      title: '0% Diagnosis Leak',
      description: 'HR never sees medical conditions, ICD-10 billing codes, prescription regimens, or doctor notes—only binary statutory eligibility booleans.',
      tag: 'SELECTIVE DISCLOSURE',
    },
    {
      icon: Clock,
      title: 'Time-Bound Proofs',
      description: 'Share codes are single-use or time-delimited (1 to 48 hours), automatically expiring with instant employee revocation capability.',
      tag: 'EPHEMERAL CREDENTIALS',
    },
    {
      icon: CheckCircle2,
      title: '100% Tamper Proof',
      description: 'Compliance receipts are cryptographically hash-chained from genesis, providing labor inspectors irrefutable audit trails with zero PHI stored.',
      tag: 'AUDITABLE LEDGER',
    },
  ];

  return (
    <section id="features" className="bg-navy-900 text-white py-16 sm:py-24 px-6 sm:px-8 border-t border-navy-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-sm text-primary-400 font-semibold mb-4 tracking-wider uppercase font-mono">
          03 &bull; PROTOCOL GUARANTEES
        </div>

        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-sans">
            Key Features
          </h2>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-sans">
            Designed to satisfy both labor compliance inspectors and the strictest enterprise privacy mandates.
          </p>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                variant="dark" 
                className="p-8 group hover:border-primary-500/50 hover:bg-navy-800/90 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 bg-navy-950 px-2.5 py-1 rounded border border-navy-700">
                    {feature.tag}
                  </span>
                </div>

                <h3 className="font-semibold text-xl mb-3 text-white font-sans">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 text-sm leading-relaxed font-sans">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
