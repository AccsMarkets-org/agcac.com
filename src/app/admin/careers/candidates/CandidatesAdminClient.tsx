'use client';

import { useState } from 'react';
import { Phone, MessageCircle, Star } from 'lucide-react';

type Candidate = {
  id: string; candidateId: string; fullName: string; phone: string;
  email: string | null; nationality: string | null; currentLocation: string | null;
  visaStatus: string | null; yearsExperience: string | null; skills: string | null;
  status: string; rating: number; createdAt: string;
  _count: { applications: number; interviews: number };
};

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Shortlisted: 'bg-purple-100 text-purple-700',
  Hired: 'bg-teal-100 text-teal-700',
  Rejected: 'bg-red-100 text-red-600',
  Blacklisted: 'bg-gray-900 text-white',
  Archived: 'bg-gray-100 text-gray-500',
};

export default function CandidatesAdminClient({ candidates }: { candidates: Candidate[] }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = candidates.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.fullName.toLowerCase().includes(q) || c.phone.includes(q) || (c.email || '').toLowerCase().includes(q))
      && (!filterStatus || c.status === filterStatus);
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidate Database</h1>
        <p className="text-sm text-gray-500 mt-0.5">All candidates who have ever applied</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: candidates.length },
          { label: 'Active', value: candidates.filter(c => c.status === 'Active').length },
          { label: 'Hired', value: candidates.filter(c => c.status === 'Hired').length },
          { label: 'Shortlisted', value: candidates.filter(c => c.status === 'Shortlisted').length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, email..."
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All Status</option>
          {['Active','Shortlisted','Hired','Rejected','Blacklisted','Archived'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Candidate</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Details</th>
              <th className="px-4 py-3 text-center">Apps / Interviews</th>
              <th className="px-4 py-3 text-center">Rating</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No candidates found</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{c.fullName}</div>
                  <div className="text-xs text-gray-400">{c.candidateId}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-700 text-sm">{c.phone}</div>
                  <div className="text-xs text-gray-400">{c.email || '—'}</div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  <div>{c.nationality || '—'}</div>
                  <div>{c.visaStatus || '—'}</div>
                  <div>{c.yearsExperience ? `${c.yearsExperience} exp` : ''}</div>
                </td>
                <td className="px-4 py-3 text-center text-sm">
                  <div className="text-blue-600 font-semibold">{c._count.applications} apps</div>
                  <div className="text-gray-400 text-xs">{c._count.interviews} interviews</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`w-3.5 h-3.5 ${c.rating >= n ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <a href={`tel:${c.phone}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                      <Phone className="w-4 h-4" />
                    </a>
                    <a href={`https://wa.me/${c.phone?.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(c.fullName)}%2C%20this%20is%20Al%20Ghawas%20HR.`}
                      target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
