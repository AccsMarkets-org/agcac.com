'use client';
import { useState } from 'react';

type SIItem = { id: string; description: string; quantity: number; unitPrice: number; discount: number; netAmount: number; vatRate: number; vatAmount: number; total: number };
type SalesInvoice = {
  id: string; invoiceRef: string; invoiceNumber: string; invoiceDate: string; dateOfSupply: string | null;
  customerName: string; customerTRN: string | null; customerAddress: string | null;
  serviceType: string; netAmount: number; vatRate: number; vatAmount: number; totalAmount: number;
  vatTreatment: string; paymentStatus: string; approvalStatus: string;
  approvedBy: string | null; approvedAt: string | null; notes: string | null; status: string;
  items: SIItem[];
};

const FMT = (n: number) => `AED ${n.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
const VAT_TREATMENTS = ['Standard', 'ZeroRated', 'Exempt', 'OutOfScope'];

const EMPTY = {
  invoiceNumber: '', invoiceDate: new Date().toISOString().slice(0, 10),
  dateOfSupply: '', customerName: '', customerTRN: '', customerAddress: '',
  serviceType: 'AC Service', netAmount: 0, vatRate: 5, vatAmount: 0, totalAmount: 0,
  vatTreatment: 'Standard', paymentStatus: 'Unpaid', approvalStatus: 'Pending',
  approvedBy: null, approvedAt: null, notes: '', status: 'Draft',
};

export default function SalesInvoicesClient({ invoices: init }: { invoices: SalesInvoice[] }) {
  const [invoices, setInvoices] = useState(init);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<SalesInvoice | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setForm({ ...EMPTY }); setEditing(null); setModal('add'); };
  const openEdit = (inv: SalesInvoice) => {
    setForm({
      invoiceNumber: inv.invoiceNumber, invoiceDate: inv.invoiceDate.slice(0, 10),
      dateOfSupply: inv.dateOfSupply?.slice(0, 10) ?? '',
      customerName: inv.customerName, customerTRN: inv.customerTRN ?? '',
      customerAddress: inv.customerAddress ?? '', serviceType: inv.serviceType,
      netAmount: inv.netAmount, vatRate: inv.vatRate, vatAmount: inv.vatAmount,
      totalAmount: inv.totalAmount, vatTreatment: inv.vatTreatment,
      paymentStatus: inv.paymentStatus, approvalStatus: inv.approvalStatus,
      approvedBy: null, approvedAt: null, notes: inv.notes ?? '', status: inv.status,
    });
    setEditing(inv); setModal('edit');
  };

  const calcVAT = (net: number, rate: number, treatment: string) => {
    if (treatment !== 'Standard') return { vatAmount: 0, totalAmount: net };
    const vat = parseFloat((net * rate / 100).toFixed(2));
    return { vatAmount: vat, totalAmount: parseFloat((net + vat).toFixed(2)) };
  };

  const handleSave = async () => {
    if (!form.customerName) return alert('Customer name is required');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/tax/sales-invoices', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(editing ? { id: editing.id } : {}), ...form }),
      });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      if (editing) setInvoices(v => v.map(i => i.id === saved.id ? saved : i));
      else setInvoices(v => [saved, ...v]);
      setModal(null);
    } catch { alert('Save failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/admin/tax/sales-invoices?id=${id}`, { method: 'DELETE' });
    setInvoices(v => v.filter(i => i.id !== id));
  };

  const filtered = invoices.filter(i => {
    const q = filter.toLowerCase();
    return !q || i.customerName.toLowerCase().includes(q) || i.invoiceNumber.toLowerCase().includes(q) || i.invoiceRef.toLowerCase().includes(q);
  });

  const totals = filtered.reduce((a, i) => ({ net: a.net + i.netAmount, vat: a.vat + i.vatAmount, total: a.total + i.totalAmount }), { net: 0, vat: 0, total: 0 });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tax invoices issued to customers — output VAT</p>
        </div>
        <button onClick={openAdd} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
          + New Invoice
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Net Sales', v: FMT(totals.net) }, { label: 'Output VAT', v: FMT(totals.vat) }, { label: 'Total Revenue', v: FMT(totals.total) }].map(c => (
          <div key={c.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">{c.label}</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{c.v}</div>
          </div>
        ))}
      </div>

      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search customer, invoice #..."
        className="w-full max-w-sm border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Ref</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Invoice #</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Net</th>
              <th className="px-4 py-3 text-right">VAT</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Treatment</th>
              <th className="px-4 py-3 text-center">Payment</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && <tr><td colSpan={10} className="py-10 text-center text-gray-400">No sales invoices found</td></tr>}
            {filtered.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-green-600">{inv.invoiceRef}</td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">{inv.customerName}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{inv.invoiceNumber}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(inv.invoiceDate).toLocaleDateString('en-AE')}</td>
                <td className="px-4 py-3 text-right tabular-nums">{inv.netAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-right tabular-nums text-green-600">{inv.vatAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">{inv.totalAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${inv.vatTreatment === 'Standard' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{inv.vatTreatment}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${inv.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{inv.paymentStatus}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-1.5">
                    <button onClick={() => openEdit(inv)} className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">Edit</button>
                    <button onClick={() => handleDelete(inv.id)} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{editing ? 'Edit' : 'New'} Sales Invoice</h2>
              <button onClick={() => setModal(null)} className="text-2xl text-gray-400 hover:text-gray-700">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 font-medium">Invoice Number *</label>
                <input value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Invoice Date</label>
                <input type="date" value={form.invoiceDate.slice(0, 10)} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-600 font-medium">Customer Name *</label>
                <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Customer TRN</label>
                <input value={form.customerTRN ?? ''} onChange={e => setForm(f => ({ ...f, customerTRN: e.target.value }))} maxLength={15}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Service Type</label>
                <input value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">VAT Treatment</label>
                <select value={form.vatTreatment} onChange={e => setForm(f => ({ ...f, vatTreatment: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {VAT_TREATMENTS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Net Amount (AED)</label>
                <input type="number" step="0.01" value={form.netAmount || ''}
                  onChange={e => { const n = parseFloat(e.target.value) || 0; const c = calcVAT(n, form.vatRate, form.vatTreatment); setForm(f => ({ ...f, netAmount: n, ...c })); }}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">VAT Rate %</label>
                <input type="number" step="0.01" value={form.vatRate}
                  onChange={e => { const r = parseFloat(e.target.value) || 0; const c = calcVAT(form.netAmount, r, form.vatTreatment); setForm(f => ({ ...f, vatRate: r, ...c })); }}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">VAT Amount (AED)</label>
                <input type="number" readOnly value={form.vatAmount}
                  className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Total (AED)</label>
                <input type="number" readOnly value={form.totalAmount}
                  className="mt-1 w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm font-semibold" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium">Payment Status</label>
                <select value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Unpaid</option><option>Paid</option><option>PartiallyPaid</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-600 font-medium">Notes</label>
                <textarea value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                {saving ? 'Saving...' : editing ? 'Update' : 'Save Invoice'}
              </button>
              <button onClick={() => setModal(null)} className="px-4 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
