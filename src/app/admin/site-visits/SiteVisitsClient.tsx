'use client';
import { useState } from 'react';
import { Calendar, Plus, Edit2, Phone, MessageCircle, Search } from 'lucide-react';

type Visit = {
  id: string; visitId: string; customerName: string; phone: string; location: string;
  mapsLink: string; service: string; visitDate: string; visitTime: string;
  status: string; notes: string; recommendation: string; estimatedCost: string;
  customerDecision: string; createdAt: string;
};

const S_COLOR: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-700', 'In Progress': 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-green-100 text-green-700', Cancelled: 'bg-red-100 text-red-700',
  'No Show': 'bg-gray-100 text-gray-500',
};

export default function SiteVisitsClient({ initial }: { initial: Visit[] }) {
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Visit | null>(null);
  const [form, setForm] = useState<Partial<Visit>>({ status: 'Scheduled' });
  const [saving, setSaving] = useState(false);

  const filtered = data.filter(v => {
    const q = search.toLowerCase();
    return (!search || v.customerName.toLowerCase().includes(q) || v.phone.includes(q) || v.visitId.toLowerCase().includes(q)) &&
      (!filterStatus || v.status === filterStatus);
  });

  function openCreate() { setEditing(null); setForm({ status: 'Scheduled' }); setShowModal(true); }
  function openEdit(v: Visit) { setEditing(v); setForm(v); setShowModal(true); }
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/admin/site-visits', {
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
          <Calendar className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Site Visits</h1>
            <p className="text-gray-500 text-sm">{data.length} visit{data.length !== 1 ? 's' : ''} • {data.filter(v => v.status === 'Scheduled').length} scheduled</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <option value="">All Status</option>
            {['Scheduled','In Progress','Completed','Cancelled','No Show'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Schedule Visit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: data.length, color: 'bg-gray-50 text-gray-700' },
          { label: 'Scheduled', value: data.filter(v => v.status === 'Scheduled').length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Completed', value: data.filter(v => v.status === 'Completed').length, color: 'bg-green-50 text-green-700' },
          { label: 'Cancelled', value: data.filter(v => v.status === 'Cancelled').length, color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search || filterStatus ? 'No results.' : 'No site visits yet.'}</p>
          {!search && !filterStatus && <button onClick={openCreate} className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl">Schedule First Visit</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  {['Visit ID','Customer','Phone','Service','Date','Time','Location','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-blue-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-blue-50/20">
                    <td className="px-4 py-3 font-mono text-blue-600 text-xs font-bold">{v.visitId}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{v.customerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><a href={`tel:${v.phone}`} className="text-blue-600 hover:underline text-xs">{v.phone}</a></td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[120px] truncate">{v.service || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {v.visitDate ? new Date(v.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{v.visitTime || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate">
                      {v.mapsLink ? <a href={v.mapsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Maps ↗</a> : v.location}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${S_COLOR[v.status] ?? 'bg-gray-100 text-gray-500'}`}>{v.status}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        <a href={`tel:${v.phone}`} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center"><Phone className="w-3.5 h-3.5 text-blue-600" /></a>
                        <a href={`https://wa.me/${v.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center"><MessageCircle className="w-3.5 h-3.5 text-green-600" /></a>
                        <button onClick={() => openEdit(v)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
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
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Site Visit' : 'Schedule Site Visit'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[['Customer Name *','customerName'],['Phone *','phone'],['Location *','location'],['Maps Link','mapsLink'],['Service','service']].map(([l,k]) => (
                <div key={k} className={k === 'location' || k === 'mapsLink' ? 'col-span-2 sm:col-span-1' : ''}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{l}</label>
                  <input value={(form as Record<string,string>)[k] ?? ''} onChange={f(k)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Visit Date</label>
                <input type="date" value={form.visitDate ?? ''} onChange={f('visitDate')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Visit Time</label>
                <input type="time" value={form.visitTime ?? ''} onChange={f('visitTime')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select value={form.status ?? 'Scheduled'} onChange={f('status')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {['Scheduled','In Progress','Completed','Cancelled','No Show'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Estimated Cost (AED)</label>
                <input value={form.estimatedCost ?? ''} onChange={f('estimatedCost')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              {['Notes','Recommendation','Customer Decision'].map((l) => {
                const k = l.toLowerCase().replace(' ', '') === 'customerdecision' ? 'customerDecision' : l.toLowerCase();
                return (
                  <div key={k} className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{l}</label>
                    <textarea value={(form as Record<string,string>)[k] ?? ''} onChange={f(k)} rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update Visit' : 'Schedule Visit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
