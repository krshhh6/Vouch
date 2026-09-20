'use client';

import { 
  ShieldAlert, 
  Eye, 
  HelpCircle, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Scale,
  Sparkles,
  Info
} from 'lucide-react';
import { CoarseCategory, FineCategory } from '@/lib/types';
import { getRuleByCoarseCategory } from '@/lib/policy';

interface LeakageMeterProps {
  coarseCategory: CoarseCategory;
  fineCategory: FineCategory;
  startDate: string;
  endDate: string;
  durationDays: number;
}

export default function LeakageMeter({
  coarseCategory,
  fineCategory,
  startDate,
  endDate,
  durationDays,
}: LeakageMeterProps) {
  const rule = getRuleByCoarseCategory(coarseCategory);

  // Derive honest residual inference warnings based on category and duration
  const getResidualInferences = () => {
    const inferences: string[] = [];

    if (coarseCategory === 'STATUTORY_MATERNITY') {
      inferences.push(
        `A ${durationDays}-day request under STATUTORY_MATERNITY inherently signals pregnancy or childbirth. This correlation is unavoidable because the statutory entitlement is defined specifically for maternity.`
      );
      if (durationDays > 84) {
        inferences.push(
          `Extended duration (>12 weeks) confirms third-trimester or post-natal delivery window under Maternity Benefit Act 1961.`
        );
      }
    } else if (coarseCategory === 'STATUTORY_MEDICAL') {
      if (durationDays > 30) {
        inferences.push(
          `A leave duration of ${durationDays} days under STATUTORY_MEDICAL implies significant clinical recovery (e.g. major surgery, oncology, or serious medical condition), even though the exact diagnosis is masked.`
        );
      } else if (durationDays <= 3) {
        inferences.push(
          `Short episodic medical leave (1-3 days) leaves open whether this is acute illness, migraine, or stress, minimizing inference depth.`
        );
      }
    } else if (coarseCategory === 'SELF_DECLARED') {
      inferences.push(
        `Under SELF_DECLARED policy, zero medical certificates are required. HR learns only that the 1-day monthly self-declared entitlement was exercised.`
      );
    }

    // Timing oracle reminder
    inferences.push(
      `Leave dates (${startDate} to ${endDate}) reveal timing. HR may correlate timing with corporate calendar milestones (e.g. quarterly reviews, deliverables).`
    );

    return inferences;
  };

  const residualInferences = getResidualInferences();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5 text-xs text-slate-700 shadow-sm font-sans">
      
      {/* Header with Academic Honesty Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-slate-700" />
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-sans">
            Protocol Leakage Meter & Residual Inference Analysis
          </h4>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
          RESEARCH AUDIT ACTIVE
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p>
          <strong className="text-blue-950 font-semibold">Scientific Transparency Note:</strong> Cryptographic selective disclosure eliminates direct diagnosis exposure, but <em>duration and timing</em> remain side-channel inference vectors. Vouch provides complete audit transparency—here is the exact protocol breakdown:
        </p>
      </div>

      {/* Grid: 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pillar 1: Exactly What HR Learns */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
          <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            1. Exact Claims HR Learns
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside">
            <li>
              <strong className="text-slate-900 font-mono">coarseCategory:</strong> {coarseCategory}
            </li>
            <li>
              <strong className="text-slate-900 font-mono">issuerIsLicensed:</strong> true (Boolean)
            </li>
            <li>
              <strong className="text-slate-900 font-mono">validFrom / validTo:</strong> {startDate} → {endDate}
            </li>
            <li>
              <strong className="text-slate-900 font-mono">issuerRefHash:</strong> Opaque SHA-256
            </li>
            <li>
              <strong className="text-slate-900 font-mono">Predicates:</strong> 4 Pass/Fail Booleans
            </li>
          </ul>
        </div>

        {/* Pillar 2: What HR Could Still Infer */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            2. Residual Inferences HR Can Make
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-700 leading-relaxed font-sans">
            {residualInferences.map((inf, idx) => (
              <p key={idx}>• {inf}</p>
            ))}
          </div>
        </div>

        {/* Pillar 3: What Raw PDF Would Have Leaked */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            3. Blocked Raw PDF Leaks
          </div>
          <ul className="space-y-1 text-[11px] text-slate-400 line-through">
            <li>ICD-10 Diagnostic Billing Codes</li>
            <li>Ultrasound / Surgical Complication Notes</li>
            <li>Prescription Dosages & Regimens</li>
            <li>Clinic Specialty & Doctor Name</li>
            <li>Doctor Personal Clinical Impressions</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
