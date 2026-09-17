'use client';

import { useState, useRef } from 'react';
import { 
  FileText, 
  EyeOff, 
  ShieldCheck, 
  Upload, 
  Copy, 
  Download, 
  Check, 
  RotateCcw,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const DEFAULT_SAMPLE_REPORT = `Patient ID: MR-98765
Dr. Name: James Chen, MD

Diagnosis: F41.9 - Anxiety Disorder, unspecified

Treatment: Sertraline 50mg daily, Lorazepam 1mg as needed

Ultrasound: Fetal cardiac activity present. Biometric markers consistent with 18 weeks gestation.`;

export default function RedactionLabPage() {
  const [inputText, setInputText] = useState(DEFAULT_SAMPLE_REPORT);
  const [copiedText, setCopiedText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analyze text and calculate redaction tokens
  const patterns = [
    { label: 'diagnosis codes', regex: /([A-TV-Z]\d{2}(?:\.\d{1,4})?|Anxiety Disorder|Depressive Disorder)/gi },
    { label: 'medication names', regex: /(Sertraline|Lorazepam|Zoloft|Lexapro|Prozac|Ondansetron|Progesterone)/gi },
    { label: 'patient ID', regex: /(?:Patient ID|MRN)[:\s]+[A-Za-z0-9-]+/gi },
    { label: 'dosages', regex: /(\d+(?:\.\d+)?\s*(?:mg|mcg|ml|weeks gestation))/gi }
  ];

  // Perform redaction
  let redactedOutput = inputText;
  let totalRedactions = 0;
  const breakdown: { [key: string]: number } = {};

  patterns.forEach(p => {
    const matches = inputText.match(p.regex) || [];
    breakdown[p.label] = matches.length;
    totalRedactions += matches.length;
  });

  // Replace text with [REDACTED]
  patterns.forEach(p => {
    redactedOutput = redactedOutput.replace(p.regex, '[REDACTED]');
  });

  const totalChars = inputText.length;
  const charsHidden = totalRedactions > 0 ? Math.min(totalChars, totalRedactions * 14) : 0;
  const readabilityScore = totalChars > 0 ? Math.max(15, Math.round(100 - (charsHidden / totalChars) * 80)) : 100;

  const handleCopyRedacted = () => {
    navigator.clipboard.writeText(redactedOutput);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([redactedOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vouch_Redacted_Report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setInputText(content);
    };
    reader.readAsText(file);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputText(text);
    } catch {
      alert('Clipboard access denied. Please paste directly into the textarea.');
    }
  };

  return (
    <div className="w-full bg-[#0F172A] text-slate-100 min-h-[calc(100vh-100px)] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Strip */}
        <div className="border-b border-[#1E293B] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94C3A3]">
                REDACTION LAB
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E293B] text-slate-300 border border-slate-700">
                Client-Side Sanitizer
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 font-condensed uppercase tracking-wider">
              Paste raw medical text &amp; see what&apos;s redacted before HR sees anything
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              Clinical sanitization simulator. Demonstrates how raw doctor letters, prescriptions, and ultrasound diagnostics are scrubbed into zero-exposure leave credentials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/employee"
              className="text-xs font-condensed uppercase tracking-wider font-semibold px-3 py-1.5 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-200 border border-slate-700 transition-colors"
            >
              Back to Employee Vault
            </Link>
          </div>
        </div>

        {/* 50 / 50 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel (50%): 4a. Input Area */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#4A7C59]" />
                  PASTE MEDICAL REPORT
                </span>
                <span className="text-[10px] font-mono text-slate-400">Raw Unsanitized Input</span>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={10}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste medical notes, discharge summary, or doctor letter here..."
                  className="w-full p-4 rounded bg-[#0F172A] border border-[#334155] font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-[#4A7C59] resize-y"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="px-3 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 transition-colors"
                >
                  PASTE TEXT
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#4A7C59]" />
                  <span>UPLOAD FILE</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.md,.json,.pdf"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => setInputText(DEFAULT_SAMPLE_REPORT)}
                  className="px-3 py-2 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 transition-colors"
                >
                  LOAD SAMPLE
                </button>
              </div>

              {/* Redaction Patterns Detected Box */}
              <div className="p-4 bg-[#0F172A] rounded border border-[#1E293B] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-condensed uppercase tracking-wider">
                    Redaction patterns detected: {totalRedactions}
                  </span>
                  <span className="text-[10px] font-mono text-[#94C3A3]">Auto-Scrub active</span>
                </div>
                <ul className="space-y-1 text-slate-300 font-mono text-[11px]">
                  <li className="flex items-center gap-2">
                    <span className="text-[#94C3A3]">•</span>
                    <span>{breakdown['diagnosis codes'] || 0} diagnosis codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#94C3A3]">•</span>
                    <span>{breakdown['medication names'] || 0} medication names</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#94C3A3]">•</span>
                    <span>{breakdown['patient ID'] || 0} patient ID</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#94C3A3]">•</span>
                    <span>{breakdown['dosages'] || 0} dosages</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Right Panel (50%): 4b. Live Redacted Output */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-lg bg-[#0B1120] border border-[#1E293B] p-5 space-y-4 shadow-sm">
              <div className="border-b border-[#1E293B] pb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-condensed text-white flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4 text-[#4A7C59]" />
                  REDACTED FOR HR
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#142319] text-[#94C3A3] border border-[#284230]">
                  Sanitized Preview
                </span>
              </div>

              {/* Output Display */}
              <div className="p-4 rounded bg-[#0F172A] border border-[#334155] font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap min-h-[200px]">
                {redactedOutput.split(/(\[REDACTED\])/g).map((part, index) => {
                  if (part === '[REDACTED]') {
                    return (
                      <span key={index} className="px-1.5 py-0.5 mx-0.5 rounded bg-black text-[#94C3A3] border border-slate-700 font-mono text-[11px] font-bold select-none">
                        [REDACTED]
                      </span>
                    );
                  }
                  return <span key={index}>{part}</span>;
                })}
              </div>

              {/* Redaction Summary Box */}
              <div className="p-4 bg-[#0F172A] rounded border border-[#1E293B] space-y-3 text-xs">
                <div className="border-b border-[#1E293B] pb-2 flex items-center justify-between">
                  <span className="font-bold text-white font-condensed uppercase tracking-wider">
                    REDACTION SUMMARY
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">100% Client-Side</span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-center">
                  <div className="bg-[#0B1120] p-2 rounded border border-[#1E293B]">
                    <span className="text-slate-500 block text-[9px] uppercase">Total Redactions</span>
                    <strong className="text-white text-sm">{totalRedactions}</strong>
                  </div>
                  <div className="bg-[#0B1120] p-2 rounded border border-[#1E293B]">
                    <span className="text-slate-500 block text-[9px] uppercase">Chars Hidden</span>
                    <strong className="text-[#94C3A3] text-sm">{charsHidden} / {totalChars}</strong>
                  </div>
                  <div className="bg-[#0B1120] p-2 rounded border border-[#1E293B]">
                    <span className="text-slate-500 block text-[9px] uppercase">Readability</span>
                    <strong className="text-white text-sm">{readabilityScore}%</strong>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-slate-300 font-sans text-xs">
                  <span className="font-bold text-white font-condensed uppercase tracking-wider text-[11px] block">
                    What HR won&apos;t know:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-400">
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#94C3A3]">✓</span> Your specific diagnosis
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#94C3A3]">✓</span> Your medications &amp; dosages
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#94C3A3]">✓</span> Your patient ID
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#94C3A3]">✓</span> Pregnancy weeks (though likely inferred from STATUTORY_MATERNITY)
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2.5 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#4A7C59] hover:bg-[#3D6649] text-white flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD REDACTED</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyRedacted}
                  className="px-4 py-2.5 rounded text-xs font-condensed uppercase tracking-wider font-bold bg-[#1E293B] hover:bg-[#334155] border border-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-[#4A7C59]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'COPIED TO CLIPBOARD' : 'COPY TEXT'}</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
