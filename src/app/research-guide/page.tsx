'use client';

import Link from 'next/link';
import { 
  BookOpen, 
  ShieldCheck, 
  ExternalLink, 
  GitBranch, 
  Key, 
  CheckCircle2, 
  Scale, 
  Lock, 
  Activity, 
  Layers,
  Database,
  ArrowRight
} from 'lucide-react';

export default function ResearchGuidePage() {
  const gaps = [
    {
      id: 'GAP 0',
      title: 'Inference Leakage via Metadata & Clinical Identifiers',
      problem: 'Traditional attestations reveal doctor names ("Sunrise Fertility Centre") or detailed medical categories, leaking diagnosis to HR regardless of signature strength.',
      solution: 'Vouch replaces issuer identities with opaque SHA-256 registry hashes (`issuerRefHash`) and binary status (`issuerIsLicensed: true`). Diagnostics are mapped into broad statutory categories (e.g. `STATUTORY_MATERNITY`).',
      status: 'Implemented (FIX 0a, 0b)'
    },
    {
      id: 'GAP 1',
      title: 'Entitlement Balance & History Leakage',
      problem: 'When employees request leave, verifying quota traditionally reveals remaining leave balances, past claim frequencies, or chronic condition indicators.',
      solution: 'Vouch computes employer pseudonyms (`sha256(employeeId + salt)`) and evaluates 4 binary pass/fail boolean predicates. HR learns only true/false for policy compliance with 0% balance exposure.',
      status: 'Implemented (F1 Predicates)'
    },
    {
      id: 'GAP 2',
      title: 'Power-Asymmetry & Coercive Over-Disclosure',
      problem: 'Employers often coerce workers into uploading raw doctor letters, prescriptions, or discharge summaries that legally exceed statutory leave verification requirements.',
      solution: 'Policy-Constrained Request Builder locks HR requests strictly to machine-readable statutory definitions (e.g. Maternity Benefit Act 1961). Employers cannot widen requests or ask for custom medical files.',
      status: 'Implemented (F2 Request Builder)'
    },
    {
      id: 'GAP 3',
      title: 'Auditability Deficits & Retrospective Tampering',
      problem: 'Without an immutable verification trail, employers can deny receiving claims, or audit logs can be covertly purged during wrongful termination disputes.',
      solution: 'Sequential SHA-256 hash-chained receipt ledger (`vouch_receipts`). Every approval or rejection generates an immutable block linked to the previous receipt hash with deterministic jittered timestamps.',
      status: 'Implemented (F3 Receipt Chain)'
    },
    {
      id: 'GAP 4',
      title: 'Employee Comprehension & Information Transparency',
      problem: 'Employees have no visibility into what secondary inferences or sensitive data their doctor notes expose to corporate benefit managers.',
      solution: 'Interactive Information-Theoretic Leakage Meter evaluates exactly what HR will learn, what can be statistically inferred, and what raw PDF exposure is prevented.',
      status: 'Implemented (F4 Leakage Meter)'
    },
    {
      id: 'GAP 5',
      title: 'Decoupled Registry Validation & Dynamic Revocation',
      problem: 'Verifiers either require full online access to clinical registries (leaking query metadata) or cannot handle doctor license revocations.',
      solution: 'Decoupled registry check where clinicians sign with ECDSA P-256 keys mapped to registry hashes. Revocation lists invalidate credentials immediately while preserving offline verification.',
      status: 'Implemented (F5/F6 Architecture)'
    }
  ];

  const glossary = [
    {
      term: 'ECDSA P-256',
      definition: 'Elliptic Curve Digital Signature Algorithm using the NIST P-256 (secp256r1) curve. Supported natively in modern browsers via the W3C Web Crypto API with zero external dependencies.'
    },
    {
      term: 'SHA-256',
      definition: 'A 256-bit cryptographic hash function that produces a unique deterministic digest from canonical JSON. Used in Vouch for issuer reference hashes, document integrity, and ledger block chaining.'
    },
    {
      term: 'Selective Disclosure',
      definition: 'A privacy-preserving credential model where the holder proves specific attributes (e.g. leave dates and occupational fitness) without disclosing underlying diagnostic records or physician notes.'
    },
    {
      term: 'Zero-Knowledge Predicates',
      definition: 'Cryptographic checks that output binary boolean answers (True/False) to mathematical conditions without exposing private inputs (e.g. checking whether leave requested <= days remaining without revealing remaining days).'
    },
    {
      term: 'Tamper-Evident Hash Chain',
      definition: 'An append-only data structure where every new receipt includes the cryptographic hash of the prior receipt: hash_n = SHA256(prevHash + canonicalPayload). Any alteration breaks the cryptographic link.'
    },
    {
      term: 'Employer Pseudonym',
      definition: 'A deterministic, one-way identifier: sha256(employeeId + companySalt). Allows an employer system to track entitlement balances across a calendar year without associating claims with permanent employee profiles across external databases.'
    }
  ];

  return (
    <div className="w-full bg-[#0F172A] text-slate-100 min-h-[calc(100vh-100px)] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Strip */}
        <div className="border-b border-[#1E293B] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94C3A3]">
                RESEARCH GUIDE &amp; PROTOCOL SPECIFICATION
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E293B] text-slate-300 border border-slate-700">
                WUCH-2026.1 / Vouch
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1 font-condensed uppercase tracking-wider">
              Research Gap Solutions &amp; System Architecture
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-1 max-w-3xl">
              Complete technical reference documenting the 6 fundamental privacy and verification research gaps resolved by Vouch, complete with cryptographic glossary and source references.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/tarunagnihotri534/Vouch"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-xs font-condensed uppercase tracking-wider font-bold text-white transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#4A7C59]" />
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3 text-slate-400 ml-1" />
            </a>
          </div>
        </div>

        {/* Section 1: Research Gaps 0–5 Breakdown */}
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#94C3A3] uppercase tracking-wider">
              Citable Research Contributions
            </span>
            <h2 className="text-2xl font-bold text-white font-condensed uppercase tracking-wider">
              Research Gaps 0 through 5 Explained
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gaps.map((gap) => (
              <div 
                key={gap.id}
                className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-5 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                  <span className="text-xs font-mono font-bold text-[#94C3A3]">
                    {gap.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#142319] text-[#94C3A3] border border-[#284230]">
                    {gap.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white font-condensed uppercase tracking-wider">
                  {gap.title}
                </h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <strong className="text-red-400 font-condensed uppercase tracking-wider text-[11px] block">
                      The Hazard:
                    </strong>
                    <p className="text-slate-300 font-sans leading-relaxed mt-0.5">
                      {gap.problem}
                    </p>
                  </div>

                  <div>
                    <strong className="text-[#94C3A3] font-condensed uppercase tracking-wider text-[11px] block">
                      The Vouch Fix:
                    </strong>
                    <p className="text-slate-300 font-sans leading-relaxed mt-0.5">
                      {gap.solution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Cryptographic Glossary */}
        <div className="space-y-6 pt-6 border-t border-[#1E293B]">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#94C3A3] uppercase tracking-wider">
              Cryptographic Definitions
            </span>
            <h2 className="text-2xl font-bold text-white font-condensed uppercase tracking-wider">
              Protocol Glossary &amp; Primitives
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {glossary.map((item) => (
              <div 
                key={item.term}
                className="p-4 rounded-lg bg-[#0B1120] border border-[#1E293B] space-y-1.5 text-xs"
              >
                <span className="font-bold text-white font-mono text-sm block">
                  {item.term}
                </span>
                <p className="text-slate-400 font-sans leading-relaxed text-[11px]">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Navigation Links */}
        <div className="p-6 rounded-lg bg-[#0B1120] border border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-condensed uppercase tracking-wider">
              Ready to verify live cryptographic claims?
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Follow the end-to-end user journey across Clinic Issuer, Employee Wallet, and HR Verifier.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/clinic"
              className="px-4 py-2.5 rounded bg-[#4A7C59] hover:bg-[#3D6649] text-white font-condensed font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>1. CLINIC ISSUER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/hr"
              className="px-4 py-2.5 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-200 border border-slate-700 font-condensed font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-1.5"
            >
              <span>3. HR VERIFIER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
