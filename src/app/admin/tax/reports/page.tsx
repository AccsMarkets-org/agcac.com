import { requireTaxAuth } from '@/lib/tax-auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

const FMT = (n: number) => `AED ${n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default async function TaxReportsPage() {
  await requireTaxAuth();

  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);

  const [purchaseInvoices, salesInvoices, vatReturns, ctReturns] = await Promise.all([
    prisma.purchaseInvoice.findMany({
      where: { deletedAt: null, invoiceDate: { gte: yearStart, lte: yearEnd } },
      select: { netAmount: true, vatAmount: true, totalAmount: true, category: true, invoiceDate: true, supplierName: true, approvalStatus: true, vatTreatment: true },
    }),
    prisma.taxSalesInvoice.findMany({
      where: { deletedAt: null, invoiceDate: { gte: yearStart, lte: yearEnd } },
      select: { netAmount: true, vatAmount: true, totalAmount: true, invoiceDate: true, vatTreatment: true, approvalStatus: true },
    }),
    prisma.vATReturn.findMany({ orderBy: { endDate: 'desc' } }),
    prisma.corporateTaxReturn.findMany({ orderBy: { financialYear: 'desc' } }),
  ]);

  const quarters = [
    { label: `Q1 ${year}`, start: new Date(year, 0, 1), end: new Date(year, 2, 31) },
    { label: `Q2 ${year}`, start: new Date(year, 3, 1), end: new Date(year, 5, 30) },
    { label: `Q3 ${year}`, start: new Date(year, 6, 1), end: new Date(year, 8, 30) },
    { label: `Q4 ${year}`, start: new Date(year, 9, 1), end: new Date(year, 11, 31) },
  ];

  const quarterly = quarters.map(q => {
    const si = salesInvoices.filter(i => new Date(i.invoiceDate) >= q.start && new Date(i.invoiceDate) <= q.end);
    const pi = purchaseInvoices.filter(i => new Date(i.invoiceDate) >= q.start && new Date(i.invoiceDate) <= q.end);
    const outputVAT = si.reduce((s, i) => s + i.vatAmount, 0);
    const inputVAT = pi.reduce((s, i) => s + i.vatAmount, 0);
    const salesNet = si.reduce((s, i) => s + i.netAmount, 0);
    const purchasesNet = pi.reduce((s, i) => s + i.netAmount, 0);
    const netVAT = outputVAT - inputVAT;
    const vatReturn = vatReturns.find(r => r.period === q.label);
    return { ...q, si: si.length, pi: pi.length, salesNet, purchasesNet, outputVAT, inputVAT, netVAT, vatReturn };
  });

  const catBreakdown: Record<string, { net: number; vat: number; count: number }> = {};
  for (const p of purchaseInvoices) {
    const cat = p.category || 'Other';
    if (!catBreakdown[cat]) catBreakdown[cat] = { net: 0, vat: 0, count: 0 };
    catBreakdown[cat].net += p.netAmount;
    catBreakdown[cat].vat += p.vatAmount;
    catBreakdown[cat].count += 1;
  }

  const totalPNet = purchaseInvoices.reduce((s, i) => s + i.netAmount, 0);
  const totalPVAT = purchaseInvoices.reduce((s, i) => s + i.vatAmount, 0);
  const totalSNet = salesInvoices.reduce((s, i) => s + i.netAmount, 0);
  const totalSVAT = salesInvoices.reduce((s, i) => s + i.vatAmount, 0);

  const reports = [
    { label: '📊 Purchase Invoice Register', href: '/api/admin/tax/reports/purchase-register', desc: 'All purchase invoices with VAT breakdown (Excel)' },
    { label: '📊 Sales Invoice Register', href: '/api/admin/tax/reports/sales-register', desc: 'All sales invoices with VAT breakdown (Excel)' },
    { label: '📊 VAT Returns Summary', href: '/api/admin/tax/reports/vat-returns', desc: 'All VAT return periods with status (Excel)' },
    { label: '📊 Corporate Tax Report', href: '/api/admin/tax/reports/ct-report', desc: 'Corporate tax calculations and adjustments (Excel)' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Reports</h1>
          <p className="text-sm text-gray-500 mt-1">UAE VAT &amp; Corporate Tax reporting — FY {year}</p>
        </div>
      </div>

      {/* Download buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {reports.map(r => (
          <a key={r.href} href={r.href}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors">
            {r.label}
            <div className="text-xs font-normal text-blue-200 mt-1">{r.desc}</div>
          </a>
        ))}
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sales Net', value: FMT(totalSNet) },
          { label: 'Total Output VAT', value: FMT(totalSVAT) },
          { label: 'Total Purchases Net', value: FMT(totalPNet) },
          { label: 'Total Input VAT', value: FMT(totalPVAT) },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">{c.label}</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Quarterly Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Quarterly VAT Summary — {year}</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Quarter</th>
              <th className="px-4 py-3 text-right">Sales Net</th>
              <th className="px-4 py-3 text-right">Output VAT</th>
              <th className="px-4 py-3 text-right">Purchases Net</th>
              <th className="px-4 py-3 text-right">Input VAT</th>
              <th className="px-4 py-3 text-right">Net VAT Due</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {quarterly.map(q => (
              <tr key={q.label} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{q.label}</td>
                <td className="px-4 py-3 text-right tabular-nums">{FMT(q.salesNet)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-green-600">{FMT(q.outputVAT)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{FMT(q.purchasesNet)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-purple-600">{FMT(q.inputVAT)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-red-600">{FMT(q.netVAT)}</td>
                <td className="px-4 py-3 text-center">
                  {q.vatReturn
                    ? <span className={`px-2 py-0.5 rounded text-xs font-semibold ${q.vatReturn.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{q.vatReturn.status}</span>
                    : <Link href="/admin/tax/vat-returns" className="text-xs text-blue-500 hover:underline">Create</Link>}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-bold text-sm">
              <td className="px-4 py-3">Total {year}</td>
              <td className="px-4 py-3 text-right tabular-nums">{FMT(quarterly.reduce((s, q) => s + q.salesNet, 0))}</td>
              <td className="px-4 py-3 text-right tabular-nums text-green-600">{FMT(quarterly.reduce((s, q) => s + q.outputVAT, 0))}</td>
              <td className="px-4 py-3 text-right tabular-nums">{FMT(quarterly.reduce((s, q) => s + q.purchasesNet, 0))}</td>
              <td className="px-4 py-3 text-right tabular-nums text-purple-600">{FMT(quarterly.reduce((s, q) => s + q.inputVAT, 0))}</td>
              <td className="px-4 py-3 text-right tabular-nums font-black text-red-600">{FMT(quarterly.reduce((s, q) => s + q.netVAT, 0))}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Purchase category breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Input VAT by Expense Category</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Invoices</th>
              <th className="px-4 py-3 text-right">Net (AED)</th>
              <th className="px-4 py-3 text-right">VAT (AED)</th>
              <th className="px-4 py-3 text-left">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Object.keys(catBreakdown).length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400">No purchase invoices this year</td></tr>
            )}
            {Object.entries(catBreakdown).sort((a, b) => b[1].vat - a[1].vat).map(([cat, v]) => (
              <tr key={cat} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{cat}</td>
                <td className="px-4 py-3 text-right text-gray-500">{v.count}</td>
                <td className="px-4 py-3 text-right tabular-nums">{FMT(v.net)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-purple-700">{FMT(v.vat)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[80px]">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${totalPVAT > 0 ? Math.round((v.vat / totalPVAT) * 100) : 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{totalPVAT > 0 ? Math.round((v.vat / totalPVAT) * 100) : 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CT Returns table */}
      {ctReturns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Corporate Tax Returns</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">FY</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Taxable Income</th>
                <th className="px-4 py-3 text-right">CT @ 9%</th>
                <th className="px-4 py-3 text-right">Net Payable</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ctReturns.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">FY {r.financialYear}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{FMT(r.revenue)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{FMT(r.taxableIncome)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-purple-700 font-semibold">{FMT(r.ctAt9Pct)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold text-red-600">{FMT(r.netCTPayable)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
