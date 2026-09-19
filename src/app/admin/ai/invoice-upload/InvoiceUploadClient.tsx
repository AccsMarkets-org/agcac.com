'use client';
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Upload, FileText, CheckCircle, AlertTriangle, Brain, Clock,
  X, Eye, ChevronRight, Info
} from 'lucide-react';

interface UploadResult {
  docId: string;
  documentId: string;
  processingStatus: string;
  confidence: number;
  documentType: string;
  warningCount: number;
  ocrProvider: string;
  message: string;
}

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp,.tiff';
const MAX_MB = 20;

export default function InvoiceUploadClient({ canUpload, userRole }: { canUpload: boolean; userRole: string }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) selectFile(dropped);
  }, []);

  const selectFile = (f: File) => {
    setError('');
    setResult(null);
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_MB}MB.`);
      return;
    }
    setFile(f);
  };

  const upload = async () => {
    if (!file || !canUpload) return;
    setUploading(true);
    setError('');
    setResult(null);

    try {
      setProgress(10); setProgressLabel('Uploading file…');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('notes', notes);
      fd.append('source', 'Manual');

      setProgress(30); setProgressLabel('Running OCR scan…');
      const res = await fetch('/api/admin/ai/upload-document', { method: 'POST', body: fd });
      setProgress(70); setProgressLabel('AI extracting invoice data…');

      const data = await res.json();
      setProgress(90); setProgressLabel('Running validation…');

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }

      setProgress(100); setProgressLabel('Done!');
      setResult(data);
    } catch (e) {
      setError(`Upload error: ${String(e)}`);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setNotes('');
    setResult(null);
    setError('');
    setProgress(0);
    setProgressLabel('');
  };

  if (!canUpload) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="font-bold text-red-800 text-lg">Access Restricted</h2>
          <p className="text-red-600 text-sm mt-1">Document upload requires Accountant, Tax Manager, or Admin role. Your role: {userRole}</p>
        </div>
      </div>
    );
  }

  const confidenceColor = (c: number) => c >= 85 ? 'text-green-600' : c >= 60 ? 'text-amber-600' : 'text-red-600';
  const confidenceBg = (c: number) => c >= 85 ? 'bg-green-100' : c >= 60 ? 'bg-amber-100' : 'bg-red-100';

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Upload className="w-6 h-6 text-purple-600" />
          AI Invoice Upload
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload an invoice, receipt, or tax document. AI will scan, extract, and validate all fields automatically.
        </p>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          <strong>Supported:</strong> PDF (text), JPG, PNG, WebP. OCR accuracy is higher for clear, high-resolution images.
          After upload, an AI review task is created for accountant approval before any tax entry is posted.
        </p>
      </div>

      {!result ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
            }`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-10 h-10 text-purple-500" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{file.name}</div>
                  <div className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)}KB · {file.type}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); setFile(null); setError(''); }} className="ml-2 text-gray-400 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Brain className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <div className="font-semibold text-gray-700">Drop your invoice here</div>
                <div className="text-sm text-gray-400 mt-1">or click to browse files</div>
                <div className="text-xs text-gray-400 mt-2">PDF, JPG, PNG, WebP · Max {MAX_MB}MB</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden" onChange={e => { if (e.target.files?.[0]) selectFile(e.target.files[0]); }} />

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. HVAC material purchase from supplier, belongs to project ABC…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {progressLabel}</span>
                <span className="text-purple-600 font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={upload}
            disabled={!file || uploading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Brain className="w-4 h-4" />
            {uploading ? 'Processing…' : 'Upload & Process with AI'}
          </button>
        </div>
      ) : (
        /* Result card */
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Document Processed</h2>
              <p className="text-sm text-gray-500">ID: {result.docId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="text-xs text-gray-400 mb-0.5">Document Type</div>
              <div className="font-semibold text-gray-900 text-sm">{result.documentType}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="text-xs text-gray-400 mb-0.5">Status</div>
              <div className="font-semibold text-gray-900 text-sm">{result.processingStatus}</div>
            </div>
            <div className={`p-3 rounded-xl ${confidenceBg(result.confidence)}`}>
              <div className="text-xs text-gray-500 mb-0.5">AI Confidence</div>
              <div className={`font-bold text-lg ${confidenceColor(result.confidence)}`}>{result.confidence.toFixed(0)}%</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="text-xs text-gray-400 mb-0.5">Validation Issues</div>
              <div className={`font-semibold text-sm ${result.warningCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {result.warningCount > 0 ? `${result.warningCount} warning(s)` : 'None found'}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
            {result.message}
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/ai/review-center"
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              <Eye className="w-4 h-4" />
              Review Document
              <ChevronRight className="w-4 h-4" />
            </Link>
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* AI Agents info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">AI Agents Active</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            'Document Classifier',
            'Invoice Reader',
            'Tax Validation Agent',
            'Duplicate Detection Agent',
            'Supplier Matching Agent',
            'Accounting Category Agent',
            'Payment Detection Agent',
          ].map(agent => (
            <div key={agent} className="flex items-center gap-2 text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {agent}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
