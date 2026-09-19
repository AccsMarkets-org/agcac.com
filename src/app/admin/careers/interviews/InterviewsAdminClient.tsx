'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, MessageCircle, CheckCircle } from 'lucide-react';

type Interview = {
  id: string; interviewDate: string; interviewTime: string | null;
  mode: string; location: string | null; status: string; result: string | null; notes: string | null;
  application: { applicationId: string; fullName: string; positionApplied: string; phone: string };
  job: { title: string; department: string } | null;
  interviewer: { name: string } | null;
};

const STATUS_COLORS: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-600',
  Rescheduled: 'bg-amber-100 text-amber-700',
  'No Show': 'bg-gray-100 text-gray-600',
};

export default function InterviewsAdminClient({ interviews: init }: { interviews: Interview[] }) {
  const [interviews, setInterviews] = useState(init);
  const [filterStatus, setFilterStatus] = useState('');

  const handleUpdate = async (id: string, data: Partial<{ status: string; result: string }>) => {
    const res = await fetch('/api/admin/careers/interviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    if (res.ok) {
      const updated = await res.json();
      setInterviews(v => v.map(i => i.id === updated.id ? { ...i, ...updated } : i));
    }
  };

  const filtered = interviews.filter(i => !filterStatus || i.status === filterStatus);

  const today = new Date().toDateString();
  const upcoming = filtered.filter(i => i.status === 'Scheduled' && new Date(i.interviewDate) >= new Date());
  const past = filtered.filter(i => i.status !== 'Scheduled' || new Date(i.interviewDate) < new Date());

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track interview schedules and outcomes</p>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All Status</option>
          {['Scheduled','Completed','Cancelled','Rescheduled','No Show'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Today', value: interviews.filter(i => new Date(i.interviewDate).toDateString() === today).length, color: 'text-red-600' },
          { label: 'Upcoming', value: upcoming.length, color: 'text-blue-600' },
          { label: 'Completed', value: interviews.filter(i => i.status === 'Completed').length, color: 'text-green-600' },
          { label: 'Total', value: interviews.length, color: 'text-gray-900' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Upcoming Interviews</h2>
          <div className="space-y-3">
            {upcoming.map(interview => (
              <div key={interview.id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{interview.application.fullName}</div>
                    <div className="text-sm text-red-600">{interview.application.positionApplied}</div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                        {new Date(interview.interviewDate).toLocaleDateString('en-AE', { weekday: 'short', day: '2-digit', month: 'short' })}
                      </span>
                      {interview.interviewTime && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{interview.interviewTime}</span>}
                      <span className="flex items-center gap-1 capitalize">{interview.mode}</span>
                      {interview.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{interview.location}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[interview.status]}`}>
                      {interview.status}
                    </span>
                    <div className="flex gap-1">
                      <a href={`tel:${interview.application.phone}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                        <Phone className="w-4 h-4" />
                      </a>
                      <a href={`https://wa.me/${interview.application.phone?.replace(/\D/g,'')}?text=Hello%20${encodeURIComponent(interview.application.fullName)}%2C%20your%20interview%20is%20scheduled.`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      <button onClick={() => handleUpdate(interview.id, { status: 'Completed' })}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Mark Completed">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past / All */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Past Interviews</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Candidate</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Mode</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {past.map(interview => (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{interview.application.fullName}</div>
                      <div className="text-xs text-gray-400">{interview.application.positionApplied}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(interview.interviewDate).toLocaleDateString('en-AE')}
                      {interview.interviewTime && <div className="text-xs text-gray-400">{interview.interviewTime}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{interview.mode}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[interview.status] || 'bg-gray-100 text-gray-600'}`}>
                        {interview.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {interview.status === 'Completed' && !interview.result ? (
                        <div className="flex gap-1 justify-center">
                          {['Pass','Fail','Hold'].map(r => (
                            <button key={r} onClick={() => handleUpdate(interview.id, { result: r })}
                              className={`text-xs px-2 py-1 rounded-lg font-medium border transition-colors ${r === 'Pass' ? 'border-green-200 text-green-600 hover:bg-green-50' : r === 'Fail' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-amber-200 text-amber-600 hover:bg-amber-50'}`}>
                              {r}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className={`text-xs font-semibold ${interview.result === 'Pass' ? 'text-green-600' : interview.result === 'Fail' ? 'text-red-500' : 'text-gray-400'}`}>
                          {interview.result || '—'}
                        </span>
                      )}
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
