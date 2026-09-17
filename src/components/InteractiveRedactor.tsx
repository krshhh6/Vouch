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
  HelpCircle,
  UploadCloud,
  FileUp,
  Loader2
} from 'lucide-react';

export default function InteractiveRedactor() {
  const [selectedDocId, setSelectedDocId] = useState<string>(SAMPLE_DOCUMENTS[0].id);
  const [customText, setCustomText] = useState<string>(SAMPLE_DOCUMENTS[0].rawText);
  const [viewMode, setViewMode] = useState<'blackout' | 'highlight' | 'compare'>('compare');
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSelectDoc = (doc: SampleMedicalDocument) => {
    setSelectedDocId(doc.id);
    setCustomText(doc.rawText);
    setUploadedFileName(null);
    setUploadError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadedFileName(file.name);

    try {
      if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
        const { extractTextFromPDF } = await import('@/lib/verification/pdfExtract');
        const text = await extractTextFromPDF(file);
        if (!text || text.trim().length === 0) {
          setUploadError('PDF parsed but contained no text layer. For scanned physical papers, please enter text manually or use digital PDF.');
        } else {
          setCustomText(text);
          setSelectedDocId('uploaded-pdf');
        }
      } else {
        const text = await file.text();
        setCustomText(text);
        setSelectedDocId('uploaded-file');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(`Failed to extract text from document: ${msg}`);
    } finally {
      setIsUploading(false);
    }
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
      let badgeStyle = 'bg-zinc-900 text-white border-zinc-600';
      if (ent.type === 'medication') badgeStyle = 'bg-zinc-900 text-zinc-200 border-zinc-500';
      if (ent.type === 'icd_code') badgeStyle = 'bg-black text-white border-zinc-400';
      if (ent.type === 'lab_value' || ent.type === 'personal_vitals') badgeStyle = 'bg-zinc-850 text-zinc-100 border-zinc-600';

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
              hoveredEntity === ent.id ? 'ring-1 ring-white scale-105' : ''
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
        <div>
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1 font-condensed">
            Choose Sample Clinical Record to Inspect
          </label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_DOCUMENTS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  selectedDocId === doc.id
                    ? 'bg-white border-white text-black font-semibold shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {doc.title}
              </button>
            ))}

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer transition-all bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white font-condensed uppercase tracking-wide">
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <FileUp className="w-3.5 h-3.5 text-zinc-300" />
              )}
              <span>{isUploading ? 'Extracting Text...' : 'Upload PDF / Report'}</span>
              <input
                type="file"
                accept=".pdf,application/pdf,text/plain"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto font-condensed">
          <button
            onClick={() => setViewMode('compare')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              viewMode === 'compare' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Before vs After
          </button>
          <button
            onClick={() => setViewMode('blackout')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              viewMode === 'blackout' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Blackout Bars
          </button>
          <button
            onClick={() => setViewMode('highlight')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              viewMode === 'highlight' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Entity Inspector
          </button>
        </div>
      </div>

      {/* Upload Feedback / Banner */}
      {uploadedFileName && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>
              Loaded document: <strong>{uploadedFileName}</strong> — Clinical entities parsed locally via <code>pdfjs-dist</code>.
            </span>
          </div>
          <span className="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-200 shrink-0 border border-zinc-700">
            0% Network Upload (Device-Local)
          </span>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-300">
          <AlertTriangle className="w-4 h-4 text-white shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Analytics & Exposure Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-condensed uppercase tracking-wider">Entities Masked</span>
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{stats.totalEntities}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Masked from HR view</p>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-condensed uppercase tracking-wider">Diagnoses Shielded</span>
            <Activity className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{stats.diagnosisCount}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">e.g. IVF, depression, surgery</p>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-condensed uppercase tracking-wider">Prescriptions Hidden</span>
            <Pill className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{stats.medicationCount}</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Dosages & regimens hidden</p>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-condensed uppercase tracking-wider">Residual Leakage</span>
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">0% on Vouch</div>
          <p className="text-[11px] text-zinc-400 mt-0.5">vs 100% on standard PDF</p>
        </div>
      </div>

      {/* Main Redaction Sandbox Comparison Workspace */}
      {viewMode === 'compare' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Traditional Raw Upload (Privacy Hazard) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
            <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-zinc-300" />
                <h4 className="font-semibold text-xs text-zinc-200 uppercase tracking-wider font-condensed">
                  Traditional HR Process: Full Raw PDF
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black text-zinc-300 border border-zinc-700">
                HIGH PRIVACY RISK
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-black border border-zinc-800 text-xs text-zinc-400">
                Notice: Uploading raw files exposes confidential medical conditions (IVF cycle, psychiatric notes, surgical procedures) directly to HR and managers, creating workplace bias risks.
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-condensed">
                  Raw Physician Clinical Notes (Editable)
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={13}
                  className="w-full p-4 rounded-xl bg-black border border-zinc-800 font-mono text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 leading-relaxed resize-y"
                  placeholder="Paste or edit doctor notes here..."
                />
              </div>
            </div>
          </div>

          {/* Right Column: Vouch Minimal Disclosure Attestation */}
          <div className="rounded-2xl border border-zinc-700 bg-zinc-950 overflow-hidden shadow-xl flex flex-col">
            <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                <h4 className="font-semibold text-xs text-white uppercase tracking-wider font-condensed">
                  Vouch: Minimal Attestation
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-black">
                100% PRIVATE & VERIFIABLE
              </span>
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="p-3 rounded-lg bg-black border border-zinc-800 text-xs text-zinc-300">
                HR only receives the cryptographic attestation: Leave duration is certified, provider is accredited, but <strong>zero diagnoses, medications, or clinical notes</strong> are ever transmitted.
              </div>

              {/* Minimal Payload Card */}
              <div className="p-4 rounded-xl bg-black text-zinc-100 space-y-3 font-sans border border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 font-condensed">Holder</span>
                    <p className="font-bold text-sm text-white">{activeDoc?.patientName || 'Sarah Jenkins'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-zinc-900 text-zinc-200 border border-zinc-700">
                    STATUTORY_MEDICAL
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 font-condensed">Leave Window</span>
                    <p className="font-bold font-mono text-zinc-200">Sep 16, 2026 – Oct 07, 2026</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 font-condensed">Fit-For-Duty Status</span>
                    <p className="font-bold text-zinc-300">Unfit (Total Rest Mandated)</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <div>
                    <span className="font-semibold text-white">{activeDoc?.clinic || 'Summit Health'}</span>
                    <p className="text-[10px]">Registry Reg: GMC-8849201</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-white font-bold">✓ ECDSA P-256</span>
                    <p className="text-[10px] text-zinc-500">Tamper-Proof</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-zinc-500 italic text-center">
                  Notice: IVF treatments, ultrasound findings, progesterone doses, and panic ratings are 100% eliminated from the HR workflow.
                </p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Standalone Blackout or Highlight Inspector */
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h4 className="font-semibold text-white text-sm font-condensed uppercase tracking-wider">
                {viewMode === 'blackout' ? 'Live Blackout Bar Preview' : 'Clinical Entity Inspector'}
              </h4>
              <p className="text-xs text-zinc-400">
                {viewMode === 'blackout' 
                  ? 'Hover over any black bar to peek at the intercepted term and see why it is redacted'
                  : 'Categorized clinical tokens that present privacy exposure risks'}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-black font-mono text-xs text-zinc-300 leading-relaxed border border-zinc-800 whitespace-pre-wrap">
            {renderHighlightedDocument()}
          </div>
        </div>
      )}
    </div>
  );
}
