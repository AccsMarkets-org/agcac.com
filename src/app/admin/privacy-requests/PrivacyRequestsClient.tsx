'use client';
import { useState } from 'react';
import { Shield, Clock, CheckCircle, XCircle, Eye, ChevronDown } from 'lucide-react';

interface PrivacyRequest {
  id: string;
  requestId: string;
  fullName: string;
  email: string;
  phone: string | null;
  requestType: string;
  details: string | null;
  status: string;
  adminNotes: string | null;
  resolvedBy: string | null;
  resolvedAt: Date | string | null;
  createdAt: Date | string;
}

interface Props {
  initialRequests: PrivacyRequest[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  in_review: 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  in_review: <Eye className="w-3 h-3" />,
  resolved: <CheckCircle className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
};

const TYPE_LABELS: Record<string, string> = {
  access: 'Access Request',
  correction: 'Correction',
  deletion: 'Deletion Request',
  withdrawal: 'Consent Withdrawal',
  other: 'General Enquiry',
};

export default function PrivacyRequestsClient({ initialRequests }: Props) {
  const [requests, setRequests] = useState<PrivacyRequest[]>(initialRequests);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const selected = requests.find(r => r.id === selectedId);

  const filtered = filterStatus
    ? requests.filter(r => r.status === filterStatus)
    : requests;

  const updateStatus = async (id: string, status: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/privacy-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes || undefined }),
      });
      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...data.request } : r));
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Privacy Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Data access, deletion, correction, and consent withdrawal requests from the public website.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Filter:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="">All Requests ({requests.length})</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No requests found</p>
            </div>
          )}
          {filtered.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setNotes(r.adminNotes || ''); }}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedId === r.id
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 truncate">{r.fullName}</div>
                  <div className="text-xs text-gray-500 truncate">{r.email}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {TYPE_LABELS[r.requestType] || r.requestType} · {r.requestId}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold shrink-0 ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {STATUS_ICONS[r.status]}
                  {r.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-gray-400 rounded-xl border-2 border-dashed border-gray-200 min-h-[300px]">
              <div className="text-center">
                <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select a request to view details</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-gray-900">{selected.fullName}</h2>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${STATUS_COLORS[selected.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {STATUS_ICONS[selected.status]}
                      {selected.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {selected.requestId} · Submitted {new Date(selected.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Email</div>
                  <div className="text-gray-900">{selected.email}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Phone</div>
                  <div className="text-gray-900">{selected.phone || '—'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Request Type</div>
                  <div className="text-gray-900">{TYPE_LABELS[selected.requestType] || selected.requestType}</div>
                </div>
              </div>

              {/* Details */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Request Details</div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                  {selected.details || '—'}
                </div>
              </div>

              {/* Admin notes */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Admin Notes (internal only)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                  placeholder="Add internal notes about this request..."
                />
              </div>

              {/* Status actions */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</div>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'in_review', 'resolved', 'rejected'].map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={saving || selected.status === s}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 border ${
                        selected.status === s
                          ? STATUS_COLORS[s]
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {s === 'in_review' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {selected.resolvedBy && (
                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                  Resolved by {selected.resolvedBy} on{' '}
                  {selected.resolvedAt ? new Date(selected.resolvedAt).toLocaleDateString('en-GB') : '—'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
