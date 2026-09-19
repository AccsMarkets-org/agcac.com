'use client';
import { useState } from 'react';
import { Award, Plus, Edit2, Trash2, Search, AlertTriangle } from 'lucide-react';

type Cert = {
  id: string; name: string; category: string; issueDate: string; expiryDate: string;
  status: string; showOnSite: boolean; fileUrl: string; notes: string; createdAt: string;
};

const CATEGORIES = ['Quality Management', 'Safety', 'Technical', 'Government', 'Trade', 'Insurance', 'Environmental', 'Other'];
const S_COLOR: Record<string, string> = {
  Active: 'bg-green-100 text-green-700', Expiring: 'bg-orange-100 text-orange-700',
  Expired: 'bg-red-100 text-red-700', Archived: 'bg-gray-100 text-gray-500',
};

function getStatus(expiryDate: string): string {
  if (!expiryDate) return 'Active';
  const days = (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 'Expired';
  if (days <= 60) return 'Expiring';
  return 'Active';
}

export default function CertificatesClient({ initial }: { initial: Cert[] }) {
  const [data, setData] = useState(initial.map(c => ({ ...c, computedStatus: getStatus(c.expiryDate) })));
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Cert | null>(null);
  const [form, setForm] = useState<Partial<Cert>>({ category: 'General', status: 'Active', showOnSite: true });
  const [saving, setSaving] = useState(false);

  const filtered = data.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()));
  const expiring = data.filter(c => c.computedStatus === 'Expiring' || c.computedStatus === 'Expired');
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  function openCreate() { setEditing(null); setForm({ category: 'General', status: 'Active', showOnSite: true }); setShowModal(true); }
  function openEdit(c: Cert) { setEditing(c); setForm(c); setShowModal(true); }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/admin/certificates', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
    });
    if (res.ok) {
      const saved = await res.json();
      setData(d => editing
        ? d.map(x => x.id === saved.id ? { ...saved, computedStatus: getStatus(saved.expiryDate) } : x)
        : [{ ...saved, computedStatus: getStatus(saved.expiryDate) }, ...d]);
      setShowModal(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this certificate?')) return;
    const res = await fetch(`/api/admin/certificates?id=${id}`, { method: 'DELETE' });
    if (res.ok) setData(d => d.filter(x => x.id !== id));
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-amber-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
            <p className="text-gray-500 text-sm">{data.length} certificate{data.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-44 focus:outline-none" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700">
            <Plus className="w-4 h-4" /> Add Certificate
          </button>
        </div>
      </div>

      {expiring.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <p className="text-orange-800 text-sm font-medium">
            {expiring.length} certificate{expiring.length > 1 ? 's' : ''} expiring or expired — renew immediately.
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Award className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search ? 'No results.' : 'No certificates added yet.'}</p>
          {!search && <button onClick={openCreate} className="mt-3 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl">Add First Certificate</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 border-b border-amber-100">
                <tr>
                  {['Certificate Name','Category','Issue Date','Expiry Date','Status','On Site','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-amber-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-amber-50/20">
                    <td className="px-4 py-3 font-semibold text-gray-900 max-w-[200px] truncate">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.category}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${S_COLOR[c.computedStatus] ?? 'bg-gray-100 text-gray-500'}`}>{c.computedStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs">{c.showOnSite ? '✅' : '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        {c.fileUrl && <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">↗</a>}
                        <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
                        <button onClick={() => handleDelete(c.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
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
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Certificate' : 'Add Certificate'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Certificate Name *</label>
                <input value={form.name ?? ''} onChange={f('name')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <select value={form.category ?? 'General'} onChange={f('category')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Issue Date</label>
                  <input type="date" value={form.issueDate ?? ''} onChange={f('issueDate')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date</label>
                  <input type="date" value={form.expiryDate ?? ''} onChange={f('expiryDate')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Certificate File URL</label>
                <input value={form.fileUrl ?? ''} onChange={f('fileUrl')} placeholder="https://…" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes ?? ''} onChange={f('notes')} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" /></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.showOnSite ?? true} onChange={e => setForm(p => ({ ...p, showOnSite: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700">Show on website certificates section</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
