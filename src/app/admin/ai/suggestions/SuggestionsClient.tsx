'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, CheckCircle, X, RefreshCw, AlertTriangle } from 'lucide-react';

interface Suggestion {
  id: string;
  suggestionId: string;
  type: string;
  title: string;
  description: string;
  riskLevel: string;
  relatedId: string | null;
  relatedType: string | null;
  actionType: string | null;
  status: string;
  createdAt: Date | string;
}

const RISK_COLORS: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-600 border-gray-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Critical: 'bg-red-50 text-red-700 border-red-200',
};

const RISK_BADGE: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

export default function SuggestionsClient({ suggestions: initial }: { suggestions: Suggestion[] }) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState(initial);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai/suggestions?refresh=1');
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } finally {
      setLoading(false);
    }
  };

  const accept = async (id: string) => {
    await fetch(`/api/admin/ai/suggestions/${id}/accept`, { method: 'POST' });
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const dismiss = async (id: string) => {
    await fetch(`/api/admin/ai/suggestions/${id}/dismiss`, { method: 'POST' });
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const grouped: Record<string, Suggestion[]> = {};
  for (const s of suggestions) {
    const key = s.riskLevel;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            AI Suggestions
          </h1>
          <p className="text-gray-500 text-sm">{suggestions.length} open suggestion(s)</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Suggestions
        </button>
      </div>

      {suggestions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-500">No open suggestions</h3>
          <p className="text-sm text-gray-400 mt-1">Click Refresh to check for new suggestions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {['Critical', 'High', 'Medium', 'Low'].map(risk => {
            const items = grouped[risk];
            if (!items?.length) return null;
            return (
              <div key={risk}>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  {risk === 'Critical' && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                  {risk} Priority
                </h2>
                <div className="space-y-2">
                  {items.map(s => (
                    <div key={s.id} className={`border rounded-2xl p-4 ${RISK_COLORS[s.riskLevel] || 'border-gray-200'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${RISK_BADGE[s.riskLevel]}`}>
                              {s.riskLevel}
                            </span>
                            <span className="text-xs text-gray-400">{s.type}</span>
                          </div>
                          <div className="font-semibold text-gray-900 mt-1 text-sm">{s.title}</div>
                          <div className="text-sm text-gray-600 mt-0.5 leading-relaxed">{s.description}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => accept(s.id)}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accept
                          </button>
                          <button
                            onClick={() => dismiss(s.id)}
                            className="flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
