'use client';
import { useState } from 'react';
import { FolderOpen, Plus, Edit2, Trash2, Search, Globe, Eye, EyeOff } from 'lucide-react';

type Project = {
  id: string; title: string; category: string; location: string; systemType: string;
  scopeOfWork: string; description: string; featured: boolean; showOnSite: boolean;
  imageUrl: string; year: number; clientName: string; status: string; createdAt: string;
};

const CATEGORIES = ['AC Installation', 'AC Maintenance', 'VRF System', 'Chilled Water', 'Duct Fabrication', 'Refrigeration', 'Ventilation', 'Plumbing', 'Renovation', 'Other'];

export default function PortfolioClient({ initial }: { initial: Project[] }) {
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Partial<Project>>({ featured: false, showOnSite: true, status: 'Active', year: new Date().getFullYear() });
  const [saving, setSaving] = useState(false);

  const filtered = data.filter(p => {
    const q = search.toLowerCase();
    return !search || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q);
  });

  function openCreate() { setEditing(null); setForm({ featured: false, showOnSite: true, status: 'Active', year: new Date().getFullYear() }); setShowModal(true); }
  function openEdit(p: Project) { setEditing(p); setForm(p); setShowModal(true); }
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/admin/portfolio', {
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
    if (!confirm('Delete this project?')) return;
    const res = await fetch(`/api/admin/portfolio?id=${id}`, { method: 'DELETE' });
    if (res.ok) setData(d => d.filter(x => x.id !== id));
  }

  async function toggleVisible(p: Project) {
    const res = await fetch('/api/admin/portfolio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, id: p.id, showOnSite: !p.showOnSite }),
    });
    if (res.ok) {
      const saved = await res.json();
      setData(d => d.map(x => x.id === saved.id ? saved : x));
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-6 h-6 text-teal-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Projects</h1>
            <p className="text-gray-500 text-sm">{data.length} project{data.length !== 1 ? 's' : ''} • {data.filter(p => p.showOnSite).length} visible on site</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-48 focus:outline-none" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FolderOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search ? 'No results.' : 'No portfolio projects yet.'}</p>
          {!search && <button onClick={openCreate} className="mt-3 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl">Add First Project</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 border-b border-teal-100">
                <tr>
                  {['Title','Category','Location','Year','Client','Featured','Visible','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-teal-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-teal-50/20">
                    <td className="px-4 py-3 font-semibold text-gray-900 max-w-[160px] truncate">{p.title}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{p.category}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[100px] truncate">{p.location || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{p.year || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[100px] truncate">{p.clientName || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {p.featured ? <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg font-semibold">⭐ Featured</span> : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleVisible(p)} title={p.showOnSite ? 'Hide from site' : 'Show on site'}>
                        {p.showOnSite ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
                        <button onClick={() => handleDelete(p.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
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
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Project' : 'Add Portfolio Project'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Project Title *</label>
                <input value={form.title ?? ''} onChange={f('title')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
                <select value={form.category ?? ''} onChange={f('category')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  <option value="">— Select —</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                <input value={form.location ?? ''} onChange={f('location')} placeholder="Dubai Marina, Abu Dhabi…" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
                <input type="number" value={form.year ?? new Date().getFullYear()} onChange={f('year')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Client Name</label>
                <input value={form.clientName ?? ''} onChange={f('clientName')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">System Type</label>
                <input value={form.systemType ?? ''} onChange={f('systemType')} placeholder="e.g. VRF, Split AC, HVAC…" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL (Unsplash or Upload)</label>
                <input value={form.imageUrl ?? ''} onChange={f('imageUrl')} placeholder="https://…" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Scope of Work</label>
                <textarea value={form.scopeOfWork ?? ''} onChange={f('scopeOfWork')} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea value={form.description ?? ''} onChange={f('description')} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured ?? false} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="rounded" />
                  <span className="text-sm font-medium text-gray-700">Featured Project</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.showOnSite ?? true} onChange={e => setForm(p => ({ ...p, showOnSite: e.target.checked }))} className="rounded" />
                  <span className="text-sm font-medium text-gray-700"><Globe className="w-3.5 h-3.5 inline mr-1" />Show on Website</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update Project' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
