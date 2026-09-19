import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import { FileBarChart, Download } from 'lucide-react';

export default async function ReportsPage() {
  await requireAdminAuth();

  const [leads, rawInvoices, amcs, siteVisits, techJobs, rawQuotations] = await Promise.all([
    prisma.lead.findMany({ where: { deletedAt: null }, select: { status: true, service: true, area: true, leadSource: true, createdAt: true } }),
    prisma.invoice.findMany({ include: { items: true } }),
    prisma.aMCContract.findMany({ select: { contractValue: true, status: true, endDate: true } }),
    prisma.siteVisit.findMany({ select: { status: true, estimatedCost: true, createdAt: true } }),
    prisma.technicianJob.findMany({ select: { status: true, createdAt: true } }),
    prisma.quotation.findMany({ include: { items: true } }),
  ]);

  const invoices = rawInvoices.map(inv => ({ ...inv, total: inv.items.reduce((s, it) => s + it.total, 0) }));
  const quotations = rawQuotations.map(q => ({ ...q, total: q.items.reduce((s, it) => s + it.total, 0) }));

  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'Won').length;
  const lostLeads = leads.filter(l => l.status === 'Lost').length;

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const paidInvoices = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.total, 0);

  const activeAMCs = amcs.filter(a => a.status === 'Active');
  const amcRevenue = activeAMCs.reduce((s, a) => s + (a.contractValue ?? 0), 0);
  const expiringAMCs = activeAMCs.filter(a => a.endDate && (new Date(a.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <= 30).length;

  const completedVisits = siteVisits.filter(v => v.status === 'Completed').length;
  const completedJobs = techJobs.filter(j => j.status === 'Completed').length;
  const acceptedQuotes = quotations.filter(q => q.status === 'Accepted').reduce((s, q) => s + q.total, 0);

  const fmt = (n: number) => `AED ${n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const sections = [
    {
      title: 'Lead Pipeline Summary', color: 'blue',
      rows: [
        ['Total Leads', totalLeads],
        ['Won', `${wonLeads} (${totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0}%)`],
        ['Lost', `${lostLeads} (${totalLeads ? Math.round((lostLeads / totalLeads) * 100) : 0}%)`],
        ['Active in Pipeline', totalLeads - wonLeads - lostLeads],
      ],
    },
    {
      title: 'Revenue Summary', color: 'green',
      rows: [
        ['Total Invoiced', fmt(totalInvoiced)],
        ['Collected (Paid)', fmt(paidInvoices)],
        ['Outstanding / Overdue', fmt(overdueInvoices)],
        ['Accepted Quotes Value', fmt(acceptedQuotes)],
      ],
    },
    {
      title: 'AMC Contracts', color: 'purple',
      rows: [
        ['Active Contracts', activeAMCs.length],
        ['Annual Contract Value', fmt(amcRevenue)],
        ['Expiring in 30 Days', expiringAMCs],
        ['Total Contracts', amcs.length],
      ],
    },
    {
      title: 'Operations Summary', color: 'amber',
      rows: [
        ['Site Visits Completed', completedVisits],
        ['Site Visits Total', siteVisits.length],
        ['Technician Jobs Completed', completedJobs],
        ['Technician Jobs Total', techJobs.length],
      ],
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    green: 'bg-green-50 border-green-100 text-green-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileBarChart className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500 text-sm">Business performance overview • Live data</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/export/leads" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export Leads
          </a>
          <a href="/api/admin/export/invoices" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
            <Download className="w-4 h-4" /> Export Invoices
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {sections.map(sec => (
          <div key={sec.title} className={`rounded-2xl border p-6 ${colorMap[sec.color]}`}>
            <h2 className="text-base font-bold mb-4">{sec.title}</h2>
            <div className="space-y-2">
              {sec.rows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between bg-white/60 rounded-xl px-3 py-2">
                  <span className="text-sm text-gray-700">{label}</span>
                  <span className="text-sm font-bold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Export Reports</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: 'All Leads (Excel)', href: '/api/admin/export/leads' },
            { label: 'Invoices (Excel)', href: '/api/admin/export/invoices' },
            { label: 'Quotations (Excel)', href: '/api/admin/export/quotations' },
            { label: 'AMC Contracts (Excel)', href: '/api/admin/export/amc' },
          ].map(exp => (
            <a key={exp.label} href={exp.href}
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors">
              <Download className="w-4 h-4 flex-shrink-0" />
              {exp.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
