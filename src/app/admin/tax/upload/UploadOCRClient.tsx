'use client';
import { useState, useRef } from 'react';
import { Upload, ScanLine, CheckCircle, AlertTriangle, FileText, RotateCcw, Save, Eye, EyeOff } from 'lucide-react';

interface OCRData {
  success: boolean;
  ocrError: string | null;
  ocrProvider: string;
  confidence: number;
  rawText: string;
  ocrResultId: string;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dateOfSupply: string | null;
  supplierName: string | null;
  supplierTRN: string | null;
  customerName: string | null;
  customerTRN: string | null;
  subtotal: number | null;
  vatRate: number | null;
  vatAmount: number | null;
  totalAmount: number | null;
  currency: string;
  paymentTerms: string | null;
  poNumber: string | null;
}

interface EditableFields {
  invoiceType: 'purchase' | 'sales';
  supplierName: string;
  supplierTRN: string;
  customerName: string;
  customerTRN: string;
  invoiceNumber: string;
  invoiceDate: string;
  netAmount: string;
  vatAmount: string;
  totalAmount: string;
  vatRate: string;
  notes: string;
}

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

export default function UploadOCRClient({ userEmail, userRole }: { userEmail: string; userRole: string }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ocring, setOcring] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const [ocr, setOcr] = useState<OCRData | null>(null);
  const [fields, setFields] = useState<EditableFields | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [ocrWarning, setOcrWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    const mime = f.type;
    const okMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    const okExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    if (!okMime.includes(mime) && !okExt.includes(ext)) {
      return `Unsupported file type "${f.name}". Please upload a JPG, PNG, WebP, or PDF.`;
    }
    if (f.size > 20 * 1024 * 1024) return 'File is too large. Maximum size is 20 MB.';
    if (f.size === 0) return 'File is empty.';
    return null;
  };

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) { setUploadError(err); return; }
    setFile(f);
    setUploadError(null);
    setOcr(null);
    setFields(null);
    setSaved(false);
    setFileUrl(null);
    setOcrWarning(null);
    setDocId(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUploadAndOCR = async () => {
    if (!file) return;
    setUploadError(null);
    setOcrWarning(null);
    setUploading(true);

    // ── 1. Upload ──────────────────────────────────────────────────────────
    let uploadData: { id: string; fileUrl: string; fileType: string };
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/tax/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) {
        setUploadError(json.error ?? 'Upload failed. Please try again.');
        setUploading(false);
        return;
      }
      uploadData = { id: json.id, fileUrl: json.fileUrl, fileType: json.fileType };
      setDocId(json.id);
      setFileUrl(json.fileUrl);
    } catch {
      setUploadError('Network error during upload. Check your connection.');
      setUploading(false);
      return;
    }

    setUploading(false);
    setOcring(true);

    // ── 2. OCR ────────────────────────────────────────────────────────────
    try {
      const res = await fetch('/api/admin/tax/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: uploadData.id }),
      });
      const json: OCRData = await res.json();

      if (!res.ok) {
        setOcrWarning((json as { error?: string }).error ?? 'OCR request failed.');
        setOcring(false);
        return;
      }

      setOcr(json);

      if (json.ocrError) {
        setOcrWarning(json.ocrError);
      }

      // Pre-fill editable fields from OCR output
      setFields({
        invoiceType: 'purchase',
        supplierName: json.supplierName ?? '',
        supplierTRN: json.supplierTRN ?? '',
        customerName: json.customerName ?? '',
        customerTRN: json.customerTRN ?? '',
        invoiceNumber: json.invoiceNumber ?? '',
        invoiceDate: json.invoiceDate ?? '',
        netAmount: json.subtotal != null ? String(json.subtotal) : '',
        vatAmount: json.vatAmount != null ? String(json.vatAmount) : '',
        totalAmount: json.totalAmount != null ? String(json.totalAmount) : '',
        vatRate: json.vatRate != null ? String(json.vatRate) : '5',
        notes: '',
      });
    } catch {
      setOcrWarning('Network error during OCR scan. The file was uploaded — you can try scanning again.');
    } finally {
      setOcring(false);
    }
  };

  const rerunOCR = async () => {
    if (!docId) return;
    setOcrWarning(null);
    setOcring(true);
    try {
      const res = await fetch('/api/admin/tax/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId }),
      });
      const json: OCRData = await res.json();
      setOcr(json);
      if (json.ocrError) setOcrWarning(json.ocrError);
      if (fields && json.success) {
        setFields(prev => prev ? {
          ...prev,
          supplierName: prev.supplierName || json.supplierName || '',
          supplierTRN: prev.supplierTRN || json.supplierTRN || '',
          invoiceNumber: prev.invoiceNumber || json.invoiceNumber || '',
          invoiceDate: prev.invoiceDate || json.invoiceDate || '',
          netAmount: prev.netAmount || (json.subtotal != null ? String(json.subtotal) : ''),
          vatAmount: prev.vatAmount || (json.vatAmount != null ? String(json.vatAmount) : ''),
          totalAmount: prev.totalAmount || (json.totalAmount != null ? String(json.totalAmount) : ''),
        } : prev);
      }
    } catch {
      setOcrWarning('Re-scan failed. Please try again.');
    } finally {
      setOcring(false);
    }
  };

  const setField = (key: keyof EditableFields, value: string) => {
    setFields(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSave = async () => {
    if (!fields || !docId) return;

    const net = parseFloat(fields.netAmount) || 0;
    const vat = parseFloat(fields.vatAmount) || 0;
    const total = parseFloat(fields.totalAmount) || net + vat;

    setSaving(true);
    try {
      const endpoint =
        fields.invoiceType === 'purchase'
          ? '/api/admin/purchase-invoices'
          : '/api/admin/tax/sales-invoices';

      const payload =
        fields.invoiceType === 'purchase'
          ? {
              supplierName: fields.supplierName || 'Unknown Supplier',
              supplierTRN: fields.supplierTRN || null,
              invoiceDate: fields.invoiceDate ? new Date(fields.invoiceDate).toISOString() : new Date().toISOString(),
              invoiceNumber: fields.invoiceNumber || null,
              netAmount: net,
              vatAmount: vat,
              totalAmount: total,
              vatRate: parseFloat(fields.vatRate) || 5,
              documentId: docId,
              notes: fields.notes || null,
              status: 'Pending',
              approvalStatus: 'Pending',
            }
          : {
              invoiceNumber: fields.invoiceNumber || `SAL-${Date.now()}`,
              invoiceDate: fields.invoiceDate ? new Date(fields.invoiceDate).toISOString() : new Date().toISOString(),
              customerName: fields.customerName || 'Unknown Customer',
              customerTRN: fields.customerTRN || null,
              netAmount: net,
              vatAmount: vat,
              totalAmount: total,
              vatRate: parseFloat(fields.vatRate) || 5,
              documentId: docId,
              notes: fields.notes || null,
              status: 'Draft',
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        try {
          const err = await res.json();
          setUploadError(err.error ?? 'Failed to save invoice.');
        } catch {
          setUploadError(`Server error (${res.status}). Please try again.`);
        }
        return;
      }

      setSaved(true);
    } catch {
      setUploadError('Network error while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setFile(null); setFileUrl(null); setDocId(null);
    setOcr(null); setFields(null);
    setUploadError(null); setOcrWarning(null);
    setSaved(false); setShowRawText(false);
  };

  const confColor =
    (ocr?.confidence ?? 0) >= 80
      ? 'text-green-700 bg-green-50'
      : (ocr?.confidence ?? 0) >= 50
      ? 'text-amber-700 bg-amber-50'
      : 'text-red-700 bg-red-50';

  return (
    <div className="p-6 max-w-4xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Upload &amp; Scan Invoice</h1>
        <p className="text-sm text-gray-500 mt-0.5">Upload a supplier or sales invoice — OCR will extract the data automatically for review.</p>
      </div>

      {/* Drop zone */}
      {!ocr && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
            dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          {file ? (
            <div>
              <p className="font-semibold text-gray-800">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(0)} KB · {file.type || 'unknown type'}</p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-gray-700">Drop invoice here or click to browse</p>
              <p className="text-sm text-gray-400 mt-1">JPG, PNG, WebP, PDF · Max 20 MB</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-2 items-start text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Upload & Scan button */}
      {file && !ocr && !uploading && !ocring && (
        <button
          onClick={handleUploadAndOCR}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <ScanLine className="w-4 h-4" />
          Upload &amp; Scan Invoice
        </button>
      )}

      {/* Progress states */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Uploading file…
        </div>
      )}
      {ocring && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm text-indigo-700 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Running OCR scan… this may take 10–30 seconds for images.
        </div>
      )}

      {/* OCR warning (non-fatal) */}
      {ocrWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2 items-start text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>OCR Notice:</strong> {ocrWarning}
            {docId && (
              <button onClick={rerunOCR} className="ml-2 underline text-amber-700 hover:text-amber-900">
                Try again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results panel */}
      {ocr && fields && (
        <div className="space-y-5">
          {/* Status bar */}
          <div className="flex items-center gap-3 flex-wrap">
            {ocr.success ? (
              <span className="flex items-center gap-1.5 text-green-700 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" /> OCR Successful
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700 text-sm font-semibold">
                <AlertTriangle className="w-4 h-4" /> Partial OCR — manual review required
              </span>
            )}
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${confColor}`}>
              {ocr.confidence.toFixed(0)}% confidence
            </span>
            <span className="text-xs text-gray-400">via {ocr.ocrProvider}</span>
            <button
              onClick={rerunOCR}
              disabled={ocring}
              className="ml-auto flex items-center gap-1 text-xs text-indigo-600 hover:underline disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" /> Re-scan
            </button>
          </div>

          {/* Two-column layout: preview + form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Invoice preview */}
            <div className="space-y-3">
              {fileUrl && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-600 truncate">{file?.name}</span>
                  </div>
                  {file?.type === 'application/pdf' || file?.name.endsWith('.pdf') ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-red-400" />
                      PDF uploaded
                      <br />
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs mt-1 block">
                        Open PDF ↗
                      </a>
                    </div>
                  ) : (
                    <img src={fileUrl} alt="Invoice preview" className="w-full h-auto max-h-80 object-contain" />
                  )}
                </div>
              )}

              {/* Raw OCR text toggle */}
              {ocr.rawText && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowRawText(p => !p)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      {showRawText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      Raw OCR Text ({ocr.rawText.length} chars)
                    </span>
                  </button>
                  {showRawText && (
                    <pre className="text-xs text-gray-700 p-3 whitespace-pre-wrap font-mono max-h-52 overflow-y-auto bg-white leading-relaxed">
                      {ocr.rawText}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Right: Editable fields */}
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
                Review and correct all fields before saving. OCR may contain errors.
              </div>

              {/* Invoice type */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Invoice Type</label>
                <select
                  value={fields.invoiceType}
                  onChange={e => setField('invoiceType', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="purchase">Purchase Invoice (Input VAT)</option>
                  <option value="sales">Sales Invoice (Output VAT)</option>
                </select>
              </div>

              {/* Supplier or Customer */}
              {fields.invoiceType === 'purchase' ? (
                <>
                  <FieldInput label="Supplier Name" value={fields.supplierName} onChange={v => setField('supplierName', v)} placeholder="e.g. DEWA, Etisalat, Carrier" />
                  <FieldInput label="Supplier TRN (15 digits)" value={fields.supplierTRN} onChange={v => setField('supplierTRN', v)} placeholder="100123456700003" warn={!!fields.supplierTRN && !/^\d{15}$/.test(fields.supplierTRN)} warnMsg="UAE TRN must be exactly 15 digits" />
                </>
              ) : (
                <>
                  <FieldInput label="Customer Name" value={fields.customerName} onChange={v => setField('customerName', v)} placeholder="Customer company or individual" />
                  <FieldInput label="Customer TRN (15 digits)" value={fields.customerTRN} onChange={v => setField('customerTRN', v)} placeholder="100123456700003" />
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <FieldInput label="Invoice Number" value={fields.invoiceNumber} onChange={v => setField('invoiceNumber', v)} placeholder="INV-2025-001" />
                <FieldInput label="Invoice Date" value={fields.invoiceDate} onChange={v => setField('invoiceDate', v)} placeholder="2025-01-15" type="text" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FieldInput label="Net Amount (AED)" value={fields.netAmount} onChange={v => { setField('netAmount', v); const net = parseFloat(v) || 0; const rate = parseFloat(fields.vatRate) || 5; const vat = parseFloat((net * rate / 100).toFixed(2)); setField('vatAmount', String(vat)); setField('totalAmount', String((net + vat).toFixed(2))); }} type="number" placeholder="0.00" />
                <FieldInput label={`VAT (${fields.vatRate}%)`} value={fields.vatAmount} onChange={v => setField('vatAmount', v)} type="number" placeholder="0.00" />
                <FieldInput label="Total (AED)" value={fields.totalAmount} onChange={v => setField('totalAmount', v)} type="number" placeholder="0.00" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Notes</label>
                <textarea
                  value={fields.notes}
                  onChange={e => setField('notes', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional notes"
                />
              </div>

              {/* Actions */}
              {!saved ? (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                >
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                    : <><Save className="w-4 h-4" /> Save as {fields.invoiceType === 'purchase' ? 'Purchase' : 'Sales'} Invoice</>
                  }
                </button>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl py-3 text-center text-sm font-semibold text-green-700 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Saved successfully!
                </div>
              )}

              <button
                onClick={reset}
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl text-sm transition-colors"
              >
                Upload Another Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({
  label, value, onChange, placeholder, type = 'text', warn = false, warnMsg,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  warn?: boolean;
  warnMsg?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          warn ? 'border-red-300 bg-red-50' : 'border-gray-200'
        }`}
      />
      {warn && warnMsg && <p className="text-xs text-red-600 mt-0.5">{warnMsg}</p>}
    </div>
  );
}
