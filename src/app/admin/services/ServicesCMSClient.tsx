'use client';
import { useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react';

type Service = {
  id: string; title: string; slug: string; description: string; icon: string;
  imageUrl: string; priceRange: string; seoTitle: string; seoDesc: string;
  showOnSite: boolean; sortOrder: number; status: string; createdAt: string;
};

export default function ServicesCMSClient({ initial }: { initial: Service[] }) {
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<Partial<Service>>({ showOnSite: true, sortOrder: 0, status: 'Active' });
  const [saving, setSaving] = useState(false);

  const filtered = data.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.slug.includes(search));
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  function openCreate() { setEditing(null); setForm({ showOnSite: true, sortOrder: data.length, status: 'Active' }); setShowModal(true); }
  function openEdit(s: Service) { setEditing(s); setForm(s); setShowModal(true); }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/admin/services-cms', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
    });
    if (res.ok) {
      const saved = await res.json();
      setData(d => editing ? d.map(x => x.id === saved.id ? saved : x) : [...d, saved]);
      setShowModal(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this service?')) return;
    const res = await fetch(`/api/admin/services-cms?id=${id}`, { method: 'DELETE' });
    if (res.ok) setData(d => d.filter(x => x.id !== id));
  }

  async function toggleVisible(s: Service) {
    const res = await fetch('/api/admin/services-cms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...s, id: s.id, showOnSite: !s.showOnSite }),
    });
    if (res.ok) { const saved = await res.json(); setData(d => d.map(x => x.id === saved.id ? saved : x)); }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services CMS</h1>
            <p className="text-gray-500 text-sm">{data.length} service{data.length !== 1 ? 's' : ''} • {data.filter(s => s.showOnSite).length} visible</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-44 focus:outline-none" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        ℹ Service pages at <code className="font-mono bg-white/50 px-1 rounded">/services/[slug]</code> are currently driven by <code className="font-mono bg-white/50 px-1 rounded">src/data/services.ts</code>. Add entries here to CMS-manage future services.
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search ? 'No results.' : 'No CMS services yet.'}</p>
          {!search && <button onClick={openCreate} className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl">Add First Service</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  {['Order','Title','Slug','Price Range','Visible','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-blue-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.sort((a, b) => a.sortOrder - b.sortOrder).map(s => (
                  <tr key={s.id} className="hover:bg-blue-50/20">
                    <td className="px-4 py-3 text-gray-400 text-xs text-center">{s.sortOrder}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{s.title}</td>
                    <td className="px-4 py-3 font-mono text-blue-600 text-xs">/services/{s.slug}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.priceRange || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleVisible(s)}>
                        {s.showOnSite ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
                        <button onClick={() => handleDelete(s.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
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
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                <input value={form.title ?? ''} onChange={f('title')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Slug (URL) *</label>
                <input value={form.slug ?? ''} onChange={f('slug')} placeholder="ac-installation" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Price Range</label>
                <input value={form.priceRange ?? ''} onChange={f('priceRange')} placeholder="AED 500 – 5,000" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Icon (Emoji or name)</label>
                <input value={form.icon ?? ''} onChange={f('icon')} placeholder="❄️ or snowflake" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder ?? 0} onChange={f('sortOrder')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea value={form.description ?? ''} onChange={f('description')} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">SEO Title</label>
                <input value={form.seoTitle ?? ''} onChange={f('seoTitle')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">SEO Description</label>
                <textarea value={form.seoDesc ?? ''} onChange={f('seoDesc')} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <div className="flex items-center gap-4 col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.showOnSite ?? true} onChange={e => setForm(p => ({ ...p, showOnSite: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-gray-700">Show on website</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
