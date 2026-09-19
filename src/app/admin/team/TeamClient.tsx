'use client';
import { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Phone, Mail } from 'lucide-react';

type Member = {
  id: string; name: string; role: string; department: string;
  phone: string; email: string; active: boolean; sortOrder: number; notes: string; createdAt: string;
};

const DEPARTMENTS = ['Engineering', 'Operations', 'Sales', 'Administration', 'Technical', 'Management', 'Other'];

export default function TeamClient({ initial }: { initial: Member[] }) {
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<Partial<Member>>({ active: true, sortOrder: 0, department: 'Technical' });
  const [saving, setSaving] = useState(false);

  const filtered = data.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase()) || m.department.toLowerCase().includes(search.toLowerCase()));
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  function openCreate() { setEditing(null); setForm({ active: true, sortOrder: data.length, department: 'Technical' }); setShowModal(true); }
  function openEdit(m: Member) { setEditing(m); setForm(m); setShowModal(true); }

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/admin/team', {
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
    if (!confirm('Remove this team member?')) return;
    const res = await fetch(`/api/admin/team?id=${id}`, { method: 'DELETE' });
    if (res.ok) setData(d => d.filter(x => x.id !== id));
  }

  async function toggleActive(m: Member) {
    const res = await fetch('/api/admin/team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...m, id: m.id, active: !m.active }),
    });
    if (res.ok) { const saved = await res.json(); setData(d => d.map(x => x.id === saved.id ? saved : x)); }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-500 text-sm">{data.length} total • {data.filter(m => m.active).length} active</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-44 focus:outline-none" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search ? 'No results.' : 'No team members yet.'}</p>
          {!search && <button onClick={openCreate} className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl">Add First Member</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-purple-50 border-b border-purple-100">
                <tr>
                  {['Name','Role','Department','Contact','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-purple-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.sort((a, b) => a.sortOrder - b.sortOrder).map(m => (
                  <tr key={m.id} className="hover:bg-purple-50/20">
                    <td className="px-4 py-3 font-semibold text-gray-900">{m.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{m.role}</td>
                    <td className="px-4 py-3 text-xs"><span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg font-medium">{m.department || '—'}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"><Phone className="w-3 h-3" />{m.phone}</a>}
                        {m.email && <a href={`mailto:${m.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"><Mail className="w-3 h-3" />{m.email}</a>}
                        {!m.phone && !m.email && <span className="text-gray-400 text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(m)}>
                        <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${m.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {m.active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(m)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
                        <button onClick={() => handleDelete(m.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
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
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Member' : 'Add Team Member'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                <input value={form.name ?? ''} onChange={f('name')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Job Title / Role *</label>
                <input value={form.role ?? ''} onChange={f('role')} placeholder="HVAC Technician" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                <select value={form.department ?? 'Technical'} onChange={f('department')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                <input value={form.phone ?? ''} onChange={f('phone')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" value={form.email ?? ''} onChange={f('email')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder ?? 0} onChange={f('sortOrder')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" checked={form.active ?? true} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700">Currently active</span>
              </div>
              <div className="col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes ?? ''} onChange={f('notes')} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" /></div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
