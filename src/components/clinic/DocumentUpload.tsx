'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, FileText, CheckCircle2, Trash2, X, AlertCircle } from 'lucide-react';
import { MedicalDocument } from '@/lib/types';

interface DocumentUploadProps {
  attestationId?: string;
  onUpload: (doc: MedicalDocument) => void;
  onClear?: () => void;
  currentDoc?: MedicalDocument | null;
}

export default function DocumentUpload({
  attestationId = 'temp',
  onUpload,
  onClear,
  currentDoc = null,
}: DocumentUploadProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks on unmount or when camera deactivated
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const handleStartCamera = async () => {
    setCameraError(null);
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      // Connect stream to video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.error('Video play error:', err);
          });
        }
      }, 100);
    } catch (err: any) {
      console.warn('Camera stream could not be started:', err);
      setCameraError(err?.message || 'Unable to open camera. Please use file upload below.');
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);

    stopCameraStream();

    const timestamp = Date.now();
    const doc: MedicalDocument = {
      id: `doc_${timestamp}_${Math.random().toString(36).substring(2, 6)}`,
      attestationId,
      fileName: `Medical_Photo_${new Date().toISOString().split('T')[0]}.jpg`,
      fileType: 'image/jpeg',
      fileSize: Math.round(base64.length * 0.75),
      base64Data: base64,
      uploadedAt: new Date().toISOString(),
      notes: 'Captured via clinic camera station',
    };

    onUpload(doc);
  };

  const handleProcessFile = (file: File) => {
    setErrorMessage(null);
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported format. Please upload a JPG, PNG, or PDF file.');
      return;
    }

    if (file.size > maxSize) {
      setErrorMessage('File exceeds size limit of 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const doc: MedicalDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        attestationId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        base64Data: base64,
        uploadedAt: new Date().toISOString(),
      };
      onUpload(doc);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file from disk.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="border border-dashed border-slate-700 rounded-xl p-5 bg-[#141E2E]/80 transition-all hover:border-slate-600">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 font-condensed">
              Attach Medical Proof (Optional but helpful)
            </h3>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              LOCAL ONLY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Take a photo or upload the clinical document to keep in your clinic records. This is
            stored locally on your device and <strong className="text-slate-200">never sent to HR</strong>.
          </p>
        </div>
      </div>

      {/* Bulleted medical document checklist */}
      <div className="bg-[#0F172A]/70 rounded-lg p-2.5 mb-4 border border-slate-800 text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
        <span className="text-slate-500 font-mono text-[10px] uppercase">Supported records:</span>
        <span className="text-slate-300">• Doctor's note</span>
        <span className="text-slate-300">• Prescription sheet</span>
        <span className="text-slate-300">• Lab report</span>
        <span className="text-slate-300">• Ultrasound report</span>
        <span className="text-slate-300">• Clinical certificate</span>
      </div>

      {errorMessage && (
        <div className="mb-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Live Camera Viewfinder */}
      {isCameraActive && (
        <div className="mb-4 rounded-lg overflow-hidden border border-emerald-500/40 bg-black relative">
          <div className="relative aspect-video w-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Camera Viewfinder Crosshairs */}
            <div className="absolute inset-4 border border-white/20 rounded pointer-events-none flex items-center justify-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 bg-black/50 px-2 py-0.5 rounded">
                Align Medical Document
              </span>
            </div>
          </div>
          <div className="p-3 bg-[#0F172A] border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={stopCameraStream}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-[#1E293B] border border-slate-700 rounded-md transition"
            >
              Cancel Camera
            </button>
            <button
              type="button"
              onClick={handleCaptureSnapshot}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition flex items-center gap-1.5 shadow-sm"
            >
              <Camera className="w-3.5 h-3.5" />
              Capture Photo
            </button>
          </div>
        </div>
      )}

      {/* Active Document Preview */}
      {currentDoc ? (
        <div className="p-3.5 rounded-lg bg-[#0F172A] border border-emerald-700/40 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {currentDoc.fileType.startsWith('image/') ? (
                <div className="w-12 h-12 rounded bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={currentDoc.base64Data}
                    alt="Medical preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-mono font-medium text-slate-100 truncate">
                  {currentDoc.fileName}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>{formatFileSize(currentDoc.fileSize)}</span>
                  <span>•</span>
                  <span className="text-emerald-400">Ready for clinic records</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onClear && onClear()}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded transition"
              title="Remove document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Document attached
            </span>
            <button
              type="button"
              onClick={() => onClear && onClear()}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline font-mono"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        /* Action Buttons: Take Photo or Upload File */
        !isCameraActive && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`space-y-2.5 transition-all ${
              dragActive ? 'border-2 border-emerald-500 bg-emerald-950/20 rounded-lg p-3' : ''
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleStartCamera}
                className="py-2.5 px-3 rounded-lg border border-emerald-600/50 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 hover:text-white transition flex items-center justify-center gap-2 text-xs font-medium"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>📱 Take Photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-lg border border-slate-700 bg-[#0F172A] text-slate-200 hover:bg-slate-800 hover:text-white transition flex items-center justify-center gap-2 text-xs font-medium"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                <span>📄 Upload File</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {cameraError && (
              <p className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-800/40 p-2 rounded">
                Note: {cameraError}
              </p>
            )}
          </div>
        )
      )}

      {/* Security note footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
        <span>✓ File stored locally on your device only. Never sent to HR.</span>
      </div>
    </div>
  );
}
