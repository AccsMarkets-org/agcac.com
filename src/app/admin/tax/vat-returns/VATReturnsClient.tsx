'use client';
import { useState } from 'react';

type VATReturn = {
  id: string; period: string; startDate: string; endDate: string; status: string;
  standardSales: number; zeroRatedSales: number; exemptSales: number; outputVAT: number;
  salesNet: number; standardPurchases: number; recoverableInput: number; nonRecoverableInput: number;
  inputVAT: number; purchasesNet: number; adjustments: number; adjustmentNotes: string | null;
  netVAT: number; ftaRefNumber: string | null; submittedAt: string | null; paymentRef: string | null;
  paidAt: string | null; notes: string | null; createdBy: string;
};

type LiveFigures = {
  standardSales: number; zeroRatedSales: number; exemptSales: number;
  outputVAT: number; standardPurchases: number; recoverableInput: number; netVAT: number;
};

const FMT = (n: number) => n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function VATReturnsClient({ returns: init, liveFigures }: { returns: VATReturn[]; liveFigures: LiveFigures }) {
  const [returns, setReturns] = useState(init);
  const [view, setView] = useState<VATReturn | null>(null);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    period: '', startDate: '', endDate: '',
    standardSales: liveFigures.standardSales, zeroRatedSales: liveFigures.zeroRatedSales,
    exemptSales: liveFigures.exemptSales, outputVAT: liveFigures.outputVAT,
    standardPurchases: liveFigures.standardPurchases, recoverableInput: liveFigures.recoverableInput,
    nonRecoverableInput: 0, adjustments: 0, adjustmentNotes: '', notes: '',
  });

  const netVAT = form.outputVAT - form.recoverableInput + form.adjustments;

  const openNew = () => {
    const now = new Date();
    const q = Math.ceil((now.getMonth() + 1) / 3);
    const y = now.getFullYear();
    const qStart = new Date(y, (q - 1) * 3, 1);
    const qEnd = new Date(y, q * 3, 0);
    setForm({
      period: `Q${q} ${y}`, startDate: qStart.toISOString().slice(0, 10), endDate: qEnd.toISOString().slice(0, 10),
      standardSales: liveFigures.standardSales, zeroRatedSales: liveFigures.zeroRatedSales,
      exemptSales: liveFigures.exemptSales, outputVAT: liveFigures.outputVAT,
      standardPurchases: liveFigures.standardPurchases, recoverableInput: liveFigures.recoverableInput,
      nonRecoverableInput: 0, adjustments: 0, adjustmentNotes: '', notes: '',
    });
    setModal(true);
  };

  const handleCreate = async () => {
    if (!form.period || !form.startDate || !form.endDate) return alert('Period name and dates are required');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/tax/vat-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, netVAT }),
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json();
      setReturns(v => [created, ...v]);
      setModal(false);
    } catch { alert('Save failed'); } finally { setSaving(false); }
  };

  const handleStatusUpdate = async (id: string, status: string, extra?: Record<string, string>) => {
    const res = await fetch('/api/admin/tax/vat-returns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, ...extra }),
    });
    if (!res.ok) return alert('Update failed');
    const updated = await res.json();
    setReturns(v => v.map(r => r.id === updated.id ? updated : r));
    if (view?.id === updated.id) setView(updated);
  };

  const handleFTARef = async (id: string) => {
    const ref = prompt('Enter FTA Reference Number from EmaraTax:');
    if (!ref?.trim()) return;
    handleStatusUpdate(id, 'Submitted', { ftaRefNumber: ref.trim(), submittedAt: new Date().toISOString() });
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">VAT Returns</h1>
          <p className="text-sm text-gray-500 mt-0.5">Prepare and track UAE VAT return filings</p>
        </div>
        <button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
          + New Return
        </button>
      </div>

      {/* Legal */}
      <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-sm text-red-800">
        <strong>⚠️ Manual Filing Required:</strong> Submit this return through{' '}
        <strong>EmaraTax (emara.tax)</strong>. After submission, enter the FTA reference number below. This system does NOT file with the FTA.
      </div>

      {/* Live figures */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-3">Current Live VAT Position (Approved Invoices)</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div><span className="text-blue-600">Output VAT:</span> <strong>AED {FMT(liveFigures.outputVAT)}</strong></div>
          <div><span className="text-blue-600">Input VAT:</span> <strong>AED {FMT(liveFigures.recoverableInput)}</strong></div>
          <div><span className={liveFigures.netVAT >= 0 ? 'text-red-600' : 'text-green-600'}>Net VAT: <strong>AED {FMT(liveFigures.netVAT)}</strong></span></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Period</th>
              <th className="px-4 py-3 text-left">Dates</th>
              <th className="px-4 py-3 text-right">Output VAT</th>
              <th className="px-4 py-3 text-right">Input VAT</th>
              <th className="px-4 py-3 text-right">Net VAT Due</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {returns.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-400">No VAT returns yet</td></tr>}
            {returns.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{r.period}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(r.startDate).toLocaleDateString('en-AE')} – {new Date(r.endDate).toLocaleDateString('en-AE')}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{FMT(r.outputVAT)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{FMT(r.recoverableInput)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-red-600">{FMT(r.netVAT)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    r.status === 'Submitted' ? 'bg-green-100 text-green-700' :
                    r.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                    r.status === 'InReview' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-1.5">
                    <button onClick={() => setView(r)} className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">View</button>
                    {r.status === 'Draft' && (
                      <button onClick={() => handleStatusUpdate(r.id, 'InReview')} className="text-xs text-purple-600 hover:bg-purple-50 px-2 py-1 rounded">Submit for Review</button>
                    )}
                    {r.status === 'InReview' && (
                      <button onClick={() => handleStatusUpdate(r.id, 'Approved')} className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded">Approve</button>
                    )}
                    {r.status === 'Approved' && (
                      <button onClick={() => handleFTARef(r.id)} className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded font-semibold">Enter FTA Ref</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View detail modal */}
      {view && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">VAT Return — {view.period}</h2>
              <button onClick={() => setView(null)} className="text-2xl text-gray-400 hover:text-gray-700">&times;</button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Filing Reminder:</strong> Submit through EmaraTax portal. After filing, enter FTA reference number using &quot;Enter FTA Ref&quot; to mark as Submitted.
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Sales (Output VAT)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-gray-500">Box 1 — Standard Sales</span><span className="font-medium">AED {FMT(view.standardSales)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Box 2 — Zero Rated Sales</span><span className="font-medium">AED {FMT(view.zeroRatedSales)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Box 3 — Exempt Sales</span><span className="font-medium">AED {FMT(view.exemptSales)}</span></div>
                  <div className="flex justify-between border-t border-gray-200 pt-2"><span className="font-semibold">Box 13 — Total Output VAT</span><span className="font-bold text-red-600">AED {FMT(view.outputVAT)}</span></div>
                </div>
              </div>
              <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Expenses (Input VAT)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-gray-500">Box 6 — Standard Expenses</span><span className="font-medium">AED {FMT(view.standardPurchases)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Recoverable Input VAT</span><span className="font-medium">AED {FMT(view.recoverableInput)}</span></div>
                  <div className="flex justify-between border-t border-gray-200 pt-2"><span className="font-semibold">Box 14 — Total Input VAT</span><span className="font-bold text-green-600">AED {FMT(view.inputVAT)}</span></div>
                </div>
              </div>
              <div className="col-span-2 border-2 border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Net VAT Due</span>
                  <span className="text-2xl font-black text-red-600">AED {FMT(view.netVAT)}</span>
                </div>
                {view.ftaRefNumber && (
                  <div className="mt-3 text-xs text-gray-500">FTA Reference: <span className="font-mono font-semibold text-gray-700">{view.ftaRefNumber}</span></div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {view.status === 'Approved' && (
                <button onClick={() => { handleFTARef(view.id); setView(null); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm">
                  Enter FTA Reference Number
                </button>
              )}
              <button onClick={() => setView(null)} className="flex-1 border border-gray-300 rounded-xl text-sm py-2.5 text-gray-600 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* New return modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">New VAT Return</h2>
              <button onClick={() => setModal(false)} className="text-2xl text-gray-400 hover:text-gray-700">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">Period Name (e.g. Q1 2025)</label>
                <input value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              {[
                { key: 'standardSales', label: 'Standard Sales' },
                { key: 'zeroRatedSales', label: 'Zero Rated Sales' },
                { key: 'exemptSales', label: 'Exempt Sales' },
                { key: 'outputVAT', label: 'Output VAT' },
                { key: 'standardPurchases', label: 'Standard Purchases' },
                { key: 'recoverableInput', label: 'Recoverable Input VAT' },
                { key: 'adjustments', label: 'Adjustments' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-600">{f.label} (AED)</label>
                  <input type="number" step="0.01" value={(form as Record<string, number | string>)[f.key] as number || ''}
                    onChange={e => setForm(v => ({ ...v, [f.key]: parseFloat(e.target.value) || 0 }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
              ))}
              <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Calculated Net VAT Due</span>
                  <span className={netVAT >= 0 ? 'text-red-600' : 'text-green-600'}>AED {FMT(netVAT)}</span>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                {saving ? 'Creating...' : 'Create VAT Return (Draft)'}
              </button>
              <button onClick={() => setModal(false)} className="px-4 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
