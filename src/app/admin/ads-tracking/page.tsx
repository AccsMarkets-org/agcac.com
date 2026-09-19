import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import { TrendingUp, ExternalLink } from 'lucide-react';

type UTMRow = { source: string; medium: string; campaign: string; count: number; won: number };

function bar(pct: number, color: string) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div style={{ width: `${pct}%` }} className={`h-2 rounded-full ${color}`} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default async function AdsTrackingPage() {
  await requireAdminAuth();

  const leads = await prisma.lead.findMany({
    where: { deletedAt: null },
    select: { utmSource: true, utmMedium: true, utmCampaign: true, status: true, createdAt: true },
  });

  const total = leads.length;

  // Group by UTM source
  const srcMap: Record<string, { count: number; won: number }> = {};
  const medMap: Record<string, { count: number; won: number }> = {};
  const campMap: Record<string, { count: number; won: number }> = {};

  for (const l of leads) {
    const src = l.utmSource || '(none)';
    const med = l.utmMedium || '(none)';
    const camp = l.utmCampaign || '(none)';
    const won = l.status === 'Won' ? 1 : 0;
    srcMap[src] = srcMap[src] ? { count: srcMap[src].count + 1, won: srcMap[src].won + won } : { count: 1, won };
    medMap[med] = medMap[med] ? { count: medMap[med].count + 1, won: medMap[med].won + won } : { count: 1, won };
    campMap[camp] = campMap[camp] ? { count: campMap[camp].count + 1, won: campMap[camp].won + won } : { count: 1, won };
  }

  const top = (map: Record<string, { count: number; won: number }>): UTMRow[] =>
    Object.entries(map).map(([key, v]) => ({ source: key, medium: '', campaign: '', count: v.count, won: v.won }))
      .sort((a, b) => b.count - a.count).slice(0, 10);

  const bySrc = top(srcMap);
  const byMed = top(medMap);
  const byCamp = top(campMap);
  const maxSrc = bySrc[0]?.count || 1;
  const maxMed = byMed[0]?.count || 1;
  const maxCamp = byCamp[0]?.count || 1;

  // Monthly trend (last 6 months)
  const now = new Date();
  const months: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    const count = leads.filter(l => new Date(l.createdAt) >= d && new Date(l.createdAt) < end).length;
    months.push({ label, count });
  }
  const maxMonth = Math.max(...months.map(m => m.count), 1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ads Tracking</h1>
          <p className="text-gray-500 text-sm">UTM attribution across {total} leads</p>
        </div>
      </div>

      {/* Monthly trend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5">Monthly Lead Volume (Last 6 Months)</h2>
        <div className="flex items-end gap-3 h-36">
          {months.map(m => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-gray-600">{m.count}</span>
              <div className="w-full rounded-t-lg bg-blue-500" style={{ height: `${Math.round((m.count / maxMonth) * 100)}px`, minHeight: m.count > 0 ? '4px' : '0' }} />
              <span className="text-[11px] text-gray-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By Source */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">By UTM Source</h2>
          <div className="space-y-3">
            {bySrc.map(r => (
              <div key={r.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-700 font-medium truncate max-w-[120px]">{r.source}</span>
                  <span className="text-xs text-gray-500">{r.count}</span>
                </div>
                {bar(Math.round((r.count / maxSrc) * 100), 'bg-blue-500')}
              </div>
            ))}
            {bySrc.length === 0 && <p className="text-xs text-gray-400">No UTM source data yet.</p>}
          </div>
        </div>

        {/* By Medium */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">By UTM Medium</h2>
          <div className="space-y-3">
            {byMed.map(r => (
              <div key={r.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-700 font-medium truncate max-w-[120px]">{r.source}</span>
                  <span className="text-xs text-gray-500">{r.count}</span>
                </div>
                {bar(Math.round((r.count / maxMed) * 100), 'bg-purple-500')}
              </div>
            ))}
            {byMed.length === 0 && <p className="text-xs text-gray-400">No UTM medium data yet.</p>}
          </div>
        </div>

        {/* By Campaign */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">By UTM Campaign</h2>
          <div className="space-y-3">
            {byCamp.map(r => (
              <div key={r.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-700 font-medium truncate max-w-[120px]">{r.source}</span>
                  <span className="text-xs text-gray-500">{r.count}</span>
                </div>
                {bar(Math.round((r.count / maxCamp) * 100), 'bg-amber-500')}
              </div>
            ))}
            {byCamp.length === 0 && <p className="text-xs text-gray-400">No UTM campaign data yet.</p>}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 text-sm">
        <ExternalLink className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-blue-800">
          UTM parameters are captured from lead form submissions. To track Google Ads or Meta campaigns, append <code className="font-mono bg-white/60 px-1 rounded">?utm_source=google&utm_medium=cpc&utm_campaign=campaign-name</code> to your landing page URLs.
        </p>
      </div>
    </div>
  );
}
