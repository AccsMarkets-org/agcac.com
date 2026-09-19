'use client';
import { useState } from 'react';
import { Wrench, Plus, Edit2, Phone, MessageCircle, Search } from 'lucide-react';

type Job = {
  id: string; jobId: string; customerName: string; phone: string; location: string;
  service: string; jobDate: string; jobTime: string; technicianName: string;
  materials: string; notes: string; workNotes: string; completionReport: string;
  status: string; createdAt: string;
};

const S_COLOR: Record<string, string> = {
  Assigned: 'bg-blue-100 text-blue-700', 'In Progress': 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-green-100 text-green-700', 'On Hold': 'bg-orange-100 text-orange-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function TechJobsClient({ initial }: { initial: Job[] }) {
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState<Partial<Job>>({ status: 'Assigned' });
  const [saving, setSaving] = useState(false);

  const filtered = data.filter(j => {
    const q = search.toLowerCase();
    return (!search || j.customerName.toLowerCase().includes(q) || j.phone.includes(q) || j.jobId.toLowerCase().includes(q) || j.technicianName.toLowerCase().includes(q)) &&
      (!filterStatus || j.status === filterStatus);
  });

  function openCreate() { setEditing(null); setForm({ status: 'Assigned' }); setShowModal(true); }
  function openEdit(j: Job) { setEditing(j); setForm(j); setShowModal(true); }
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/admin/technician-jobs', {
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

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Technician Jobs</h1>
            <p className="text-gray-500 text-sm">{data.length} job{data.length !== 1 ? 's' : ''} • {data.filter(j => j.status === 'In Progress').length} in progress</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-48 focus:outline-none" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <option value="">All Status</option>
            {['Assigned','In Progress','Completed','On Hold','Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700">
            <Plus className="w-4 h-4" /> New Job
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {['Assigned','In Progress','Completed','On Hold','Cancelled'].map(s => (
          <div key={s} className={`rounded-2xl p-3 text-center ${S_COLOR[s] ?? 'bg-gray-50 text-gray-700'}`}>
            <div className="text-2xl font-bold">{data.filter(j => j.status === s).length}</div>
            <div className="text-xs font-medium">{s}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Wrench className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search || filterStatus ? 'No results.' : 'No jobs yet.'}</p>
          {!search && !filterStatus && <button onClick={openCreate} className="mt-3 px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-xl">Create First Job</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-orange-50 border-b border-orange-100">
                <tr>
                  {['Job ID','Customer','Phone','Service','Date','Technician','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-orange-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(j => (
                  <tr key={j.id} className="hover:bg-orange-50/20">
                    <td className="px-4 py-3 font-mono text-orange-600 text-xs font-bold">{j.jobId}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{j.customerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><a href={`tel:${j.phone}`} className="text-blue-600 hover:underline text-xs">{j.phone}</a></td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[120px] truncate">{j.service}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {j.jobDate ? new Date(j.jobDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                      {j.jobTime ? ` ${j.jobTime}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{j.technicianName || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${S_COLOR[j.status] ?? 'bg-gray-100 text-gray-500'}`}>{j.status}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        <a href={`tel:${j.phone}`} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center"><Phone className="w-3.5 h-3.5 text-blue-600" /></a>
                        <a href={`https://wa.me/${j.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center"><MessageCircle className="w-3.5 h-3.5 text-green-600" /></a>
                        <button onClick={() => openEdit(j)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
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
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Job' : 'New Technician Job'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[['Customer Name *','customerName'],['Phone *','phone'],['Location *','location'],['Service *','service'],['Technician Name','technicianName']].map(([l,k]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{l}</label>
                  <input value={(form as Record<string,string>)[k] ?? ''} onChange={f(k)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Job Date</label>
                <input type="date" value={form.jobDate ?? ''} onChange={f('jobDate')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Job Time</label>
                <input type="time" value={form.jobTime ?? ''} onChange={f('jobTime')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select value={form.status ?? 'Assigned'} onChange={f('status')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {['Assigned','In Progress','Completed','On Hold','Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {[['Notes','notes'],['Materials Used','materials'],['Work Notes','workNotes'],['Completion Report','completionReport']].map(([l,k]) => (
                <div key={k} className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{l}</label>
                  <textarea value={(form as Record<string,string>)[k] ?? ''} onChange={f(k)} rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
