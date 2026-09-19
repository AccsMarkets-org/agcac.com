'use client';
import { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Search, AlertTriangle } from 'lucide-react';

type PItem = { id?: string; description: string; quantity: number; unitPrice: number; vatRate: number; vatAmount: number; total: number };
type PInvoice = {
  id: string; invoiceRef: string; supplierName: string; supplierTRN: string; invoiceDate: string;
  invoiceNumber: string; netAmount: number; vatAmount: number; totalAmount: number; category: string;
  notes: string; fileUrl: string; status: string; createdAt: string; items: PItem[];
};

const CATS = ['Materials & Equipment', 'Tools & Consumables', 'Subcontracting', 'Transport & Logistics', 'Utilities', 'Professional Services', 'Software & IT', 'Office Supplies', 'Other'];
const fmt = (n: number) => `AED ${n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function emptyItem(): PItem { return { description: '', quantity: 1, unitPrice: 0, vatRate: 5, vatAmount: 0, total: 0 }; }

export default function PurchaseInvoicesClient({ initial }: { initial: PInvoice[] }) {
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PInvoice | null>(null);
  const [form, setForm] = useState<Partial<PInvoice>>({ status: 'Verified', items: [emptyItem()] });
  const [saving, setSaving] = useState(false);

  const filtered = data.filter(inv => !search || inv.supplierName.toLowerCase().includes(search.toLowerCase()) || inv.invoiceRef.toLowerCase().includes(search.toLowerCase()) || inv.category.toLowerCase().includes(search.toLowerCase()));
  const totalNet = data.reduce((s, i) => s + i.netAmount, 0);
  const totalVAT = data.reduce((s, i) => s + i.vatAmount, 0);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  function updateItem(idx: number, field: string, val: string) {
    const items = [...(form.items ?? [])];
    items[idx] = { ...items[idx], [field]: parseFloat(val) || val } as PItem;
    const it = items[idx];
    it.vatAmount = parseFloat(((it.unitPrice * it.quantity * it.vatRate) / 100).toFixed(2));
    it.total = parseFloat(((it.unitPrice * it.quantity) + it.vatAmount).toFixed(2));
    const net = items.reduce((s, x) => s + x.unitPrice * x.quantity, 0);
    const vat = items.reduce((s, x) => s + x.vatAmount, 0);
    setForm(p => ({ ...p, items, netAmount: parseFloat(net.toFixed(2)), vatAmount: parseFloat(vat.toFixed(2)), totalAmount: parseFloat((net + vat).toFixed(2)) }));
  }

  function openCreate() { setEditing(null); setForm({ status: 'Verified', items: [emptyItem()], invoiceDate: new Date().toISOString().split('T')[0] }); setShowModal(true); }
  function openEdit(inv: PInvoice) { setEditing(inv); setForm({ ...inv }); setShowModal(true); }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/admin/purchase-invoices', {
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

  async function handleDelete(id: string) {
    if (!confirm('Delete this purchase invoice?')) return;
    const res = await fetch(`/api/admin/purchase-invoices?id=${id}`, { method: 'DELETE' });
    if (res.ok) setData(d => d.filter(x => x.id !== id));
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-blue-700" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Invoices</h1>
            <p className="text-gray-500 text-sm">{data.length} invoices · Input VAT: {fmt(totalVAT)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-44 focus:outline-none" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800">
            <Plus className="w-4 h-4" /> Add Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Net Purchases', value: fmt(totalNet) },
          { label: 'Total Input VAT (5%)', value: fmt(totalVAT) },
          { label: 'Total Gross', value: fmt(totalNet + totalVAT) },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className="text-lg font-bold text-gray-900">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-sm">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-amber-800">Only invoices from VAT-registered suppliers with a valid TRN qualify for input VAT recovery. Verify supplier TRN on the FTA portal before claiming.</p>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">{search ? 'No results.' : 'No purchase invoices yet.'}</p>
          {!search && <button onClick={openCreate} className="mt-3 px-4 py-2 bg-blue-700 text-white text-sm font-semibold rounded-xl">Add First Invoice</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  {['Ref','Supplier','TRN','Date','Category','Net','VAT','Total','Status','Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-left font-semibold text-blue-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-blue-50/20">
                    <td className="px-3 py-3 font-mono text-xs text-blue-600">{inv.invoiceRef}</td>
                    <td className="px-3 py-3 font-medium text-gray-900 max-w-[140px] truncate">{inv.supplierName}</td>
                    <td className="px-3 py-3 text-xs text-gray-500 font-mono">{inv.supplierTRN || '—'}</td>
                    <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{inv.invoiceDate}</td>
                    <td className="px-3 py-3 text-xs text-gray-500 max-w-[100px] truncate">{inv.category || '—'}</td>
                    <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{fmt(inv.netAmount)}</td>
                    <td className="px-3 py-3 text-xs text-blue-700 font-semibold whitespace-nowrap">{fmt(inv.vatAmount)}</td>
                    <td className="px-3 py-3 text-xs font-bold text-gray-900 whitespace-nowrap">{fmt(inv.totalAmount)}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${inv.status === 'Verified' ? 'bg-green-100 text-green-700' : inv.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{inv.status}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        {inv.fileUrl && <a href={inv.fileUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">↗</a>}
                        <button onClick={() => openEdit(inv)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
                        <button onClick={() => handleDelete(inv.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                      </div>
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
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Purchase Invoice' : 'Add Purchase Invoice'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Supplier Name *</label>
                  <input value={form.supplierName ?? ''} onChange={f('supplierName')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Supplier TRN</label>
                  <input value={form.supplierTRN ?? ''} onChange={f('supplierTRN')} placeholder="100XXXXXXXXX003" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Invoice Date *</label>
                  <input type="date" value={form.invoiceDate ?? ''} onChange={f('invoiceDate')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Invoice Number</label>
                  <input value={form.invoiceNumber ?? ''} onChange={f('invoiceNumber')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <select value={form.category ?? ''} onChange={f('category')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    <option value="">— Select —</option>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">File / Scan URL</label>
                  <input value={form.fileUrl ?? ''} onChange={f('fileUrl')} placeholder="https://…" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">Line Items</h3>
                  <button onClick={() => setForm(p => ({ ...p, items: [...(p.items ?? []), emptyItem()] }))}
                    className="text-xs text-blue-600 hover:underline">+ Add Line</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-gray-100">
                      {['Description','Qty','Unit Price','VAT %','VAT Amt','Total',''].map(h => <th key={h} className="px-2 py-2 text-left font-semibold text-gray-500">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {(form.items ?? []).map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-1 pr-2"><input value={it.description} onChange={e => updateItem(idx, 'description', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs" placeholder="Item description" /></td>
                          <td className="py-1 pr-2 w-16"><input type="number" value={it.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right" /></td>
                          <td className="py-1 pr-2 w-24"><input type="number" value={it.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right" /></td>
                          <td className="py-1 pr-2 w-16"><input type="number" value={it.vatRate} onChange={e => updateItem(idx, 'vatRate', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right" /></td>
                          <td className="py-1 pr-2 w-20 text-right text-blue-700 font-semibold px-2">{it.vatAmount.toFixed(2)}</td>
                          <td className="py-1 pr-2 w-20 text-right font-bold px-2">{it.total.toFixed(2)}</td>
                          <td className="py-1 w-6">
                            <button onClick={() => setForm(p => ({ ...p, items: (p.items ?? []).filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600">×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mt-3 flex gap-6 justify-end text-sm">
                  <span>Net: <strong>{fmt(form.netAmount ?? 0)}</strong></span>
                  <span>VAT: <strong className="text-blue-700">{fmt(form.vatAmount ?? 0)}</strong></span>
                  <span>Total: <strong>{fmt(form.totalAmount ?? 0)}</strong></span>
                </div>
              </div>

              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes ?? ''} onChange={f('notes')} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" /></div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-700 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update' : 'Save Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
