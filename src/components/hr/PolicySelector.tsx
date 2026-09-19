'use client';

import React from 'react';
import { Scale, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { CoarseCategory } from '@/lib/types';
import { VOUCH_POLICY_SPEC } from '@/lib/policy';

interface PolicySelectorProps {
  selectedCategory: CoarseCategory;
  onSelectCategory: (category: CoarseCategory) => void;
}

export default function PolicySelector({
  selectedCategory,
  onSelectCategory,
}: PolicySelectorProps) {
  const categories: { id: CoarseCategory; label: string; desc: string }[] = [
    { id: 'STATUTORY_MATERNITY', label: 'MATERNITY', desc: 'Maternity Benefit Act 1961' },
    { id: 'STATUTORY_MEDICAL', label: 'MEDICAL', desc: 'Medical Certification 1972' },
    { id: 'CAREGIVING', label: 'CAREGIVING', desc: 'Family Dependent Leave' },
    { id: 'SELF_DECLARED', label: 'SELF_DECLARED', desc: 'Menstrual / 1-Day Episodic (No Doctor Certificate)' },
  ];

  return (
    <div className="rounded-xl bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#142319] border border-[#284230] flex items-center justify-center text-[#94C3A3]">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white block">
              POLICY-CONSTRAINED BUILDER (H2 / F2)
            </span>
            <span className="text-[10px] text-slate-400 font-sans">
              Policy: {VOUCH_POLICY_SPEC.policyVersion}
            </span>
          </div>
        </div>
      </div>

      {/* Category selector */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-300 font-condensed uppercase tracking-wider block">
          Select Leave Policy:
        </label>
        <div className="space-y-1.5 bg-[#0F172A] p-3 rounded-lg border border-[#334155] text-xs">
          {categories.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-start gap-2.5 p-1.5 rounded cursor-pointer transition-colors ${
                selectedCategory === opt.id ? 'bg-[#1E293B]/80 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <input
                type="radio"
                name="reqCategory"
                value={opt.id}
                checked={selectedCategory === opt.id}
                onChange={() => onSelectCategory(opt.id)}
                className="mt-0.5 accent-[#4A7C59]"
              />
              <div>
                <span className={`font-mono block ${selectedCategory === opt.id ? 'font-bold text-[#94C3A3]' : ''}`}>
                  {opt.label}
                </span>
                <span className="text-[10px] text-slate-400 font-sans block leading-tight">
                  {opt.desc}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Policy Claims Spec (Read-only display) */}
      <div className="p-3.5 bg-[#0F172A] rounded-lg border border-[#1E293B] space-y-2.5 text-xs font-mono">
        <div>
          <span className="font-bold text-white uppercase text-[11px] block font-condensed tracking-wider">
            Required Claims (Verified):
          </span>
          <ul className="text-[#94C3A3] text-[11px] space-y-0.5 mt-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#94C3A3]" />
              <span>issuerIsLicensed: true</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#94C3A3]" />
              <span>coarseCategory: {selectedCategory}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#94C3A3]" />
              <span>validFrom / validTo dates</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#94C3A3]" />
              <span>fitForDuty: occupational status</span>
            </li>
          </ul>
        </div>

        <div className="pt-2 border-t border-[#1E293B]">
          <span className="font-bold text-red-400 uppercase text-[11px] block font-condensed tracking-wider">
            Forbidden Claims (Never Requested):
          </span>
          <ul className="text-red-300 text-[11px] space-y-0.5 mt-1">
            <li className="flex items-center gap-1.5">
              <XCircle className="w-3 h-3 text-red-400" />
              <span>diagnosis (ICD-10 / notes)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <XCircle className="w-3 h-3 text-red-400" />
              <span>issuerName &amp; doctorName</span>
            </li>
            <li className="flex items-center gap-1.5">
              <XCircle className="w-3 h-3 text-red-400" />
              <span>fineCategory &amp; prescriptions</span>
            </li>
          </ul>
        </div>

        <div className="pt-2 border-t border-[#1E293B] text-[10px] text-slate-400 font-sans italic">
          &ldquo;This request is generated from policy {VOUCH_POLICY_SPEC.policyVersion} and cannot be widened.&rdquo;
        </div>
      </div>

      {/* Strict Absence of File Upload Notice */}
      <div className="p-2.5 rounded-lg bg-[#0F172A]/80 border border-[#1E293B] flex items-center gap-2 text-[10px] font-mono text-slate-400">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Strict Zero-PHI Boundary: No PDF or medical file upload permitted on HR portal.</span>
      </div>
    </div>
  );
}
