'use client';
import { useState } from 'react';
import { FileText, Plus, Edit2, Trash2, Search } from 'lucide-react';

type ContentItem = {
  id: string; key: string; section: string; title: string;
  content: string; status: string; updatedBy: string; updatedAt: string;
};

const SECTIONS = ['Hero', 'About', 'Services', 'Why Us', 'Contact', 'Footer', 'SEO', 'Other'];

export default function WebsiteContentClient({ initial }: { initial: ContentItem[] }) {
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [form, setForm] = useState<Partial<ContentItem>>({ status: 'Active', section: 'Hero' });
  const [saving, setSaving] = useState(false);

  const filtered = data.filter(w => {
    const q = search.toLowerCase();
    return (!search || w.key.includes(q) || w.title.toLowerCase().includes(q) || w.content.toLowerCase().includes(q))
      && (!section || w.section === section);
  });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  function openCreate() { setEditing(null); setForm({ status: 'Active', section: section || 'Hero' }); setShowModal(true); }
  function openEdit(w: ContentItem) { setEditing(w); setForm(w); setShowModal(true); }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/admin/website-content', {
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
    if (!confirm('Delete this content entry?')) return;
    const res = await fetch(`/api/admin/website-content?id=${id}`, { method: 'DELETE' });
    if (res.ok) setData(d => d.filter(x => x.id !== id));
  }

  const sections = Array.from(new Set(data.map(w => w.section).filter(Boolean)));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Website Content</h1>
            <p className="text-gray-500 text-sm">{data.length} content block{data.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={section} onChange={e => setSection(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600">
            <option value="">All Sections</option>
            {sections.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-44 focus:outline-none" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Block
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search || section ? 'No results.' : 'No content blocks yet.'}</p>
          {!search && !section && <button onClick={openCreate} className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl">Add First Block</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-indigo-50 border-b border-indigo-100">
                <tr>
                  {['Key','Section','Title','Content Preview','Status','Updated','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-indigo-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(w => (
                  <tr key={w.id} className="hover:bg-indigo-50/20">
                    <td className="px-4 py-3 font-mono text-indigo-600 text-xs">{w.key}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-semibold">{w.section || '—'}</span></td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[140px] truncate">{w.title || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate">{w.content || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${w.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{w.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(w.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(w)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
                        <button onClick={() => handleDelete(w.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
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
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Content Block' : 'Add Content Block'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Key (unique identifier) *</label>
                  <input value={form.key ?? ''} onChange={f('key')} placeholder="hero_heading" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Section</label>
                  <select value={form.section ?? 'Hero'} onChange={f('section')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                    {SECTIONS.map(s => <option key={s}>{s}</option>)}
                  </select></div>
              </div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Title / Label</label>
                <input value={form.title ?? ''} onChange={f('title')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Content</label>
                <textarea value={form.content ?? ''} onChange={f('content')} rows={5} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none font-mono text-xs" placeholder="Text, HTML, or JSON…" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select value={form.status ?? 'Active'} onChange={f('status')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  <option>Active</option><option>Draft</option><option>Archived</option>
                </select></div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
