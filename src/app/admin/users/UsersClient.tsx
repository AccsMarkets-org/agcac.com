'use client';
import { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, Search, KeyRound } from 'lucide-react';

type AdminUser = {
  id: string; email: string; name: string; role: string;
  createdAt: string; lastLogin: string | null;
};

const ROLES = ['superadmin', 'admin', 'manager', 'viewer'];
const ROLE_COLOR: Record<string, string> = {
  superadmin: 'bg-red-100 text-red-700',
  admin: 'bg-blue-100 text-blue-700',
  manager: 'bg-purple-100 text-purple-700',
  viewer: 'bg-gray-100 text-gray-600',
};

export default function UsersClient({ initial, currentUserId }: { initial: AdminUser[]; currentUserId: string }) {
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<{ email: string; name: string; role: string; password: string }>({ email: '', name: '', role: 'admin', password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filtered = data.filter(u => !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase()));
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  function openCreate() { setEditing(null); setForm({ email: '', name: '', role: 'admin', password: '' }); setError(''); setShowModal(true); }
  function openEdit(u: AdminUser) { setEditing(u); setForm({ email: u.email, name: u.name, role: u.role, password: '' }); setError(''); setShowModal(true); }

  async function handleSave() {
    if (!form.email) { setError('Email is required.'); return; }
    if (!editing && !form.password) { setError('Password is required for new users.'); return; }
    setSaving(true); setError('');
    const body = editing ? { id: editing.id, email: form.email, name: form.name, role: form.role, ...(form.password ? { password: form.password } : {}) } : form;
    const res = await fetch('/api/admin/users', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const saved = await res.json();
      setData(d => editing ? d.map(x => x.id === saved.id ? saved : x) : [saved, ...d]);
      setShowModal(false);
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.error || 'Failed to save. Check if email is unique.');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (id === currentUserId) { alert('Cannot delete your own account.'); return; }
    if (!confirm('Delete this admin user? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    if (res.ok) setData(d => d.filter(x => x.id !== id));
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users & Roles</h1>
            <p className="text-gray-500 text-sm">{data.length} admin user{data.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-44 focus:outline-none" />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        ⚠ Only grant <strong>superadmin</strong> to trusted users — they can delete accounts and manage settings.
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 border-b border-blue-100">
              <tr>
                {['Name','Email','Role','Last Login','Created','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-blue-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className={`hover:bg-blue-50/20 ${u.id === currentUserId ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {u.name || '—'}
                    {u.id === currentUserId && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">You</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${ROLE_COLOR[u.role] ?? 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center" title="Edit"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
                      {u.id !== currentUserId && (
                        <button onClick={() => handleDelete(u.id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit User' : 'Add Admin User'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-700 rounded-xl px-4 py-2 text-sm">{error}</div>}
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <input value={form.name} onChange={f('name')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={f('email')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                <select value={form.role} onChange={f('role')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select></div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  {editing ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input type="password" value={form.password} onChange={f('password')} placeholder={editing ? '••••••••' : 'Minimum 8 characters'} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
