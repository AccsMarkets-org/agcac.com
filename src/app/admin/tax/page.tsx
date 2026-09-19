import { requireTaxAuth } from '@/lib/tax-auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

function aed(n: number) {
  return `AED ${n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function TaxOverviewPage() {
  await requireTaxAuth();

  const [purchaseCount, salesCount, pendingPI, openVATReturn, draftCT, recentAudit, taxSettings] = await Promise.all([
    prisma.purchaseInvoice.count({ where: { deletedAt: null } }),
    prisma.taxSalesInvoice.count({ where: { deletedAt: null } }),
    prisma.purchaseInvoice.count({ where: { deletedAt: null, approvalStatus: 'Pending' } }),
    prisma.vATReturn.findFirst({ where: { status: { in: ['Draft', 'InReview'] } }, orderBy: { createdAt: 'desc' } }),
    prisma.corporateTaxReturn.findFirst({ where: { status: 'Draft' }, orderBy: { createdAt: 'desc' } }),
    prisma.taxAuditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.taxSetting.findMany({ where: { category: 'company' } }),
  ]);

  const piTotals = await prisma.purchaseInvoice.aggregate({
    _sum: { vatAmount: true, totalAmount: true },
    where: { deletedAt: null },
  });
  const siTotals = await prisma.taxSalesInvoice.aggregate({
    _sum: { vatAmount: true, totalAmount: true },
    where: { deletedAt: null },
  });

  const companyTRN = taxSettings.find(s => s.key === 'company_trn')?.value ?? 'Not set';
  const vatStatus = taxSettings.find(s => s.key === 'vat_registered')?.value ?? 'no';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax &amp; Compliance</h1>
          <p className="text-sm text-gray-500 mt-1">UAE VAT &amp; Corporate Tax — Al Ghawas A/C Refrigeration Contracting LLC</p>
        </div>
        <div className="text-right text-sm space-y-1">
          <div className="font-semibold text-gray-700">TRN: {companyTRN}</div>
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${vatStatus === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            VAT {vatStatus === 'yes' ? 'Registered' : 'Not Registered'}
          </span>
        </div>
      </div>

      <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
        <span className="text-red-600 text-lg mt-0.5">⚠️</span>
        <div className="text-sm text-red-800">
          <strong>Legal Notice:</strong> This system prepares tax reports and submission packages only.{' '}
          <strong>Final filing must be manually done by an authorized accountant through EmaraTax.</strong>{' '}
          The system will never auto-submit to the FTA.
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Purchase Invoices', value: String(purchaseCount), sub: `${pendingPI} pending approval`, href: '/admin/tax/purchase-invoices', bg: 'bg-blue-600' },
          { label: 'Sales Invoices', value: String(salesCount), sub: aed(siTotals._sum.totalAmount ?? 0), href: '/admin/tax/sales-invoices', bg: 'bg-green-600' },
          { label: 'Input VAT', value: aed(piTotals._sum.vatAmount ?? 0), sub: 'Recoverable (purchases)', href: '/admin/tax/vat', bg: 'bg-purple-600' },
          { label: 'Output VAT', value: aed(siTotals._sum.vatAmount ?? 0), sub: 'Collected (sales)', href: '/admin/tax/vat', bg: 'bg-amber-600' },
        ].map(c => (
          <Link key={c.label} href={c.href} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
              <span className="text-white text-sm font-bold">₪</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{c.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{c.label}</div>
            <div className="text-xs text-gray-400 mt-1">{c.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Upload & Scan Invoice', href: '/admin/tax/upload', icon: '📄' },
              { label: 'Prepare VAT Return', href: '/admin/tax/vat-returns', icon: '📊' },
              { label: 'Calculate Corporate Tax', href: '/admin/tax/corporate-tax', icon: '🏢' },
              { label: 'Submission Center', href: '/admin/tax/submission', icon: '📤' },
              { label: 'Download Tax Reports', href: '/admin/tax/reports', icon: '📑' },
              { label: 'Audit Log', href: '/admin/tax/audit-log', icon: '🔍' },
              { label: 'Tax Settings', href: '/admin/tax/settings', icon: '⚙️' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 border border-gray-100 text-sm font-medium text-gray-700 transition-colors"
              >
                <span className="text-lg">{a.icon}</span>
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Current Status</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Active VAT Return</span>
              <span className={`font-medium ${openVATReturn ? 'text-amber-600' : 'text-gray-400'}`}>
                {openVATReturn ? `${openVATReturn.period} — ${openVATReturn.status}` : 'None open'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Corporate Tax Draft</span>
              <span className={`font-medium ${draftCT ? 'text-amber-600' : 'text-gray-400'}`}>
                {draftCT ? `FY ${draftCT.financialYear} — Draft` : 'None open'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Pending Approvals</span>
              <span className={`font-semibold ${pendingPI > 0 ? 'text-red-600' : 'text-green-600'}`}>{pendingPI} invoice(s)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Net VAT Position</span>
              <span className="font-semibold text-gray-800">
                {aed((siTotals._sum.vatAmount ?? 0) - (piTotals._sum.vatAmount ?? 0))} Due
              </span>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</h3>
            {recentAudit.length === 0 && <p className="text-xs text-gray-400">No activity yet</p>}
            <div className="space-y-1.5">
              {recentAudit.map(log => (
                <div key={log.id} className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="text-gray-300 shrink-0">•</span>
                  <span className="flex-1 truncate">{log.description}</span>
                  <span className="shrink-0">{new Date(log.createdAt).toLocaleDateString('en-AE')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
