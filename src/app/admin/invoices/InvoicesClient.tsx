'use client';
import { useState } from 'react';
import { Receipt, Plus, Edit2, Search, Trash2 } from 'lucide-react';

type Item = { id?: string; description: string; quantity: number; unitPrice: number; total: number };
type Invoice = {
  id: string; invoiceId: string; customerName: string; phone: string; address: string; service: string;
  discount: number; vat: number; notes: string; status: string; invoiceDate: string; dueDate: string;
  items: Item[]; total: number; paid: number; balance: number; createdAt: string;
};

const S_COLOR: Record<string, string> = {
  Unpaid: 'bg-red-100 text-red-700', Partial: 'bg-orange-100 text-orange-700',
  Paid: 'bg-green-100 text-green-700', Overdue: 'bg-red-200 text-red-800', Cancelled: 'bg-gray-100 text-gray-500',
};

function calcTotals(items: Item[], discount: number, vat: number) {
  const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
  const net = subtotal * (1 - discount / 100);
  const vatAmt = net * (vat / 100);
  return { subtotal, net, vatAmt, total: net + vatAmt };
}

export default function InvoicesClient({ initial }: { initial: Invoice[] }) {
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Partial<Invoice>>({ discount: 0, vat: 5, status: 'Unpaid' });
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const [saving, setSaving] = useState(false);

  const filtered = data.filter(inv => {
    const qry = search.toLowerCase();
    return (!search || inv.customerName.toLowerCase().includes(qry) || inv.invoiceId.toLowerCase().includes(qry)) &&
      (!filterStatus || inv.status === filterStatus);
  });

  function openCreate() {
    setEditing(null);
    setForm({ discount: 0, vat: 5, status: 'Unpaid', invoiceDate: new Date().toISOString().split('T')[0] });
    setItems([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setShowModal(true);
  }

  function openEdit(inv: Invoice) {
    setEditing(inv);
    setForm(inv);
    setItems(inv.items.length > 0 ? inv.items : [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setShowModal(true);
  }

  function addItem() { setItems(it => [...it, { description: '', quantity: 1, unitPrice: 0, total: 0 }]); }
  function removeItem(i: number) { setItems(it => it.filter((_, idx) => idx !== i)); }
  function updateItem(i: number, k: string, v: string | number) {
    setItems(it => it.map((item, idx) => {
      if (idx !== i) return item;
      const u = { ...item, [k]: v };
      u.total = Number(u.quantity) * Number(u.unitPrice);
      return u;
    }));
  }

  const { vatAmt, total } = calcTotals(items, Number(form.discount ?? 0), Number(form.vat ?? 5));

  async function handleSave() {
    setSaving(true);
    const body = { ...form, items, ...(editing ? { id: editing.id } : {}) };
    const res = await fetch('/api/admin/invoices', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const saved = await res.json();
      setData(d => editing ? d.map(x => x.id === saved.id ? saved : x) : [saved, ...d]);
      setShowModal(false);
    }
    setSaving(false);
  }

  const totalRevenue = data.reduce((s, inv) => s + inv.paid, 0);
  const totalOutstanding = data.filter(inv => inv.status !== 'Paid').reduce((s, inv) => s + inv.balance, 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="w-6 h-6 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-500 text-sm">{data.length} invoice{data.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-48 focus:outline-none" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <option value="">All Status</option>
            {['Unpaid','Partial','Paid','Overdue','Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: data.length, color: 'bg-gray-50 text-gray-700' },
          { label: 'Paid', value: data.filter(inv => inv.status === 'Paid').length, color: 'bg-green-50 text-green-700' },
          { label: 'Total Collected', value: `AED ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Outstanding', value: `AED ${totalOutstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-sm font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search || filterStatus ? 'No results.' : 'No invoices yet.'}</p>
          {!search && !filterStatus && <button onClick={openCreate} className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl">Create First Invoice</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-50 border-b border-green-100">
                <tr>
                  {['Invoice ID','Customer','Service','Date','Total','Paid','Balance','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-green-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-green-50/20">
                    <td className="px-4 py-3 font-mono text-green-700 text-xs font-bold">{inv.invoiceId}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{inv.customerName}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[120px] truncate">{inv.service}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(inv.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">
                      AED {inv.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-green-700 whitespace-nowrap">
                      AED {inv.paid.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-xs font-semibold whitespace-nowrap ${inv.balance > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {inv.balance > 0 ? `AED ${inv.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${S_COLOR[inv.status] ?? 'bg-gray-100 text-gray-500'}`}>{inv.status}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => openEdit(inv)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
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
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? `Edit ${editing.invoiceId}` : 'New Invoice'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[['Customer Name *','customerName'],['Phone','phone'],['Address','address'],['Service','service']].map(([l,k]) => (
                  <div key={k}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{l}</label>
                    <input value={(form as Record<string,string>)[k] ?? ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-200" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Invoice Date</label>
                  <input type="date" value={form.invoiceDate ?? ''} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
                  <input type="date" value={form.dueDate ?? ''} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select value={form.status ?? 'Unpaid'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    {['Unpaid','Partial','Paid','Overdue','Cancelled'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700">Line Items</label>
                  <button onClick={addItem} className="flex items-center gap-1 text-xs text-green-600 font-semibold"><Plus className="w-3.5 h-3.5" /> Add</button>
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500">Description</th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-500 w-20">Qty</th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-500 w-28">Price (AED)</th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-500 w-28">Total (AED)</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5">
                            <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Description"
                              className="w-full border-0 bg-transparent focus:outline-none" />
                          </td>
                          <td className="px-3 py-1.5">
                            <input type="number" min={0} step="0.1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                              className="w-full border-0 bg-transparent focus:outline-none text-right" />
                          </td>
                          <td className="px-3 py-1.5">
                            <input type="number" min={0} step="0.01" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                              className="w-full border-0 bg-transparent focus:outline-none text-right" />
                          </td>
                          <td className="px-3 py-1.5 text-right font-semibold">
                            {(Number(item.quantity) * Number(item.unitPrice)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-2 py-1.5">
                            <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 flex-1">Discount (%)</span>
                  <input type="number" min={0} max={100} value={form.discount ?? 0} onChange={e => setForm(f => ({ ...f, discount: parseFloat(e.target.value) }))}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs text-right" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 flex-1">VAT (%)</span>
                  <input type="number" min={0} max={100} value={form.vat ?? 5} onChange={e => setForm(f => ({ ...f, vat: parseFloat(e.target.value) }))}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs text-right" />
                </div>
                <div className="flex justify-between text-sm text-gray-600 pt-1 border-t border-gray-200">
                  <span>VAT</span><span>AED {vatAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total</span><span>AED {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update Invoice' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
