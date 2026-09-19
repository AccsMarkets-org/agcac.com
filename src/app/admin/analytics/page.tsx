import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import { BarChart3 } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-500', Contacted: 'bg-indigo-500', Quoted: 'bg-amber-500',
  Won: 'bg-green-500', Lost: 'bg-red-400', 'No Response': 'bg-gray-400',
};

export default async function AnalyticsPage() {
  await requireAdminAuth();

  const [leads, rawInvoices, amcs] = await Promise.all([
    prisma.lead.findMany({ where: { deletedAt: null }, select: { status: true, service: true, area: true, createdAt: true } }),
    prisma.invoice.findMany({ include: { items: true } }),
    prisma.aMCContract.findMany({ select: { contractValue: true, status: true } }),
  ]);

  const invoices = rawInvoices.map(inv => ({
    ...inv,
    total: inv.items.reduce((s, it) => s + it.total, 0),
  }));

  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'Won').length;
  const convRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const totalRevenue = invoices.reduce((sum, i) => sum + i.total, 0);
  const activeAMCs = amcs.filter(a => a.status === 'Active').length;
  const amcRevenue = amcs.filter(a => a.status === 'Active').reduce((sum, a) => sum + (a.contractValue ?? 0), 0);

  // By status
  const statusCounts: Record<string, number> = {};
  for (const l of leads) statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
  const maxStatus = Math.max(...Object.values(statusCounts), 1);

  // By service
  const serviceCounts: Record<string, number> = {};
  for (const l of leads) {
    const s = l.service || 'Other';
    serviceCounts[s] = (serviceCounts[s] || 0) + 1;
  }
  const topServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxSvc = topServices[0]?.[1] || 1;

  // By area
  const areaCounts: Record<string, number> = {};
  for (const l of leads) {
    const a = l.area || 'Unknown';
    areaCounts[a] = (areaCounts[a] || 0) + 1;
  }
  const topAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxArea = topAreas[0]?.[1] || 1;

  // Monthly revenue (last 6 months)
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    const revenue = invoices.filter(inv => new Date(inv.createdAt) >= d && new Date(inv.createdAt) < end)
      .reduce((sum, inv) => sum + inv.total, 0);
    return { label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }), revenue };
  });
  const maxRev = Math.max(...months.map(m => m.revenue), 1);

  const fmt = (n: number) => n >= 1000 ? `AED ${(n / 1000).toFixed(1)}K` : `AED ${n.toFixed(0)}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm">Real-time performance overview</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: totalLeads.toString(), sub: `${wonLeads} won`, color: 'bg-blue-50 text-blue-600' },
          { label: 'Conversion Rate', value: `${convRate}%`, sub: 'lead → won', color: 'bg-green-50 text-green-600' },
          { label: 'Total Revenue', value: fmt(totalRevenue), sub: 'all invoices', color: 'bg-amber-50 text-amber-600' },
          { label: 'Active AMCs', value: activeAMCs.toString(), sub: fmt(amcRevenue) + '/yr', color: 'bg-purple-50 text-purple-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color.split(' ')[1]}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5">Monthly Revenue (Last 6 Months)</h2>
        <div className="flex items-end gap-3 h-36">
          {months.map(m => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[11px] font-bold text-gray-600">{m.revenue > 0 ? fmt(m.revenue).replace('AED ', '') : ''}</span>
              <div className="w-full rounded-t-lg bg-blue-500" style={{ height: `${Math.round((m.revenue / maxRev) * 100)}px`, minHeight: m.revenue > 0 ? '4px' : '0' }} />
              <span className="text-[11px] text-gray-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By Lead Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Leads by Status</h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">{status}</span>
                  <span className="text-xs text-gray-500">{count}</span>
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full ${STATUS_COLORS[status] ?? 'bg-gray-400'}`} style={{ width: `${Math.round((count / maxStatus) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Service */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Leads by Service</h2>
          <div className="space-y-3">
            {topServices.map(([svc, count]) => (
              <div key={svc}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 truncate max-w-[130px]">{svc}</span>
                  <span className="text-xs text-gray-500">{count}</span>
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-amber-500" style={{ width: `${Math.round((count / maxSvc) * 100)}%` }} />
                </div>
              </div>
            ))}
            {topServices.length === 0 && <p className="text-xs text-gray-400">No data.</p>}
          </div>
        </div>

        {/* By Area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Leads by Area</h2>
          <div className="space-y-3">
            {topAreas.map(([area, count]) => (
              <div key={area}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 truncate max-w-[130px]">{area}</span>
                  <span className="text-xs text-gray-500">{count}</span>
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full bg-teal-500" style={{ width: `${Math.round((count / maxArea) * 100)}%` }} />
                </div>
              </div>
            ))}
            {topAreas.length === 0 && <p className="text-xs text-gray-400">No data.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
