'use client';
import { useState } from 'react';

type CTReturn = {
  id: string; financialYear: string; yearStart: string; yearEnd: string; status: string;
  revenue: number; costOfSales: number; grossProfit: number; operatingExpenses: number;
  otherIncome: number; otherExpenses: number; accountingNetProfit: number;
  nonDeductibleExpenses: number; deductibleAdjustments: number; exemptIncome: number;
  depreciationAdjustment: number; interestLimitation: number; relatedPartyAdjustments: number;
  taxLossesBF: number; taxLossesUsed: number; taxableIncome: number;
  taxableUpTo375k: number; taxableAbove375k: number;
  ctAt0Pct: number; ctAt9Pct: number; totalCTPayable: number;
  creditsPayments: number; netCTPayable: number;
  ftaRefNumber: string | null; submittedAt: string | null; notes: string | null;
};

type Live = { revenue: number; costOfSales: number; grossProfit: number; year: number };

const FMT = (n: number) => n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const THRESHOLD = 375000;
const CT_RATE = 0.09;

const EMPTY_FORM = {
  financialYear: String(new Date().getFullYear()),
  yearStart: `${new Date().getFullYear()}-01-01`,
  yearEnd: `${new Date().getFullYear()}-12-31`,
  revenue: 0, costOfSales: 0, grossProfit: 0,
  operatingExpenses: 0, otherIncome: 0, otherExpenses: 0, accountingNetProfit: 0,
  nonDeductibleExpenses: 0, deductibleAdjustments: 0, exemptIncome: 0,
  depreciationAdjustment: 0, interestLimitation: 0, relatedPartyAdjustments: 0,
  taxLossesBF: 0, taxLossesUsed: 0,
  creditsPayments: 0, notes: '',
};

