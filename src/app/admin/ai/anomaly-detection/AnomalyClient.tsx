'use client';
import { useState } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, Eye } from 'lucide-react';

interface Anomaly {
  id: string;
  anomalyId: string;
  type: string;
  title: string;
  description: string;
  riskLevel: string;
  relatedId: string | null;
  relatedType: string | null;
  status: string;
  createdAt: Date | string;
}

const RISK_BADGE: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-red-100 text-red-700',
  UnderReview: 'bg-amber-100 text-amber-700',
  Resolved: 'bg-green-100 text-green-700',
  Dismissed: 'bg-gray-100 text-gray-500',
};

export default function AnomalyClient({ anomalies: initial }: { anomalies: Anomaly[] }) {
  const [anomalies, setAnomalies] = useState(initial);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai/anomalies?refresh=1');
      const data = await res.json();
      setAnomalies(data.anomalies || []);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/ai/anomalies', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (status === 'Resolved' || status === 'Dismissed') {
      setAnomalies(prev => prev.filter(a => a.id !== id));
    } else {
      setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Anomaly Detection
          </h1>
          <p className="text-gray-500 text-sm">{anomalies.length} open anomalie(s)</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Run Detection
        </button>
      </div>

      {anomalies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-500">No anomalies detected</h3>
          <p className="text-sm text-gray-400 mt-1">Click "Run Detection" to scan for issues.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Anomaly</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Detected</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {anomalies.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 text-sm">{a.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 max-w-xs">{a.description.substring(0, 100)}{a.description.length > 100 ? '…' : ''}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{a.anomalyId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{a.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${RISK_BADGE[a.riskLevel] || 'bg-gray-100 text-gray-600'}`}>
                        {a.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-600'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {a.status === 'Open' && (
                          <button
                            onClick={() => updateStatus(a.id, 'UnderReview')}
                            className="text-xs text-amber-600 hover:underline font-medium"
                          >
                            Review
                          </button>
                        )}
                        <button
                          onClick={() => updateStatus(a.id, 'Resolved')}
                          className="text-xs text-green-600 hover:underline font-medium"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => updateStatus(a.id, 'Dismissed')}
                          className="text-xs text-gray-400 hover:underline font-medium"
                        >
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
