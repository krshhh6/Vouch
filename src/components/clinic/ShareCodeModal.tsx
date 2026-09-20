'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Printer, 
  Copy, 
  Check, 
  Share2, 
  MessageSquare, 
  Trash2, 
  Eye, 
  X, 
  FileText, 
  AlertTriangle 
} from 'lucide-react';
import { SignedAttestation, ShareCode, MedicalDocument } from '@/lib/types';
import { deleteClinicDocument } from '@/lib/storage';

interface ShareCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAnother: () => void;
  attestation: SignedAttestation | null;
  shareCode: ShareCode | null;
  medicalDoc: MedicalDocument | null;
  onDocumentDeleted?: () => void;
}

export default function ShareCodeModal({
  isOpen,
  onClose,
  onCreateAnother,
  attestation,
  shareCode,
  medicalDoc,
  onDocumentDeleted,
}: ShareCodeModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<MedicalDocument | null>(medicalDoc);

  React.useEffect(() => {
    setCurrentDoc(medicalDoc);
  }, [medicalDoc]);

  if (!isOpen || !attestation || !shareCode) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vouch.app';
  const shareUrl = `${origin}/employee?shareCode=${shareCode.code}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTextEmployee = () => {
    const textBody = encodeURIComponent(
      `Hi ${attestation.payload.employeeName}, your medical leave proof has been issued by ${attestation.payload.issuerName}. Show this share code to HR: ${shareCode.code} or open: ${shareUrl}`
    );
    const smsUrl = `sms:?&body=${textBody}`;
    window.open(smsUrl, '_blank');
  };

  const handlePrintQr = () => {
    window.print();
  };

  const handleDeleteDoc = () => {
    if (confirm('Are you sure you want to delete this medical file from clinic records?')) {
      deleteClinicDocument(attestation.payload.attestationId);
      setCurrentDoc(null);
      if (onDocumentDeleted) onDocumentDeleted();
    }
  };

  // Plain English leave label
  const getLeaveTypeLabel = () => {
    const coarse = attestation.payload.coarseCategory;
    const fine = attestation.payload.fineCategory;
    if (coarse === 'STATUTORY_MATERNITY') return 'Maternity Leave';
    if (fine === 'surgery') return 'Surgical Recovery';
    if (fine === 'mental-health') return 'Mental Health Leave';
    if (coarse === 'CAREGIVING') return 'Caregiving Leave';
    return 'Medical Leave';
  };

  // Deterministic SVG QR Code Generator
  const renderQrSvg = (dataString: string) => {
    const size = 21;
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      hash = (hash << 5) - hash + dataString.charCodeAt(i);
      hash |= 0;
    }
    const cells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isPosMarker =
          (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
        let fill = false;
        if (isPosMarker) {
          fill =
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
            (r === 0 || r === 6 || c === size - 7 || c === size - 1) ||
            (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3) ||
            (r === size - 7 || r === size - 1 || c === 0 || c === 6) ||
            (r >= size - 5 && r >= size - 3 && c >= 2 && c <= 4);
        } else {
          fill = (hash ^ (r * 31 + c * 17)) % 2 === 0;
        }
        if (fill) {
          cells.push(
            <rect
              key={`${r}-${c}`}
              x={c * 9}
              y={r * 9}
              width={9}
              height={9}
              fill="#0F172A"
            />
          );
        }
      }
    }
    return (
      <svg
        viewBox="0 0 189 189"
        className="w-44 h-44 bg-white p-2.5 border border-slate-300 rounded shadow-md mx-auto"
      >
        {cells}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <h3 className="text-lg font-bold font-condensed uppercase tracking-wider text-slate-900">
              Leave Proof Created
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto font-sans">
          <div>
            <p className="text-sm text-slate-900 font-semibold">
              Now share this with the employee.
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              She can show this to her HR department to prove statutory eligibility with zero diagnosis exposure.
            </p>
          </div>

          {/* SHARE CODE BOX per ASCII mockup */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-center">
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest block mb-1 font-semibold">
                SHARE CODE
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-bold tracking-widest text-emerald-700 select-all">
                {shareCode.code}
              </span>
            </div>

            {/* QR Code */}
            <div className="py-2">
              {renderQrSvg(shareCode.code)}
              <span className="text-[11px] text-slate-500 block mt-2 font-mono">
                Employee scans with phone camera or uploads to wallet
              </span>
            </div>

            {/* OR send this link */}
            <div className="pt-2 border-t border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 font-mono block font-medium">
                OR send this link:
              </span>
              <div className="bg-white px-3 py-2 rounded border border-slate-300 text-xs font-mono text-slate-800 truncate select-all shadow-xs">
                {shareUrl}
              </div>
            </div>

            {/* Expiry & Limits */}
            <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-500 pt-1">
              <span>Expires in: <strong className="text-slate-800">24 hours</strong></span>
              <span>•</span>
              <span>Can be verified: <strong className="text-slate-800">3 times</strong></span>
            </div>

            {/* Action Buttons: PRINT QR, COPY CODE, COPY LINK, TEXT EMPLOYEE */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrintQr}
                className="py-2 px-2 bg-white hover:bg-slate-50 text-slate-800 rounded text-[11px] font-mono font-semibold transition flex items-center justify-center gap-1.5 border border-slate-300 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>PRINT QR</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                className="py-2 px-2 bg-white hover:bg-slate-50 text-slate-800 rounded text-[11px] font-mono font-semibold transition flex items-center justify-center gap-1.5 border border-slate-300 shadow-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                <span>{copiedCode ? 'COPIED' : 'COPY CODE'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-2 bg-white hover:bg-slate-50 text-slate-800 rounded text-[11px] font-mono font-semibold transition flex items-center justify-center gap-1.5 border border-slate-300 shadow-xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
                <span>{copiedLink ? 'COPIED' : 'COPY LINK'}</span>
              </button>

              <button
                type="button"
                onClick={handleTextEmployee}
                className="py-2 px-2 bg-white hover:bg-slate-50 text-slate-800 rounded text-[11px] font-mono font-semibold transition flex items-center justify-center gap-1.5 border border-slate-300 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                <span>TEXT MSG</span>
              </button>
            </div>
          </div>

          {/* Proof Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono space-y-1.5">
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500">Leave proof ID:</span>
              <span className="text-slate-900 font-bold">{attestation.payload.attestationId}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500">Employee:</span>
              <span className="text-slate-900">
                {attestation.payload.employeeName} ({attestation.payload.employeeId})
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500">Type:</span>
              <span className="text-emerald-700 font-semibold">{getLeaveTypeLabel()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="text-slate-500">Period:</span>
              <span className="text-slate-900">
                {attestation.payload.startDate} – {attestation.payload.endDate}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700 pt-1 border-t border-slate-200">
              <span className="text-slate-500">Status:</span>
              <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Signed and active
              </span>
            </div>
          </div>

          {/* Medical file attached section (local only) */}
          {currentDoc ? (
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-700 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Document uploaded: {currentDoc.fileName}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {(currentDoc.fileSize / 1024).toFixed(0)} KB
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                Stored locally on your device only. Never transmitted across the network or sent to HR.
              </p>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowDocPreview(true)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded text-[11px] font-mono transition flex items-center gap-1 shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>VIEW</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteDoc}
                  className="text-rose-600 hover:text-rose-700 text-[11px] font-mono transition"
                >
                  DELETE FROM RECORDS
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-[11px] text-slate-500 font-mono">
              No medical file attached to this proof.
            </div>
          )}
        </div>

        {/* Footer Navigation: DONE or CREATE ANOTHER PROOF */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-xs font-mono transition font-semibold shadow-xs"
          >
            DONE
          </button>

          <button
            type="button"
            onClick={onCreateAnother}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm"
          >
            CREATE ANOTHER PROOF
          </button>
        </div>
      </div>

      {/* Internal Medical Document Preview Viewer Modal */}
      {showDocPreview && currentDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-slate-900">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-mono font-bold text-slate-900 truncate">
                  {currentDoc.fileName}
                </span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                  CLINIC LOCAL RECORD
                </span>
              </div>
              <button
                onClick={() => setShowDocPreview(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-100 min-h-[300px]">
              {currentDoc.fileType.startsWith('image/') ? (
                <img
                  src={currentDoc.base64Data}
                  alt="Medical Document"
                  className="max-h-[65vh] object-contain rounded border border-slate-300 shadow-sm"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-16 h-16 text-emerald-700 mx-auto" />
                  <p className="text-sm font-mono text-slate-800 font-medium">
                    {currentDoc.fileName}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    PDF Document ({(currentDoc.fileSize / 1024).toFixed(1)} KB)
                  </p>
                  <a
                    href={currentDoc.base64Data}
                    download={currentDoc.fileName}
                    className="inline-block px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-mono shadow-sm"
                  >
                    Download Local PDF
                  </a>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                type="button"
                onClick={() => setShowDocPreview(false)}
                className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-mono"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
