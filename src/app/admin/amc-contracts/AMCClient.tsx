'use client';
import { useState } from 'react';
import { ClipboardList, Plus, Edit2, Phone, MessageCircle, Search, CheckCircle, XCircle, Clock } from 'lucide-react';

type Contract = {
  id: string; amcId: string; customerName: string; phone: string; location: string;
  propertyType: string; plan: string; startDate: string; endDate: string;
  numberOfVisits: number; visitFrequency: string; equipment: string;
  contractValue: number; paymentStatus: string; notes: string;
  status: string; createdAt: string;
};

const STATUS_COLOR: Record<string, string> = {
  Active: 'bg-green-100 text-green-700', Expired: 'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-500', Pending: 'bg-yellow-100 text-yellow-700',
};

const PAY_COLOR: Record<string, string> = {
  Paid: 'bg-green-100 text-green-700', Pending: 'bg-yellow-100 text-yellow-700',
  Overdue: 'bg-red-100 text-red-700', Partial: 'bg-orange-100 text-orange-700',
};

export default function AMCClient({ initial }: { initial: Contract[] }) {
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [form, setForm] = useState<Partial<Contract>>({ plan: 'Standard', numberOfVisits: 4, visitFrequency: 'Quarterly', status: 'Active', paymentStatus: 'Pending' });
  const [saving, setSaving] = useState(false);

  const filtered = data.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.customerName.toLowerCase().includes(q) || c.phone.includes(q) || c.amcId.toLowerCase().includes(q);
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const active = data.filter(c => c.status === 'Active');
  const expiring = active.filter(c => {
    const days = (new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days <= 30 && days > 0;
  });

  function openCreate() { setEditing(null); setForm({ plan: 'Standard', numberOfVisits: 4, visitFrequency: 'Quarterly', status: 'Active', paymentStatus: 'Pending' }); setShowModal(true); }
  function openEdit(c: Contract) { setEditing(c); setForm(c); setShowModal(true); }
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/admin/amc-contracts', {
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
          <ClipboardList className="w-6 h-6 text-amber-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AMC Contracts</h1>
            <p className="text-gray-500 text-sm">{data.length} contract{data.length !== 1 ? 's' : ''} total • {active.length} active</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-48 focus:outline-none focus:ring-2 focus:ring-amber-200" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            <option value="">All Status</option>
            {['Active','Expired','Pending','Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700">
            <Plus className="w-4 h-4" /> New AMC
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: data.length, icon: <ClipboardList className="w-5 h-5" />, color: 'bg-amber-50 text-amber-700' },
          { label: 'Active', value: active.length, icon: <CheckCircle className="w-5 h-5" />, color: 'bg-green-50 text-green-700' },
          { label: 'Expiring (30d)', value: expiring.length, icon: <Clock className="w-5 h-5" />, color: 'bg-orange-50 text-orange-700' },
          { label: 'Expired', value: data.filter(c => c.status === 'Expired').length, icon: <XCircle className="w-5 h-5" />, color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 flex items-center gap-3 ${s.color}`}>
            {s.icon}
            <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs font-medium">{s.label}</div></div>
          </div>
        ))}
      </div>

      {expiring.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <p className="text-orange-800 font-semibold text-sm">⚠ {expiring.length} contract{expiring.length !== 1 ? 's' : ''} expiring within 30 days — contact customer to renew.</p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{search || filterStatus ? 'No results.' : 'No AMC contracts yet.'}</p>
          {!search && !filterStatus && <button onClick={openCreate} className="mt-3 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl">Add First Contract</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 border-b border-amber-100">
                <tr>
                  {['AMC ID','Customer','Phone','Plan','Period','Visits','Value','Payment','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-amber-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-amber-50/30">
                    <td className="px-4 py-3 font-mono text-amber-700 text-xs font-bold">{c.amcId}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{c.customerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><a href={`tel:${c.phone}`} className="text-blue-600 hover:underline text-xs">{c.phone}</a></td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{c.plan}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(c.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} –{' '}
                      {new Date(c.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-gray-600">{c.numberOfVisits}x</td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      {c.contractValue ? `AED ${Number(c.contractValue).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${PAY_COLOR[c.paymentStatus] ?? 'bg-gray-100 text-gray-500'}`}>{c.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${STATUS_COLOR[c.status] ?? 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        <a href={`tel:${c.phone}`} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center"><Phone className="w-3.5 h-3.5 text-blue-600" /></a>
                        <a href={`https://wa.me/${c.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center"><MessageCircle className="w-3.5 h-3.5 text-green-600" /></a>
                        <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center"><Edit2 className="w-3.5 h-3.5 text-amber-600" /></button>
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
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit AMC Contract' : 'New AMC Contract'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[['Customer Name *','customerName','text'],['Phone *','phone','text'],['Location *','location','text']].map(([l,k,t]) => (
                <div key={k} className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{l}</label>
                  <input type={t} value={(form as Record<string,string|number>)[k] as string ?? ''} onChange={f(k)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Plan</label>
                <select value={form.plan ?? 'Standard'} onChange={f('plan')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {['Basic','Standard','Premium','Custom'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Property Type</label>
                <select value={form.propertyType ?? ''} onChange={f('propertyType')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  <option value="">— Select —</option>
                  {['Apartment','Villa','Office','Retail','Industrial','Hotel'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date *</label>
                <input type="date" value={form.startDate ?? ''} onChange={f('startDate')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">End Date *</label>
                <input type="date" value={form.endDate ?? ''} onChange={f('endDate')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Number of Visits</label>
                <input type="number" min={1} max={24} value={form.numberOfVisits ?? 4} onChange={f('numberOfVisits')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Visit Frequency</label>
                <select value={form.visitFrequency ?? 'Quarterly'} onChange={f('visitFrequency')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {['Monthly','Quarterly','Bi-Annual','Annual'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Contract Value (AED)</label>
                <input type="number" step="0.01" value={form.contractValue ?? ''} onChange={f('contractValue')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Status</label>
                <select value={form.paymentStatus ?? 'Pending'} onChange={f('paymentStatus')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {['Pending','Paid','Partial','Overdue'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select value={form.status ?? 'Active'} onChange={f('status')} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {['Active','Pending','Expired','Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Equipment (list AC units, models, etc.)</label>
                <textarea value={form.equipment ?? ''} onChange={f('equipment')} rows={3}
                  placeholder="e.g. 3x Samsung Split 1.5TR, 1x Daikin Cassette 2TR…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes ?? ''} onChange={f('notes')} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 disabled:opacity-50">
                {saving ? 'Saving…' : editing ? 'Update Contract' : 'Create Contract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
