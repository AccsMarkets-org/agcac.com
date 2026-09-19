import { requireTaxAuth } from '@/lib/tax-auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

function aed(n: number) { return `AED ${n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

export default async function VATDashboardPage() {
  await requireTaxAuth();

  const [piData, siData, vatReturns] = await Promise.all([
    prisma.purchaseInvoice.findMany({
      where: { deletedAt: null, approvalStatus: 'Approved' },
      select: { netAmount: true, vatAmount: true, vatTreatment: true, recoverableVAT: true, nonRecoverableVAT: true },
    }),
    prisma.taxSalesInvoice.findMany({
      where: { deletedAt: null, approvalStatus: 'Approved' },
      select: { netAmount: true, vatAmount: true, vatTreatment: true },
    }),
    prisma.vATReturn.findMany({ orderBy: { endDate: 'desc' }, take: 10 }),
  ]);

  const standardSales = siData.filter(i => i.vatTreatment === 'Standard').reduce((s, i) => s + i.netAmount, 0);
  const zeroRatedSales = siData.filter(i => i.vatTreatment === 'ZeroRated').reduce((s, i) => s + i.netAmount, 0);
  const exemptSales = siData.filter(i => i.vatTreatment === 'Exempt').reduce((s, i) => s + i.netAmount, 0);
  const outputVAT = siData.reduce((s, i) => s + i.vatAmount, 0);
  const standardPurchases = piData.filter(i => i.vatTreatment === 'Standard').reduce((s, i) => s + i.netAmount, 0);
  const recoverableInput = piData.reduce((s, i) => s + i.recoverableVAT, 0);
  const netVAT = outputVAT - recoverableInput;

  const boxes = [
    { box: '1', label: 'Standard Rated Sales', amount: standardSales, vat: outputVAT, note: 'Taxable supplies at 5%' },
    { box: '2', label: 'Zero Rated Sales', amount: zeroRatedSales, vat: 0, note: 'Exports and zero-rated' },
    { box: '3', label: 'Exempt Sales', amount: exemptSales, vat: 0, note: 'Exempt from VAT' },
    { box: '6', label: 'Standard Rated Expenses', amount: standardPurchases, vat: recoverableInput, note: 'Recoverable input VAT' },
    { box: '13', label: 'Total Output VAT', amount: null, vat: outputVAT, note: 'Sum of output VAT' },
    { box: '14', label: 'Total Input VAT', amount: null, vat: recoverableInput, note: 'Recoverable input' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">VAT Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Live VAT position based on approved invoices</p>
        </div>
        <Link href="/admin/tax/vat-returns"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          Prepare Return →
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        Figures calculated from <strong>Approved invoices only</strong>. Pending invoices are excluded until approved.
      </div>

      <div className={`rounded-xl p-6 ${netVAT >= 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
        <div className="text-sm font-medium text-gray-600">Net VAT Position</div>
        <div className={`text-3xl font-black mt-1 ${netVAT >= 0 ? 'text-red-700' : 'text-green-700'}`}>{aed(Math.abs(netVAT))}</div>
        <div className={`text-sm mt-1 ${netVAT >= 0 ? 'text-red-600' : 'text-green-600'}`}>
          {netVAT >= 0 ? '→ Amount payable to FTA' : '← Refund due from FTA'}
        </div>
        <div className="mt-3 text-xs text-gray-500">Output VAT ({aed(outputVAT)}) − Recoverable Input VAT ({aed(recoverableInput)})</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">UAE FTA VAT Return Boxes</h2>
          <p className="text-xs text-gray-400 mt-0.5">Based on current approved invoices</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Box</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-right">Amount (AED)</th>
              <th className="px-4 py-3 text-right">VAT (AED)</th>
              <th className="px-4 py-3 text-left">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {boxes.map(b => (
              <tr key={b.box} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-bold text-blue-600">Box {b.box}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{b.label}</td>
                <td className="px-4 py-3 text-right tabular-nums">{b.amount !== null ? aed(b.amount) : '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">{aed(b.vat)}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{b.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {vatReturns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Recent VAT Returns</h2>
          <div className="space-y-2">
            {vatReturns.map(r => (
              <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{r.period}</span>
                  <span className="text-xs text-gray-400 ml-3">
                    {new Date(r.startDate).toLocaleDateString('en-AE')} – {new Date(r.endDate).toLocaleDateString('en-AE')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{aed(r.netVAT)}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.status === 'Submitted' ? 'bg-green-100 text-green-700' : r.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
