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
    <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
              Policy-Constrained Verification
            </span>
            <span className="text-xs text-slate-500 font-sans">
              Rule Spec: {VOUCH_POLICY_SPEC.policyVersion}
            </span>
          </div>
        </div>
      </div>

      {/* Category selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 block">
          Select Leave Policy:
        </label>
        <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          {categories.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                selectedCategory === opt.id ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:bg-slate-100/50'
              }`}
            >
              <input
                type="radio"
                name="reqCategory"
                value={opt.id}
                checked={selectedCategory === opt.id}
                onChange={() => onSelectCategory(opt.id)}
                className="mt-0.5 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className={`block ${selectedCategory === opt.id ? 'font-bold text-blue-700' : 'font-medium'}`}>
                  {opt.label}
                </span>
                <span className="text-[11px] text-slate-500 font-sans block leading-tight">
                  {opt.desc}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Policy Claims Spec (Read-only display) */}
      <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5 text-xs font-sans">
        <div>
          <span className="font-bold text-slate-900 uppercase text-[11px] block tracking-wider">
            Required Claims (Verified):
          </span>
          <ul className="text-emerald-800 text-xs space-y-1 mt-1 font-mono">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>issuerIsLicensed: true</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>coarseCategory: {selectedCategory}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>validFrom / validTo dates</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>fitForDuty: occupational status</span>
            </li>
          </ul>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <span className="font-bold text-rose-800 uppercase text-[11px] block tracking-wider">
            Forbidden Claims (Never Requested):
          </span>
          <ul className="text-rose-800 text-xs space-y-1 mt-1 font-mono">
            <li className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>diagnosis (ICD-10 / notes)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>issuerName &amp; doctorName</span>
            </li>
            <li className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>fineCategory &amp; prescriptions</span>
            </li>
          </ul>
        </div>

        <div className="pt-2 border-t border-slate-200 text-xs text-slate-500 font-sans italic">
          &ldquo;This request is generated from policy {VOUCH_POLICY_SPEC.policyVersion} and cannot be widened.&rdquo;
        </div>
      </div>

      {/* Strict Absence of File Upload Notice */}
      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs font-sans text-amber-800">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Strict Zero-PHI Boundary: No medical file upload permitted on HR portal.</span>
      </div>
    </div>
  );
}
