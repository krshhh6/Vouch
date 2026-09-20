'use client';

import { useState } from 'react';
import { SignedAttestation, ShareCode, HRPublicPayload } from '@/lib/types';
import { saveShareCode } from '@/lib/storage';
import { 
  computeIssuerRefHash, 
  padPayloadToUniformLength 
} from '@/lib/crypto';
import { 
  getRuleByCoarseCategory, 
  validateAndEnforcePolicy, 
  VOUCH_POLICY_SPEC 
} from '@/lib/policy';
import LeakageMeter from './LeakageMeter';
import { 
  X, 
  Share2, 
  ShieldCheck, 
  Copy, 
  Check, 
  Clock, 
  ExternalLink, 
  Lock, 
  Sparkles,
  Scale,
  FileCheck2,
  AlertOctagon
} from 'lucide-react';
import Link from 'next/link';

interface ShareModalProps {
  attestation: SignedAttestation;
  onClose: () => void;
  onCreated?: (shareCode: ShareCode) => void;
}

export default function ShareModal({ attestation, onClose, onCreated }: ShareModalProps) {
  const { payload } = attestation;
  const coarseCategory = payload.coarseCategory;
  const policyRule = getRuleByCoarseCategory(coarseCategory);

  const [expiryHours, setExpiryHours] = useState<number>(48);
  const [recipient, setRecipient] = useState<string>('Company HR / Benefits Admin');
  const [generatedCode, setGeneratedCode] = useState<ShareCode | null>(null);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Calculate duration in days
  const s = new Date(payload.startDate);
  const e = new Date(payload.endDate);
  const durationDays = Math.ceil(Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const generateCodeString = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `LG-${num}`;
  };

  const handleGenerate = async () => {
    try {
      setPolicyError(null);
      const codeStr = generateCodeString();
      const expiresAt = new Date(Date.now() + expiryHours * 3600 * 1000).toISOString();

      // FIX 0a: Compute opaque salted issuer reference hash
      const issuerRefHash = await computeIssuerRefHash(payload.issuerRegNumber);

      // FIX 0a & FIX 0b: Strict minimal payload destined for HR
      const hrPublicPayload: HRPublicPayload = {
        attestationId: payload.attestationId,
        coarseCategory: payload.coarseCategory,
        validFrom: payload.startDate,
        validTo: payload.endDate,
        expectedReturnDate: payload.expectedReturnDate,
        issuerIsLicensed: true,
        issuerRefHash,
        fitForDuty: payload.fitForDuty,
        fitForDutyAccommodationsPresent: !!payload.fitForDutyNotes
      };

      // F5: Enforce policy rules at runtime (throws if forbidden keys are present)
      validateAndEnforcePolicy(hrPublicPayload as unknown as Record<string, unknown>, policyRule);

      // F4: Pad payload to uniform byte length
      const paddedPayload = padPayloadToUniformLength(hrPublicPayload, 1024);

      const newShareCode: ShareCode = {
        code: codeStr,
        attestationId: payload.attestationId,
        signedAttestation: attestation,
        policyVersion: VOUCH_POLICY_SPEC.policyVersion,
        policyRuleId: policyRule.id,
        hrPayload: paddedPayload,
        createdAt: new Date().toISOString(),
        expiresAt,
        isRevoked: false,
        viewCount: 0,
        intendedRecipient: recipient.trim() || 'HR Benefits Department',
        paddedByteLength: 1024
      };

      saveShareCode(newShareCode);
      setGeneratedCode(newShareCode);
      if (onCreated) onCreated(newShareCode);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Policy validation failure';
      setPolicyError(msg);
    }
  };

  const copyToClipboard = (text: string, isLink = false) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareUrl = typeof window !== 'undefined' && generatedCode 
    ? `${window.location.origin}/hr?code=${generatedCode.code}`
    : `/hr?code=${generatedCode?.code || ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-sans">Generate Policy-Constrained Share Code</h3>
              <p className="text-xs text-slate-500 font-sans">
                Statutory Policy: <strong className="text-slate-800">{policyRule.source}</strong> ({VOUCH_POLICY_SPEC.policyVersion})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white font-sans">
          {!generatedCode ? (
            <>
              {/* Policy Mapping Notice */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <Scale className="w-4 h-4 text-slate-600" />
                    Statutory Claim-Set Mapping
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {coarseCategory}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Your wallet holds the clinical record (<em>{payload.fineCategory}</em>). Under statutory policy <strong>{policyRule.id}</strong>, this is collapsed into coarse public category <strong className="text-slate-900">{coarseCategory}</strong> with <strong>zero clinic names or diagnoses disclosed</strong>.
                </p>
              </div>

              {/* F4 Leakage Meter Component */}
              <LeakageMeter
                coarseCategory={coarseCategory}
                fineCategory={payload.fineCategory}
                startDate={payload.startDate}
                endDate={payload.endDate}
                durationDays={durationDays}
              />

              {/* Expiration Settings */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Code Expiration Window
                </span>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { hours: 1, label: '1 Hour', sub: 'Single HR review' },
                    { hours: 48, label: '48 Hours', sub: 'Standard window' },
                    { hours: 168, label: '7 Days', sub: 'Extended window' },
                  ].map((opt) => (
                    <button
                      key={opt.hours}
                      type="button"
                      onClick={() => setExpiryHours(opt.hours)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        expiryHours === opt.hours
                          ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold font-sans uppercase tracking-wider">{opt.label}</div>
                      <div className={`text-[10px] mt-0.5 ${expiryHours === opt.hours ? 'text-blue-800' : 'text-slate-500'}`}>{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 font-sans uppercase tracking-wider">
                  Intended Recipient (Audit Trail Label)
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Acme Corp People & Culture Team"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Policy Error if any */}
              {policyError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2 font-mono">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p>{policyError}</p>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all font-sans uppercase tracking-wider"
                >
                  <Lock className="w-4 h-4" />
                  <span>Enforce Policy & Generate Share Code</span>
                </button>
              </div>
            </>
          ) : (
            /* Generated Code Display */
            <div className="space-y-6 py-2">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 uppercase font-sans tracking-wider">Your HR Share Code</p>
                  <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-widest my-2">
                    {generatedCode.code}
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    Padded to {generatedCode.paddedByteLength} bytes • Valid for {expiryHours} hours
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3 font-sans uppercase tracking-wider text-xs">
                  <button
                    onClick={() => copyToClipboard(generatedCode.code)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 shadow-xs transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(shareUrl, true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 shadow-xs transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <ExternalLink className="w-4 h-4" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy HR Direct Link'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 font-sans uppercase tracking-wider">Test Verification as HR</h4>
                  <p className="text-[11px] text-slate-500 font-sans">Test how HR cryptographically verifies this code right now</p>
                </div>

                <Link
                  href={`/hr?code=${generatedCode.code}`}
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors font-sans uppercase tracking-wider shadow-sm"
                >
                  <span>Open HR Verifier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 bg-white border border-slate-300 shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