export default function CorporateTaxClient({ returns: init, liveFigures }: { returns: CTReturn[]; liveFigures: Live }) {
  const [returns, setReturns] = useState(init);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM, revenue: liveFigures.revenue, costOfSales: liveFigures.costOfSales });

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(v => ({ ...v, [key]: parseFloat(e.target.value) || 0 }));
  };

  const grossProfit = form.revenue - form.costOfSales;
  const accountingNetProfit = grossProfit - form.operatingExpenses + form.otherIncome - form.otherExpenses;
  const taxableIncome = Math.max(0,
    accountingNetProfit + form.nonDeductibleExpenses - form.deductibleAdjustments
    - form.exemptIncome + form.depreciationAdjustment + form.interestLimitation
    + form.relatedPartyAdjustments - form.taxLossesUsed
  );
  const taxableUpTo375k = Math.min(taxableIncome, THRESHOLD);
  const taxableAbove375k = Math.max(0, taxableIncome - THRESHOLD);
  const ctAt9Pct = parseFloat((taxableAbove375k * CT_RATE).toFixed(2));
  const totalCTPayable = ctAt9Pct;
  const netCTPayable = parseFloat((totalCTPayable - form.creditsPayments).toFixed(2));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/tax/corporate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, grossProfit, accountingNetProfit, taxableIncome,
          taxableUpTo375k, taxableAbove375k, ctAt0Pct: 0, ctAt9Pct,
          totalCTPayable, netCTPayable,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json();
      setReturns(v => [created, ...v]);
      setModal(false);
    } catch { alert('Save failed'); } finally { setSaving(false); }
  };

  const handleFTARef = async (id: string) => {
    const ref = prompt('Enter FTA Reference Number from EmaraTax:');
    if (!ref?.trim()) return;
    const res = await fetch('/api/admin/tax/corporate-tax', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'Submitted', ftaRefNumber: ref.trim(), submittedAt: new Date().toISOString() }),
    });
    if (!res.ok) return alert('Update failed');
    const updated = await res.json();
    setReturns(v => v.map(r => r.id === updated.id ? updated : r));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Corporate Tax</h1>
          <p className="text-sm text-gray-500 mt-0.5">UAE CT — 0% up to AED 375,000 / 9% above threshold</p>
        </div>
        <button onClick={() => setModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
          + New CT Return
        </button>
      </div>

      <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-sm text-red-800">
        <strong>⚠️ Legal Notice:</strong> This is a calculation tool only. Corporate Tax must be filed by an authorized tax agent through{' '}
        <strong>EmaraTax</strong>. The system does not submit to the FTA.
      </div>

      {/* Live from system */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-purple-800 mb-3">Live Figures from System — FY {liveFigures.year} (Approved Invoices)</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><span className="text-purple-600">Revenue:</span> <strong>AED {FMT(liveFigures.revenue)}</strong></div>
          <div><span className="text-purple-600">Cost of Sales:</span> <strong>AED {FMT(liveFigures.costOfSales)}</strong></div>
          <div><span className="text-purple-600">Gross Profit:</span> <strong>AED {FMT(liveFigures.grossProfit)}</strong></div>
        </div>
        <p className="text-xs text-purple-600 mt-2">Estimated CT (no adjustments): AED {FMT(Math.max(0, liveFigures.grossProfit - THRESHOLD) * CT_RATE)}</p>
      </div>

      {/* CT Returns list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">FY</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">Taxable Income</th>
              <th className="px-4 py-3 text-right">CT @ 9%</th>
              <th className="px-4 py-3 text-right">Net CT Payable</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {returns.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-400">No CT returns yet</td></tr>}
            {returns.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">FY {r.financialYear}</td>
                <td className="px-4 py-3 text-right tabular-nums">{FMT(r.revenue)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{FMT(r.taxableIncome)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-purple-700 font-semibold">{FMT(r.ctAt9Pct)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-red-600">{FMT(r.netCTPayable)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${r.status === 'Submitted' ? 'bg-green-100 text-green-700' : r.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {r.status !== 'Submitted' && (
                    <button onClick={() => handleFTARef(r.id)} className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">Enter FTA Ref</button>
                  )}
                  {r.ftaRefNumber && <span className="text-xs text-green-600 font-mono ml-2">{r.ftaRefNumber}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculator modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">New Corporate Tax Return</h2>
              <button onClick={() => setModal(false)} className="text-2xl text-gray-400 hover:text-gray-700">&times;</button>
            </div>

            {/* Financial year */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Financial Year</label>
                <input value={form.financialYear} onChange={e => setForm(v => ({ ...v, financialYear: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Year Start</label>
                <input type="date" value={form.yearStart} onChange={e => setForm(v => ({ ...v, yearStart: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Year End</label>
                <input type="date" value={form.yearEnd} onChange={e => setForm(v => ({ ...v, yearEnd: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>

            {/* P&L section */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Profit &amp; Loss</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'revenue', label: 'Revenue (AED)' },
                  { key: 'costOfSales', label: 'Cost of Sales (AED)' },
                  { key: 'operatingExpenses', label: 'Operating Expenses (AED)' },
                  { key: 'otherIncome', label: 'Other Income (AED)' },
                  { key: 'otherExpenses', label: 'Other Expenses (AED)' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs text-gray-600">{field.label}</label>
                    <input type="number" step="0.01" value={(form as Record<string, number | string>)[field.key] as number || ''}
                      onChange={f(field.key)}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  </div>
                ))}
                <div className="bg-white rounded-lg p-3 col-span-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Gross Profit</span><strong>AED {FMT(grossProfit)}</strong></div>
                  <div className="flex justify-between text-sm mt-1"><span className="text-gray-500">Accounting Net Profit</span><strong>AED {FMT(accountingNetProfit)}</strong></div>
                </div>
              </div>
            </div>

            {/* Adjustments */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tax Adjustments</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'nonDeductibleExpenses', label: '+ Non-Deductible Expenses' },
                  { key: 'deductibleAdjustments', label: '- Deductible Adjustments' },
                  { key: 'exemptIncome', label: '- Exempt Income' },
                  { key: 'depreciationAdjustment', label: '+ Depreciation Adjustment' },
                  { key: 'interestLimitation', label: '+ Interest Limitation' },
                  { key: 'relatedPartyAdjustments', label: '+ Related Party Adj.' },
                  { key: 'taxLossesUsed', label: '- Tax Losses Used' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs text-gray-600">{field.label} (AED)</label>
                    <input type="number" step="0.01" value={(form as Record<string, number | string>)[field.key] as number || ''}
                      onChange={f(field.key)}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* CT Calculation */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2 text-sm">
              <h3 className="font-semibold text-purple-800 mb-3">Corporate Tax Calculation</h3>
              <div className="flex justify-between"><span>Taxable Income</span><strong>AED {FMT(taxableIncome)}</strong></div>
              <div className="flex justify-between"><span>Taxable @ 0% (first AED 375,000)</span><strong>AED {FMT(taxableUpTo375k)}</strong></div>
              <div className="flex justify-between"><span>Taxable @ 9% (above AED 375,000)</span><strong>AED {FMT(taxableAbove375k)}</strong></div>
              <div className="flex justify-between border-t border-purple-200 pt-2"><span>CT @ 9%</span><strong className="text-purple-700">AED {FMT(ctAt9Pct)}</strong></div>
              <div>
                <label className="text-xs text-gray-600">Credits / Payments Made (AED)</label>
                <input type="number" step="0.01" value={form.creditsPayments || ''}
                  onChange={f('creditsPayments')}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div className="flex justify-between border-t-2 border-purple-300 pt-2 text-base">
                <strong>Net CT Payable</strong>
                <strong className={netCTPayable >= 0 ? 'text-red-600' : 'text-green-600'}>AED {FMT(netCTPayable)}</strong>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(v => ({ ...v, notes: e.target.value }))} rows={2}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                {saving ? 'Saving...' : 'Save CT Return (Draft)'}
              </button>
              <button onClick={() => setModal(false)} className="px-4 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
