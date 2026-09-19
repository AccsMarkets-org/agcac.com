'use client';
import { useState } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Phone, MessageCircle, Search } from 'lucide-react';

type Customer = {
  id: string; customerId: string; name: string; phone: string; email: string;
  location: string; area: string; propertyType: string; notes: string;
  totalValue: number; invoiceCount: number; amcCount: number;
  lastService: string | null; createdAt: string;
};

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Office', 'Retail', 'Industrial', 'Hotel', 'School', 'Hospital', 'Other'];

export default function CustomersClient({ initial }: { initial: Customer[] }) {
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filtered = data.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.customerId.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() { setEditing(null); setForm({}); setError(''); setShowModal(true); }
  function openEdit(c: Customer) { setEditing(c); setForm(c); setError(''); setShowModal(true); }

  async function handleSave() {
    if (!form.name || !form.phone) { setError('Name and phone are required.'); return; }
    setSaving(true); setError('');
    const body = editing ? { ...form, id: editing.id } : form;
    const res = await fetch('/api/admin/customers', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const saved = await res.json();
      setData(d => editing ? d.map(x => x.id === saved.id ? { ...saved, invoiceCount: x.invoiceCount, amcCount: x.amcCount } : x) : [{ ...saved, invoiceCount: 0, amcCount: 0 }, ...d]);
      setShowModal(false);
    } else {
      setError('Failed to save. Please try again.');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this customer?')) return;
    const res = await fetch(`/api/admin/customers?id=${id}`, { method: 'DELETE' });
    if (res.ok) setData(d => d.filter(x => x.id !== id));
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCheck className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500 text-sm">{data.length} customer{data.length !== 1 ? 's' : ''} in CRM</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search customers…"
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', value: data.length, color: 'bg-blue-50 border-blue-100 text-blue-700' },
          { label: 'Total Invoiced', value: `AED ${data.reduce((s, c) => s + c.totalValue, 0).toLocaleString()}`, color: 'bg-green-50 border-green-100 text-green-700' },
          { label: 'Active AMC', value: data.filter(c => c.amcCount > 0).length, color: 'bg-amber-50 border-amber-100 text-amber-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <UserCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search ? 'No customers match your search.' : 'No customers yet.'}</p>
          {!search && <button onClick={openCreate} className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl">Add First Customer</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['ID','Name','Phone','Location','Type','Invoices','AMC','Value','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-blue-600 text-xs font-bold">{c.customerId}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a href={`tel:${c.phone}`} className="text-blue-600 hover:underline text-xs">{c.phone}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate">{c.location || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{c.propertyType || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-lg">{c.invoiceCount}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${c.amcCount > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>{c.amcCount}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      AED {c.totalValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        <a href={`tel:${c.phone}`} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center" title="Call">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                        </a>
                        <a href={`https://wa.me/${c.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center" title="WhatsApp">
                          <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                        </a>
                        <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center" title="Edit">
                          <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center" title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
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
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
              {[
                { label: 'Full Name *', key: 'name', placeholder: 'Mohammed Al Rashidi' },
                { label: 'Phone *', key: 'phone', placeholder: '+971 50 000 0000' },
                { label: 'Email', key: 'email', placeholder: 'email@example.com' },
                { label: 'Location / Address', key: 'location', placeholder: 'Dubai Marina, Building 5' },
                { label: 'Area', key: 'area', placeholder: 'Dubai Marina' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                  <input
                    value={(form as Record<string, string>)[field.key] ?? ''}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Property Type</label>
                <select value={form.propertyType ?? ''} onChange={e => setForm(f => ({ ...f, propertyType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="">— Select —</option>
                  {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} placeholder="Internal notes about this customer…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : editing ? 'Update Customer' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
