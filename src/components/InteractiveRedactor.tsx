'use client';

import { useState, useMemo } from 'react';
import { 
  SAMPLE_DOCUMENTS, 
  analyzeAndRedactText, 
  SampleMedicalDocument 
} from '@/lib/redaction';
import { 
  EyeOff, 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Pill, 
  Activity, 
  CheckCircle2, 
  Flame,
  HelpCircle
} from 'lucide-react';

export default function InteractiveRedactor() {
  const [selectedDocId, setSelectedDocId] = useState<string>(SAMPLE_DOCUMENTS[0].id);
  const [customText, setCustomText] = useState<string>(SAMPLE_DOCUMENTS[0].rawText);
  const [viewMode, setViewMode] = useState<'blackout' | 'highlight' | 'compare'>('compare');
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  const handleSelectDoc = (doc: SampleMedicalDocument) => {
    setSelectedDocId(doc.id);
    setCustomText(doc.rawText);
  };

  const { entities, redactedText, stats } = useMemo(() => {
    return analyzeAndRedactText(customText);
  }, [customText]);

  const activeDoc = SAMPLE_DOCUMENTS.find(d => d.id === selectedDocId);

  // Helper to render interactive highlighted spans
  const renderHighlightedDocument = () => {
    if (entities.length === 0) return <span>{customText}</span>;

    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    entities.forEach((ent, idx) => {
      // Un-matched text before this entity
      if (ent.startIndex > lastIdx) {
        elements.push(
          <span key={`text-${idx}`}>{customText.substring(lastIdx, ent.startIndex)}</span>
        );
      }

      // Entity style based on type
      let badgeStyle = 'bg-red-500/20 text-red-300 border-red-500/40';
      if (ent.type === 'medication') badgeStyle = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      if (ent.type === 'icd_code') badgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      if (ent.type === 'lab_value' || ent.type === 'personal_vitals') badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

      if (viewMode === 'blackout') {
        elements.push(
          <span
            key={ent.id}
            onMouseEnter={() => setHoveredEntity(ent.id)}
            onMouseLeave={() => setHoveredEntity(null)}
            className="redacted-bar cursor-help font-mono"
            title={`${ent.reason} (Click or hover to reveal)`}
          >
            {ent.text}
          </span>
        );
      } else {
        elements.push(
          <span
            key={ent.id}
            onMouseEnter={() => setHoveredEntity(ent.id)}
            onMouseLeave={() => setHoveredEntity(null)}
            className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-mono border mx-0.5 transition-all ${badgeStyle} ${
              hoveredEntity === ent.id ? 'ring-2 ring-white scale-105' : ''
            }`}
          >
            {ent.text}
          </span>
        );
      }

      lastIdx = ent.endIndex;
    });

    if (lastIdx < customText.length) {
      elements.push(
        <span key="text-end">{customText.substring(lastIdx)}</span>
      );
    }

    return elements;
  };

  return (
    <div className="space-y-6">
      {/* Sample Document Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-ink-900/90 p-4 rounded-2xl border border-ink-800">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Choose Sample Clinical Record to Inspect
          </label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_DOCUMENTS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  selectedDocId === doc.id
                    ? 'bg-seal-600 border-seal-500 text-white font-semibold shadow-md shadow-seal-600/30'
                    : 'bg-ink-950 border-ink-800 text-slate-300 hover:border-ink-700 hover:text-white'
                }`}
              >
                {doc.title}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-ink-950 p-1 rounded-xl border border-ink-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('compare')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'compare' ? 'bg-seal-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Before vs After
          </button>
          <button
            onClick={() => setViewMode('blackout')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'blackout' ? 'bg-seal-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blackout Bars
          </button>
          <button
            onClick={() => setViewMode('highlight')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'highlight' ? 'bg-seal-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entity Inspector
          </button>
        </div>
      </div>

      {/* Analytics & Exposure Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-ink-900/90 p-4 rounded-xl border border-ink-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Entities Intercepted</span>
            <ShieldCheck className="w-4 h-4 text-seal-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{stats.totalEntities}</div>
          <p className="text-[11px] text-seal-400 mt-0.5">Masked from HR view</p>
        </div>

        <div className="bg-ink-900/90 p-4 rounded-xl border border-ink-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Diagnoses Protected</span>
            <Activity className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-bold text-pink-400 mt-1 font-mono">{stats.diagnosisCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">e.g. IVF, depression, surgery</p>
        </div>

        <div className="bg-ink-900/90 p-4 rounded-xl border border-ink-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Prescriptions Shielded</span>
            <Pill className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">{stats.medicationCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Dosages & regimens hidden</p>
        </div>

        <div className="bg-ink-900/90 p-4 rounded-xl border border-ink-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Raw Report Privacy Leak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">0% on Vouch</div>
          <p className="text-[11px] text-rose-400 mt-0.5">vs 100% on standard PDF</p>
        </div>
      </div>

      {/* Main Redaction Sandbox Comparison Workspace */}
      {viewMode === 'compare' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Traditional Raw Upload (Privacy Hazard) */}
          <div className="rounded-2xl border border-red-900/50 bg-ink-900/90 overflow-hidden shadow-xl">
            <div className="bg-red-950/70 border-b border-red-900/60 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h4 className="font-semibold text-xs text-red-200 uppercase tracking-wider">
                  Traditional HR Process: Full Raw PDF
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-900/80 text-red-200 border border-red-700">
                HIGH PRIVACY RISK
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-xs text-red-300">
                ⚠️ Uploading this file reveals confidential medical conditions (IVF cycle, psychiatric notes, surgery details) directly to HR and managers, creating workplace bias risks.
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Raw Physician Clinical Notes (Editable)
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={13}
                  className="w-full p-4 rounded-xl bg-ink-950 border border-red-900/40 font-mono text-xs text-slate-200 focus:outline-none focus:border-red-500 leading-relaxed resize-y"
                  placeholder="Paste or edit doctor notes here..."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Vouch Minimal Disclosure Attestation */}
          <div className="rounded-2xl border border-seal-800/80 bg-ink-900/90 overflow-hidden shadow-xl flex flex-col">
            <div className="bg-seal-950/70 border-b border-seal-800/80 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-seal-400" />
                <h4 className="font-semibold text-xs text-seal-200 uppercase tracking-wider">
                  Vouch: Minimal Attestation
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-seal-900/80 text-seal-200 border border-seal-700">
                100% PRIVATE & VERIFIABLE
              </span>
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="p-3 rounded-lg bg-seal-950/40 border border-seal-800 text-xs text-seal-300">
                🛡️ HR only receives the cryptographic attestation: Leave duration is certified, provider is accredited, but <strong>zero diagnoses, medications, or notes</strong> are ever transmitted.
              </div>

              {/* Minimal Payload Card */}
              <div className="p-4 rounded-xl bg-parchment-100 text-ink-950 space-y-3 font-sans border border-parchment-300 shadow-inner">
                <div className="flex items-center justify-between border-b border-parchment-300 pb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Holder</span>
                    <p className="font-bold text-sm text-ink-900">{activeDoc?.patientName || 'Sarah Jenkins'}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-seal-100 text-seal-800 border border-seal-300">
                    Certified Medical Leave
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Leave Window</span>
                    <p className="font-bold font-mono text-ink-900">Sep 16, 2026 – Oct 07, 2026</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Fit-For-Duty Status</span>
                    <p className="font-bold text-amber-800">Unfit (Total Rest Mandated)</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-parchment-300 flex items-center justify-between text-[11px] text-slate-600">
                  <div>
                    <span className="font-semibold text-ink-900">{activeDoc?.clinic || 'Summit Health'}</span>
                    <p className="text-[10px]">Registry Reg: GMC-8849201</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-seal-800 font-bold">✓ ECDSA P-256</span>
                    <p className="text-[10px] text-slate-500">Tamper-Proof</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-slate-400 italic text-center">
                  Notice: IVF treatments, ultrasound findings, progesterone doses, and panic ratings are 100% eliminated from the HR workflow.
                </p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Standalone Blackout or Highlight Inspector */
        <div className="rounded-2xl border border-ink-800 bg-ink-900/90 overflow-hidden shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ink-800">
            <div>
              <h4 className="font-semibold text-white text-sm">
                {viewMode === 'blackout' ? 'Live Blackout Bar Preview' : 'Clinical Entity Inspector'}
              </h4>
              <p className="text-xs text-slate-400">
                {viewMode === 'blackout' 
                  ? 'Hover over any black bar to peek at the intercepted term and see why it is redacted'
                  : 'Categorized clinical tokens that present privacy exposure risks'}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-ink-950 font-mono text-xs text-slate-300 leading-relaxed border border-ink-800/80 whitespace-pre-wrap">
            {renderHighlightedDocument()}
          </div>
        </div>
      )}
    </div>
  );
}
