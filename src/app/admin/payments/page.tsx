'use client';
import { useEffect, useState } from 'react';
import { CreditCard, Plus, Search, DollarSign } from 'lucide-react';

type Payment = {
  id: string; invoiceId: string; invoiceRef: string; customerName: string;
  service: string; amount: number; method: string; reference: string | null;
  note: string | null; invoiceStatus: string; createdAt: string;
};

type Invoice = { id: string; invoiceId: string; customerName: string; service: string };

const METHOD_COLOR: Record<string, string> = {
  Cash: 'bg-green-100 text-green-700', 'Bank Transfer': 'bg-blue-100 text-blue-700',
  Cheque: 'bg-purple-100 text-purple-700', Card: 'bg-indigo-100 text-indigo-700', Online: 'bg-cyan-100 text-cyan-700',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ invoiceId: '', amount: '', method: 'Cash', reference: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [pr, ir] = await Promise.all([
      fetch('/api/admin/payments').then(r => r.json()),
      fetch('/api/admin/invoices').then(r => r.json()),
    ]);
    setPayments(pr);
    setInvoices(ir.filter((inv: { status: string }) => inv.status !== 'Paid' && inv.status !== 'Cancelled'));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return !search || p.customerName.toLowerCase().includes(q) || p.invoiceRef.toLowerCase().includes(q) || p.method.toLowerCase().includes(q);
  });

  async function handleSave() {
    if (!form.invoiceId || !form.amount) return;
    setSaving(true);
    const res = await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) { await load(); setShowModal(false); setForm({ invoiceId: '', amount: '', method: 'Cash', reference: '', note: '' }); }
    setSaving(false);
  }

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500 text-sm">{payments.length} payment record{payments.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-48 focus:outline-none" />
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Payments', value: payments.length, color: 'bg-emerald-50 text-emerald-700', icon: <CreditCard className="w-5 h-5" /> },
          { label: 'Total Collected', value: `AED ${totalCollected.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'bg-green-50 text-green-700', icon: <DollarSign className="w-5 h-5" /> },
          { label: 'Cash', value: payments.filter(p => p.method === 'Cash').length, color: 'bg-yellow-50 text-yellow-700', icon: <DollarSign className="w-5 h-5" /> },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 flex items-center gap-3 ${s.color}`}>
            {s.icon}
            <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs font-medium">{s.label}</div></div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search ? 'No results.' : 'No payments recorded yet.'}</p>
          {!search && <button onClick={() => setShowModal(true)} className="mt-3 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl">Record First Payment</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 border-b border-emerald-100">
                <tr>
                  {['Date','Invoice','Customer','Amount (AED)','Method','Reference','Invoice Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-emerald-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-emerald-50/20">
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-700 text-xs font-bold">{p.invoiceRef}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{p.customerName}</td>
                    <td className="px-4 py-3 text-gray-800 font-bold text-sm whitespace-nowrap">
                      {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${METHOD_COLOR[p.method] ?? 'bg-gray-100 text-gray-500'}`}>{p.method}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.reference ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{p.invoiceStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Invoice *</label>
                <select value={form.invoiceId} onChange={e => setForm(f => ({ ...f, invoiceId: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  <option value="">— Select Invoice —</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.invoiceId} — {inv.customerName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (AED) *</label>
                <input type="number" min={0} step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Method</label>
                <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {['Cash','Bank Transfer','Cheque','Card','Online'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reference / Cheque No.</label>
                <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                  placeholder="Transfer ref, cheque number, etc."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Note</label>
                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.invoiceId || !form.amount}
                className="px-6 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
