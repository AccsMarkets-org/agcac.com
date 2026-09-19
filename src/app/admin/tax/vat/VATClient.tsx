'use client';
import { useState } from 'react';
import { Receipt, Plus, Edit2, AlertTriangle } from 'lucide-react';

type VATReturn = {
  id: string; period: string; startDate: string; endDate: string;
  outputVAT: number; inputVAT: number; netVAT: number;
  salesNet: number; purchasesNet: number; status: string; notes: string;
  submittedAt: string | null; createdAt: string;
};

const fmt = (n: number) => `AED ${n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_COLOR: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Prepared: 'bg-blue-100 text-blue-700',
  Submitted: 'bg-green-100 text-green-700',
  Amended: 'bg-amber-100 text-amber-700',
};

export default function VATClient({ initial }: { initial: VATReturn[] }) {
  const [data, setData] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<VATReturn | null>(null);
  const [form, setForm] = useState<Partial<VATReturn>>({ status: 'Draft' });
  const [saving, setSaving] = useState(false);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  function calcVAT() {
    const salesNet = parseFloat(String(form.salesNet ?? 0));
    const purchasesNet = parseFloat(String(form.purchasesNet ?? 0));
    const outputVAT = parseFloat((salesNet * 0.05).toFixed(2));
    const inputVAT = parseFloat((purchasesNet * 0.05).toFixed(2));
    const netVAT = parseFloat((outputVAT - inputVAT).toFixed(2));
    setForm(p => ({ ...p, outputVAT, inputVAT, netVAT }));
  }

  function openCreate() { setEditing(null); setForm({ status: 'Draft', startDate: '', endDate: '', salesNet: 0, purchasesNet: 0, outputVAT: 0, inputVAT: 0, netVAT: 0 }); setShowModal(true); }
  function openEdit(r: VATReturn) { setEditing(r); setForm(r); setShowModal(true); }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/admin/vat-returns', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
    });
    if (res.ok) {
      const saved = await res.json();
      setData(d => editing ? d.map(x => x.id === saved.id ? saved : x) : [saved, ...d]);
      setShowModal(false);
    }
    setSaving(false);
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="w-6 h-6 text-blue-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">VAT Returns</h1>
            <p className="text-gray-500 text-sm">UAE Federal Tax Authority · 5% VAT</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800">
          <Plus className="w-4 h-4" /> New VAT Return
        </button>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <p className="text-red-800 text-sm">
          <strong>Do not submit directly through this system.</strong> Prepare the return here, download the summary, then file manually via the <strong>EmaraTax portal</strong> using your authorized accountant credentials.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No VAT returns yet.</p>
          <button onClick={openCreate} className="mt-3 px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-xl">Create First VAT Return</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  {['Period','Start','End','Sales (Net)','Output VAT','Input VAT','Net VAT Payable','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-blue-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map(r => (
                  <tr key={r.id} className="hover:bg-blue-50/20">
                    <td className="px-4 py-3 font-bold text-gray-900">{r.period}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.startDate}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.endDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{fmt(r.salesNet)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{fmt(r.outputVAT)}</td>
                    <td className="px-4 py-3 text-sm text-blue-600">({fmt(r.inputVAT)})</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{fmt(r.netVAT)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${STATUS_COLOR[r.status] ?? 'bg-gray-100'}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit VAT Return' : 'New VAT Return'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Period Label (e.g. Q1 2026)</label>
                <input value={form.period ?? ''} onChange={f('period')} placeholder="Q1 2026" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                  <input type="date" value={form.startDate ?? ''} onChange={f('startDate')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                  <input type="date" value={form.endDate ?? ''} onChange={f('endDate')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-blue-800">VAT Calculation</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Total Sales (Net, excl. VAT)</label>
                    <input type="number" value={form.salesNet ?? 0} onChange={f('salesNet')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-gray-600 mb-1">Total Purchases (Net)</label>
                    <input type="number" value={form.purchasesNet ?? 0} onChange={f('purchasesNet')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
                </div>
                <button onClick={calcVAT} type="button" className="w-full py-2 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800">
                  Auto-Calculate at 5% VAT
                </button>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[['Output VAT', form.outputVAT ?? 0], ['Input VAT', form.inputVAT ?? 0], ['Net VAT', form.netVAT ?? 0]].map(([label, val]) => (
                    <div key={String(label)} className="bg-white rounded-xl p-3 text-center">
                      <p className="text-[11px] text-gray-500">{label}</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">AED {Number(val).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select value={form.status ?? 'Draft'} onChange={f('status')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  <option>Draft</option><option>Prepared</option><option>Submitted</option><option>Amended</option>
                </select></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes ?? ''} onChange={f('notes')} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" /></div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update' : 'Save Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
