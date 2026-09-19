'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Stethoscope, Mail, CheckCircle2, X, Shield, ArrowRight } from 'lucide-react';
import { ClinicProfile } from '@/lib/types';
import { saveClinicProfile, getClinicProfile } from '@/lib/storage';

interface ClinicSetupProps {
  isOpen?: boolean;
  isModal?: boolean;
  onClose?: () => void;
  onSaved: (profile: ClinicProfile) => void;
  initialProfile?: ClinicProfile;
}

export default function ClinicSetup({
  isOpen = true,
  isModal = false,
  onClose,
  onSaved,
  initialProfile,
}: ClinicSetupProps) {
  const [formData, setFormData] = useState<ClinicProfile>({
    doctorName: 'Dr. Elena Rostova',
    clinicName: "Summit Women's Health Center",
    regNumber: 'GMC-6849201',
    email: 'dr.elena@summit-health.com',
    isSetup: false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setFormData(initialProfile);
    } else {
      const current = getClinicProfile();
      setFormData(current);
    }
  }, [initialProfile, isOpen]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: ClinicProfile = {
      ...formData,
      isSetup: true,
      setupAt: new Date().toISOString(),
    };
    saveClinicProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      onSaved(updated);
      if (onClose) onClose();
    }, 900);
  };

  const handleSkip = () => {
    const updated: ClinicProfile = {
      ...formData,
      isSetup: true,
      setupAt: new Date().toISOString(),
    };
    saveClinicProfile(updated);
    onSaved(updated);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const content = (
    <div className="w-full bg-[#111C2E] border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 bg-[#0B1322] border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              VOUCH CLINIC PORTAL
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              Quick Setup
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-condensed uppercase tracking-wide mt-0.5">
            Sign medical leave proofs
          </h2>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-5">
        {savedSuccess ? (
          /* Post-save Display as specified in prompt */
          <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-600/50 space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold font-condensed uppercase tracking-wider text-white">
                Your clinic is registered!
              </h3>
            </div>
            <div className="space-y-1.5 text-xs font-mono text-slate-300 pl-8">
              <p>
                <span className="text-slate-500">Clinic:</span> {formData.clinicName}
              </p>
              <p>
                <span className="text-slate-500">Email:</span> {formData.email}
              </p>
              <p>
                <span className="text-slate-500">License:</span> {formData.regNumber}
              </p>
              <p className="text-emerald-400 pt-1">
                <span className="text-slate-500">Status:</span> ✓ Ready to sign leave proofs
              </p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm text-slate-300">
                Welcome! Let's set up your clinic in 30 seconds.
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                This identity signs cryptographic attestations for employees with mathematical certainty.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 bg-[#0D1626] p-5 rounded-lg border border-slate-800">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                CLINIC INFORMATION
              </div>

              {/* Clinic / Doctor Name */}
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  Clinic / Doctor Name: *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.clinicName}
                    onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                    placeholder="Summit Women's Health Center"
                    className="w-full pl-9 pr-3 py-2 bg-[#090F1B] border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* License Number */}
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  License Number (NMC/Medical Council): *
                </label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.regNumber}
                    onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                    placeholder="GMC-6849201"
                    className="w-full pl-9 pr-3 py-2 bg-[#090F1B] border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  (This helps verify you're registered)
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1">
                  Email: *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="dr.elena@summit-health.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#090F1B] border border-slate-700 rounded-md text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition font-mono"
                >
                  SKIP FOR NOW
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md"
                >
                  <span>SAVE & CONTINUE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-lg">{content}</div>
      </div>
    );
  }

  return <div className="w-full mb-6">{content}</div>;
}
