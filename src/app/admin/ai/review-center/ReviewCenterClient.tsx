'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle, XCircle, Eye, AlertTriangle, FileText, ExternalLink,
  Shield, ChevronDown, ChevronUp, Loader2, Clock
} from 'lucide-react';

interface Warning { type: string; severity: string; message: string; field?: string | null }
interface Task {
  id: string;
  taskId: string;
  status: string;
  priority: string;
  createdAt: string | Date;
  document: {
    id: string;
    docId: string;
    originalName: string;
    documentType: string;
    processingStatus: string;
    confidenceScore: number;
    filePath: string;
    warnings: Warning[];
    extractedJSON: Record<string, unknown> | null;
  };
}

const VAT_TREATMENTS = ['Standard', 'ZeroRated', 'Exempt', 'OutOfScope', 'NonRecoverable'];
const SEVERITY_COLORS: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  Error: 'bg-orange-100 text-orange-700 border-orange-200',
  Warning: 'bg-amber-100 text-amber-700 border-amber-200',
  Info: 'bg-blue-100 text-blue-700 border-blue-200',
};
const CONF_COLOR = (c: number) => c >= 85 ? 'text-green-600 bg-green-50' : c >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

export default function ReviewCenterClient({ tasks, userEmail, userRole }: {
  tasks: Task[];
  userEmail: string;
  userRole: string;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(tasks[0]?.id || null);
  const [vatTreatment, setVatTreatment] = useState('Standard');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [createTaxRecord, setCreateTaxRecord] = useState(true);
  const [submitting, setSubmitting] = useState<'approve' | 'reject' | null>(null);
  const [expandedWarnings, setExpandedWarnings] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');

  const canApprove = ['SuperAdmin', 'Admin', 'Accountant', 'TaxManager'].includes(userRole);
  const selected = tasks.find(t => t.id === selectedId);
  const ed = selected?.document.extractedJSON as Record<string, unknown> | null;

  const approve = async () => {
    if (!selected || !canApprove) return;
    setSubmitting('approve');
    try {
      const res = await fetch('/api/admin/ai/review-task/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selected.id,
          reviewerNotes,
          vatTreatment,
          createTaxRecord,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        router.refresh();
      } else {
        alert(data.error || 'Approval failed');
      }
    } finally {
      setSubmitting(null);
    }
  };

  const reject = async () => {
    if (!selected || !rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    setSubmitting('reject');
    try {
      const res = await fetch('/api/admin/ai/review-task/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: selected.id, reason: rejectionReason }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Document rejected.');
        router.refresh();
      } else {
        alert(data.error || 'Rejection failed');
      }
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Left: Task list */}
      <div className="w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Review Queue
            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{tasks.length}</span>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-2" />
              All caught up! No documents need review.
            </div>
          ) : tasks.map(task => (
            <button
              key={task.id}
              onClick={() => { setSelectedId(task.id); setVatTreatment('Standard'); setReviewerNotes(''); setRejectionReason(''); }}
              className={`w-full text-left p-3 border-b border-gray-50 hover:bg-purple-50 transition-colors ${selectedId === task.id ? 'bg-purple-50 border-l-2 border-l-purple-600' : ''}`}
            >
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-900 truncate">{task.document.originalName}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{task.document.docId}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] font-bold px-1.5 rounded-full ${CONF_COLOR(task.document.confidenceScore)}`}>
                      {task.document.confidenceScore.toFixed(0)}%
                    </span>
                    {task.document.warnings.some(w => w.severity === 'Critical' || w.severity === 'Error') && (
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    )}
                    {task.priority === 'High' && (
                      <span className="text-[10px] font-bold text-red-600">HIGH</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Review panel */}
      {!selected ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Eye className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p>Select a document to review</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Document preview */}
          <div className="flex-1 border-r border-gray-100 overflow-y-auto bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 text-sm truncate max-w-sm">{selected.document.originalName}</h3>
              <a href={selected.document.filePath} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-purple-600 hover:underline">
                <ExternalLink className="w-3 h-3" /> Open file
              </a>
            </div>

            {/* Confidence badges */}
            {ed?.confidence != null && typeof ed.confidence === 'object' ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(ed!.confidence as Record<string, number>).map(([key, val]) => (
                  <div key={key} className={`text-xs px-2 py-1 rounded-full ${CONF_COLOR(val as number)}`}>
                    {key}: {(val as number).toFixed(0)}%
                  </div>
                ))}
              </div>
            ) : null}

            {/* Extracted data */}
            {ed != null && (
              <div className="space-y-3">
                {/* Invoice info */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Invoice Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Document Type', val: ed.documentType as string },
                      { label: 'Invoice Number', val: ed.invoiceNumber as string },
                      { label: 'Invoice Date', val: ed.invoiceDate as string },
                      { label: 'Date of Supply', val: ed.dateOfSupply as string },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <div className="text-xs text-gray-400">{label}</div>
                        <div className="font-medium text-gray-900">{val || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supplier */}
                {ed.supplier != null && typeof ed.supplier === 'object' ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Supplier</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(ed.supplier as Record<string, string>).map(([k, v]) => (
                        <div key={k}>
                          <div className="text-xs text-gray-400 capitalize">{k}</div>
                          <div className={`font-medium ${k === 'trn' && v && !/^\d{15}$/.test(v) ? 'text-red-600' : 'text-gray-900'}`}>{v || '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Totals */}
                {ed.totals != null && typeof ed.totals === 'object' ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Amounts</h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      {Object.entries(ed.totals as Record<string, unknown>).map(([k, v]) => (
                        <div key={k}>
                          <div className="text-xs text-gray-400 capitalize">{k}</div>
                          <div className="font-bold text-gray-900">
                            {typeof v === 'number' ? `AED ${(v as number).toLocaleString('en-AE', { minimumFractionDigits: 2 })}` : String(v)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Category */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Accounting Category</h4>
                  <div className="font-medium text-gray-900 text-sm">{(ed.accountingCategory as string) || '—'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Approval panel */}
          <div className="w-80 shrink-0 overflow-y-auto bg-white border-l border-gray-100 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900 text-sm">Review & Approve</h3>
            </div>

            {/* Warnings */}
            {selected.document.warnings.length > 0 && (
              <div>
                <button
                  onClick={() => setExpandedWarnings(!expandedWarnings)}
                  className="flex items-center justify-between w-full text-xs font-bold text-gray-500 uppercase tracking-wide mb-2"
                >
                  <span>Validation Issues ({selected.document.warnings.length})</span>
                  {expandedWarnings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {expandedWarnings && (
                  <div className="space-y-1.5">
                    {selected.document.warnings.map((w, i) => (
                      <div key={i} className={`text-xs px-2.5 py-2 rounded-lg border ${SEVERITY_COLORS[w.severity] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                        <div className="font-semibold">{w.type}</div>
                        <div className="mt-0.5 opacity-90">{w.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VAT Treatment */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">VAT Treatment</label>
              <select
                value={vatTreatment}
                onChange={e => setVatTreatment(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {VAT_TREATMENTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Create tax record toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={createTaxRecord} onChange={e => setCreateTaxRecord(e.target.checked)} className="rounded" />
              <span className="text-gray-700">Auto-create tax record on approval</span>
            </label>

            {/* Reviewer notes */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Reviewer Notes</label>
              <textarea
                value={reviewerNotes}
                onChange={e => setReviewerNotes(e.target.value)}
                rows={3}
                placeholder="Add notes for audit trail…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Approve button */}
            {canApprove && (
              <button
                onClick={approve}
                disabled={!!submitting}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {submitting === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {submitting === 'approve' ? 'Approving…' : 'Approve & Post'}
              </button>
            )}

            {/* Reject */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Reject Document</label>
              <input
                type="text"
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={reject}
                disabled={!!submitting || !rejectionReason.trim()}
                className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {submitting === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {submitting === 'reject' ? 'Rejecting…' : 'Reject Document'}
              </button>
            </div>

            {!canApprove && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                Approval requires Accountant, Tax Manager, or Admin role. Your role: {userRole}
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 border border-gray-100">
              <strong>⚠️ Important:</strong> AI suggestions require accountant review before tax filing. Approving creates a draft record — final submission to FTA must be done manually through EmaraTax.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
