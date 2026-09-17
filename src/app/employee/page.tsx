'use client';

import { useState, useEffect } from 'react';
import { SignedAttestation, ShareCode, EntitlementRecord, HRPublicPayload } from '@/lib/types';
import { 
  getAttestations, 
  getShareCodes, 
  revokeShareCode, 
  getEntitlementLedger,
  saveShareCode,
  subscribeToStateChange 
} from '@/lib/storage';
import { computeEmployerPseudonym, padPayloadToUniformLength, computeIssuerRefHash } from '@/lib/crypto';
import { VOUCH_POLICY_SPEC, getRuleByCoarseCategory, validateAndEnforcePolicy } from '@/lib/policy';
import AttestationCard from '@/components/AttestationCard';
import ShareModal from '@/components/ShareModal';
import ReceiptChainViewer from '@/components/ReceiptChainViewer';
import { 
  UserCheck, 
  ShieldCheck, 
  Share2, 
  Radio, 
  Key, 
  Sparkles, 
  Clock, 
  EyeOff, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle,
  FileText,
  Lock,
  PieChart,
  CalendarHeart,
  Scale,
  Link2
} from 'lucide-react';
import Link from 'next/link';

export default function EmployeePage() {
  const [activeTab, setActiveTab] = useState<'attestations' | 'entitlements' | 'shares' | 'audit'>('attestations');
  const [attestations, setAttestations] = useState<SignedAttestation[]>([]);
  const [shareCodes, setShareCodes] = useState<ShareCode[]>([]);
  const [entitlements, setEntitlements] = useState<EntitlementRecord[]>([]);
  const [sharingAttestation, setSharingAttestation] = useState<SignedAttestation | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selfDeclaredSuccess, setSelfDeclaredSuccess] = useState<ShareCode | null>(null);

  const loadData = () => {
    setAttestations(getAttestations());
    setShareCodes(getShareCodes());
    setEntitlements(getEntitlementLedger());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStateChange(loadData);
    return () => unsubscribe();
  }, []);

  const handleRevoke = (code: string) => {
    if (confirm(`Are you sure you want to revoke share code ${code}? HR will immediately lose access.`)) {
      revokeShareCode(code);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // F5: Pure Self-Declaration Menstrual Leave Flow (Zero Doctor Certificate)
  const handleSelfDeclaredMenstrualLeave = async () => {
    const today = new Date().toISOString().split('T')[0];
    const rule = getRuleByCoarseCategory('SELF_DECLARED');
    const codeStr = `LG-SELF-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const dummyRefHash = await computeIssuerRefHash('SELF_DECLARED_NO_CLINICIAN');

    const hrPayload: HRPublicPayload = {
      attestationId: `SELF-DECL-${Date.now().toString().slice(-6)}`,
      coarseCategory: 'SELF_DECLARED',
      validFrom: today,
      validTo: today,
      expectedReturnDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
      issuerIsLicensed: true,
      issuerRefHash: dummyRefHash,
      fitForDuty: 'full-rest',
      fitForDutyAccommodationsPresent: false
    };

    validateAndEnforcePolicy(hrPayload as unknown as Record<string, unknown>, rule);
    const padded = padPayloadToUniformLength(hrPayload, 1024);

    const dummyAttestation: SignedAttestation = {
      payload: {
        attestationId: hrPayload.attestationId,
        employeeName: 'Sarah Jenkins',
        fineCategory: 'menstrual',
        coarseCategory: 'SELF_DECLARED',
        fitForDuty: 'full-rest',
        startDate: today,
        endDate: today,
        expectedReturnDate: hrPayload.expectedReturnDate,
        issuerId: 'self-declared',
        issuerName: 'Employee Self-Declaration (No Clinician)',
        doctorName: 'Self-Declared Statutory Right',
        issuerRegNumber: 'STATUTORY_SELF_DECLARATION',
        issuedAt: new Date().toISOString()
      },
      signatureBase64: 'SELF_DECLARED_FLOW_NO_CLINICAL_SIGNATURE_REQUIRED',
      signatureHex: '00',
      publicKeyJwk: {},
      publicKeyHex: '00',
      createdAt: new Date().toISOString()
    };

    const newShareCode: ShareCode = {
      code: codeStr,
      attestationId: hrPayload.attestationId,
      signedAttestation: dummyAttestation,
      policyVersion: VOUCH_POLICY_SPEC.policyVersion,
      policyRuleId: rule.id,
      hrPayload: padded,
      createdAt: new Date().toISOString(),
      expiresAt,
      isRevoked: false,
      viewCount: 0,
      intendedRecipient: 'Company HR Department',
      paddedByteLength: 1024
    };

    saveShareCode(newShareCode);
    setSelfDeclaredSuccess(newShareCode);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Employee Identity Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider font-condensed">Credential Holder</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-700 font-mono">
                Self-Sovereign Vault
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-0.5 font-sans">Employee Credential Vault</h1>
            <p className="text-xs text-zinc-400 font-sans">
              Manage your signed attestations, policy quotas, and selective disclosure share codes.
            </p>
          </div>
        </div>

        {/* Quick Sandbox Link */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            href="/employee/redact"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors font-condensed uppercase tracking-wider"
          >
            <EyeOff className="w-4 h-4 text-zinc-300" />
            <span>Redaction Lab</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-1 overflow-x-auto font-condensed uppercase tracking-wider text-xs">
        <button
          onClick={() => setActiveTab('attestations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
            activeTab === 'attestations'
              ? 'bg-white text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>My Attestations ({attestations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('entitlements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
            activeTab === 'entitlements'
              ? 'bg-white text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Policy Quotas (F1 Ledger)</span>
        </button>

        <button
          onClick={() => setActiveTab('shares')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
            activeTab === 'shares'
              ? 'bg-white text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Active HR Shares ({shareCodes.filter(s => !s.isRevoked).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
            activeTab === 'audit'
              ? 'bg-white text-black shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Link2 className="w-4 h-4 text-zinc-300" />
          <span>Receipt Hash Chain (F3)</span>
        </button>
      </div>

      {/* Tab 1: Attestations List + Pure Self-Declaration Flow */}
      {activeTab === 'attestations' && (
        <div className="space-y-6">
          
          {/* F5: Pure Self-Declaration Callout */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0 mt-0.5">
                <CalendarHeart className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm font-condensed uppercase tracking-wider">Self-Declared Menstrual Leave</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 font-mono border border-zinc-700">
                    Policy F5 • No Doctor Note
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl font-sans">
                  <strong>Deliberate Product Decision:</strong> State and workplace policies that work deliberately require <em>zero doctor certificates</em>. Demanding a clinician note for recurring menstrual rest creates surveillance and doctor fees. Generate a pure self-declared share code directly.
                </p>
              </div>
            </div>

            <button
              onClick={handleSelfDeclaredMenstrualLeave}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold shadow-sm transition-all shrink-0 self-start md:self-auto font-condensed uppercase tracking-wider"
            >
              Issue Self-Declared 1-Day Leave
            </button>
          </div>

          {/* Self-Declared Success Toast */}
          {selfDeclaredSuccess && (
            <div className="p-4 rounded-xl bg-black border border-zinc-700 text-zinc-200 text-xs flex items-center justify-between">
              <div>
                <strong>Self-Declared Leave Generated:</strong> Share Code <span className="font-mono text-white font-bold">{selfDeclaredSuccess.code}</span> ready for HR.
              </div>
              <Link
                href={`/hr?code=${selfDeclaredSuccess.code}`}
                className="px-3 py-1 bg-white hover:bg-zinc-200 text-black rounded-lg font-semibold font-condensed uppercase tracking-wider text-xs"
              >
                Test in HR
              </Link>
            </div>
          )}

          {attestations.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <ShieldCheck className="w-12 h-12 text-zinc-600 mx-auto opacity-50" />
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base font-condensed uppercase tracking-wider">No Attestations in Vault</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto font-sans">
                  Ask your doctor or visit the Clinic Issuer Studio to generate a signed Web Crypto attestation.
                </p>
              </div>
              <Link
                href="/issuer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold font-condensed uppercase tracking-wider"
              >
                Go to Issuer Studio
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {attestations.map((att) => (
                <AttestationCard
                  key={att.payload.attestationId}
                  attestation={att}
                  onShareClick={(a) => setSharingAttestation(a)}
                  showShareButton={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: F1 Policy Entitlements & Quotas */}
      {activeTab === 'entitlements' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-2xl">
            <div>
              <h3 className="font-bold text-white text-base font-condensed uppercase tracking-wider">Your Statutory Policy Entitlements & Remaining Quotas</h3>
              <p className="text-xs text-zinc-400 font-sans">
                <strong>Privacy Guarantee:</strong> These exact day counters and prior leave histories are visible <em>only in your private wallet</em>. HR sees 4 pass/fail predicate booleans and never learns your remaining days.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {VOUCH_POLICY_SPEC.rules.map((rule) => {
                const ent = entitlements.find(e => e.coarseCategory === rule.coarseCategory);
                const taken = ent ? ent.daysTakenYTD : 0;
                const max = rule.maxDays;
                const remaining = Math.max(0, max - taken);
                const pct = Math.min(100, Math.round((taken / max) * 100));

                return (
                  <div
                    key={rule.id}
                    className="p-5 rounded-xl bg-black border border-zinc-800 space-y-3 font-sans text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm font-mono">{rule.coarseCategory}</h4>
                        <p className="text-[11px] text-zinc-400">{rule.source}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {rule.id}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">Days Taken YTD: <strong className="text-white">{taken} days</strong></span>
                        <span className="text-zinc-400">Remaining: <strong className="text-white font-mono">{remaining} days</strong></span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 italic">
                      {rule.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Active Share Codes */}
      {activeTab === 'shares' && (
        <div className="space-y-6">
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base font-condensed uppercase tracking-wider">Active & Revoked Share Codes</h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Manage the policy-padded codes generated for HR. Revoke them anytime.
                </p>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {shareCodes.filter(s => !s.isRevoked).length} Active Codes
              </span>
            </div>

            {shareCodes.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-8 font-sans">
                No share codes created yet. Open &quot;My Attestations&quot; and click &quot;Generate Selective Share Code&quot;.
              </p>
            ) : (
              <div className="space-y-3">
                {shareCodes.map((s) => {
                  const isExpired = new Date(s.expiresAt).getTime() < Date.now();
                  const isDead = s.isRevoked || isExpired;

                  return (
                    <div
                      key={s.code}
                      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isDead 
                          ? 'bg-black border-zinc-900 opacity-60' 
                          : 'bg-black border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold font-mono tracking-widest text-white">
                            {s.code}
                          </span>
                          {s.isRevoked ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-zinc-500 border border-zinc-800">
                              REVOKED
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-zinc-400 border border-zinc-800">
                              EXPIRED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-white border border-zinc-700">
                              ACTIVE (PADDED)
                            </span>
                          )}
                          <span className="text-xs text-zinc-500 font-mono">
                            Policy: {s.policyVersion}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-sans">
                          <span>Recipient: <strong className="text-zinc-200">{s.intendedRecipient}</strong></span>
                          <span>•</span>
                          <span>Views: <strong className="text-zinc-200">{s.viewCount || 0}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires: {new Date(s.expiresAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto font-condensed uppercase tracking-wider text-xs">
                        {!isDead && (
                          <>
                            <button
                              onClick={() => copyCode(s.code)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-800 transition-colors"
                            >
                              {copiedCode === s.code ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedCode === s.code ? 'Copied' : 'Copy'}</span>
                            </button>

                            <Link
                              href={`/hr?code=${s.code}`}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-xs font-semibold text-black transition-colors"
                            >
                              <span>Test as HR</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleRevoke(s.code)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-colors"
                              title="Revoke access immediately"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Revoke</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Real-Time Hash Chain Receipt Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <ReceiptChainViewer
            title="Your Immutable Tamper-Evident Access Log"
            subtitle="Walk the hash chain to see every verified access event with zero health disclosures"
          />
        </div>
      )}

      {/* Share Modal */}
      {sharingAttestation && (
        <ShareModal
          attestation={sharingAttestation}
          onClose={() => setSharingAttestation(null)}
          onCreated={() => loadData()}
        />
      )}

    </div>
  );
}
