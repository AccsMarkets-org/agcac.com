'use client';
import { useEffect, useState } from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';

type Lead = {
  id: string; leadId: string; name: string; phone: string;
  service: string; status: string; deletedAt: string;
};

export default function TrashPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/trash');
    if (res.ok) setLeads(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function restore(id: string) {
    await fetch('/api/admin/trash', { method: 'POST', body: JSON.stringify({ id, action: 'restore' }), headers: { 'Content-Type': 'application/json' } });
    load();
  }

  async function deletePermanently(id: string) {
    if (!confirm('Permanently delete this lead? This cannot be undone.')) return;
    await fetch('/api/admin/trash', { method: 'POST', body: JSON.stringify({ id, action: 'delete' }), headers: { 'Content-Type': 'application/json' } });
    load();
  }

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.leadId.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search)
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trash2 className="w-6 h-6 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
            <p className="text-gray-500 text-sm">{leads.length} soft-deleted lead{leads.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search deleted leads…"
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-red-200"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Trash2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search ? 'No results.' : 'Trash is empty.'}</p>
          <p className="text-gray-400 text-sm mt-1">Deleted leads can be restored or permanently removed here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-700 font-medium">Items in trash can be restored within 30 days. After that they may be permanently deleted.</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Lead ID','Name','Phone','Service','Status','Deleted','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-red-50/20 transition-colors opacity-75">
                    <td className="px-4 py-3 font-mono text-red-600 text-xs">{l.leadId}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{l.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{l.phone}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[130px] truncate">{l.service}</td>
                    <td className="px-4 py-3 text-xs"><span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">{l.status}</span></td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(l.deletedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button onClick={() => restore(l.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                          <RotateCcw className="w-3 h-3" /> Restore
                        </button>
                        <button onClick={() => deletePermanently(l.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                          <X className="w-3 h-3" /> Delete
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
    </div>
  );
}
