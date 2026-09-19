'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';

interface Log {
  id: string;
  userId: string | null;
  userEmail: string;
  userRole: string;
  action: string;
  module: string;
  recordId: string | null;
  recordType: string | null;
  confidence: number | null;
  reason: string | null;
  ipAddress: string | null;
  details: string | null;
  createdAt: Date | string;
}

const ACTION_COLORS: Record<string, string> = {
  DocumentUploaded: 'bg-blue-100 text-blue-700',
  OCRCompleted: 'bg-cyan-100 text-cyan-700',
  DocumentApproved: 'bg-green-100 text-green-700',
  DocumentRejected: 'bg-red-100 text-red-700',
  TaxRecordCreated: 'bg-purple-100 text-purple-700',
  ChatQuery: 'bg-gray-100 text-gray-600',
  SuggestionAccepted: 'bg-emerald-100 text-emerald-700',
  SuggestionDismissed: 'bg-gray-100 text-gray-500',
  RuleCreated: 'bg-indigo-100 text-indigo-700',
  RuleUpdated: 'bg-amber-100 text-amber-700',
  RuleDeleted: 'bg-red-100 text-red-600',
};

export default function AILogsClient({
  logs,
  total,
  page,
  pageSize,
  allActions,
  allModules,
}: {
  logs: Log[];
  total: number;
  page: number;
  pageSize: number;
  allActions: string[];
  allModules: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);

  const navigate = (updates: Record<string, string>) => {
    const p = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k);
    });
    router.push(`/admin/ai/logs?${p.toString()}`);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-600" />
            AI Audit Logs
          </h1>
          <p className="text-gray-500 text-sm">{total.toLocaleString()} total events</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={params.get('action') || ''}
            onChange={e => navigate({ action: e.target.value, page: '1' })}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Actions</option>
            {allActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={params.get('module') || ''}
            onChange={e => navigate({ module: e.target.value, page: '1' })}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Modules</option>
            {allModules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Module</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Record</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No logs found</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-GB', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{log.userEmail}</div>
                    <div className="text-xs text-gray-400">{log.userRole}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{log.module}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {log.recordId && <span className="font-mono">{log.recordId.substring(0, 20)}{log.recordId.length > 20 ? '…' : ''}</span>}
                    {log.recordType && <div className="text-[10px] text-gray-400">{log.recordType}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px]">
                    {log.reason || log.details?.substring(0, 80) || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {log.confidence != null ? (
                      <span className={`font-semibold ${log.confidence >= 85 ? 'text-green-600' : log.confidence >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {log.confidence}%
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => navigate({ page: String(page - 1) })}
              className="border border-gray-200 rounded-xl p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => navigate({ page: String(page + 1) })}
              className="border border-gray-200 rounded-xl p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
