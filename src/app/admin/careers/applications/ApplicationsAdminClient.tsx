'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Download, FileText, Star, Calendar, Phone, MessageCircle } from 'lucide-react';

type Doc = { id: string; documentType: string; fileName: string; fileUrl: string; fileType: string };
type Application = {
  id: string; applicationId: string; createdAt: string; fullName: string; phone: string;
  email: string; positionApplied: string; department: string | null; yearsExperience: string | null;
  visaStatus: string | null; currentLocation: string | null; status: string; rating: number;
  job: { title: string; department: string } | null;
  documents: Doc[];
};

const STATUSES = ['New','Under Review','Shortlisted','Interview Scheduled','Interviewed','Selected','Offer Sent','Hired','Rejected','Archived'];

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-yellow-100 text-yellow-700',
  Shortlisted: 'bg-purple-100 text-purple-700',
  'Interview Scheduled': 'bg-indigo-100 text-indigo-700',
  Interviewed: 'bg-cyan-100 text-cyan-700',
  Selected: 'bg-teal-100 text-teal-700',
  'Offer Sent': 'bg-orange-100 text-orange-700',
  Hired: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-600',
  Archived: 'bg-gray-100 text-gray-500',
};

export default function ApplicationsAdminClient({
  applications: init,
  jobs,
}: {
  applications: Application[];
  jobs: { id: string; title: string }[];
}) {
  const [apps, setApps] = useState(init);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [viewApp, setViewApp] = useState<Application | null>(null);
  const [schedModal, setSchedModal] = useState<Application | null>(null);
  const [schedForm, setSchedForm] = useState({ interviewDate: '', interviewTime: '', mode: 'In-person', location: '', notes: '' });
  const [scheduling, setScheduling] = useState(false);

  const handleStatusChange = async (app: Application, status: string) => {
    const res = await fetch('/api/admin/careers/applications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: app.id, status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setApps(v => v.map(a => a.id === updated.id ? { ...a, ...updated } : a));
      if (viewApp?.id === app.id) setViewApp(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleRating = async (app: Application, rating: number) => {
    const res = await fetch('/api/admin/careers/applications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: app.id, rating }),
    });
    if (res.ok) setApps(v => v.map(a => a.id === app.id ? { ...a, rating } : a));
  };

  const handleScheduleInterview = async () => {
    if (!schedModal || !schedForm.interviewDate) return alert('Interview date required');
    setScheduling(true);
    try {
      const res = await fetch(`/api/admin/careers/applications/${schedModal.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule-interview', ...schedForm }),
      });
      if (res.ok) {
        setApps(v => v.map(a => a.id === schedModal.id ? { ...a, status: 'Interview Scheduled' } : a));
        setSchedModal(null);
        alert('Interview scheduled!');
      }
    } catch { alert('Failed to schedule'); } finally { setScheduling(false); }
  };

  const filtered = apps.filter(a => {
    const q = search.toLowerCase();
    return (!q || a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.positionApplied.toLowerCase().includes(q))
      && (!filterStatus || a.status === filterStatus)
      && (!filterJob || a.job?.title === jobs.find(j => j.id === filterJob)?.title);
  });

  const cvDoc = (app: Application) => app.documents.find(d => d.documentType === 'CV');

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Job applications received from candidates</p>
        </div>
        <Link href="/admin/careers/jobs" className="text-sm text-blue-600 hover:underline">← Back to Jobs</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total', value: apps.length, color: 'text-gray-900' },
          { label: 'New', value: apps.filter(a => a.status === 'New').length, color: 'text-blue-600' },
          { label: 'Shortlisted', value: apps.filter(a => a.status === 'Shortlisted').length, color: 'text-purple-600' },
          { label: 'Hired', value: apps.filter(a => a.status === 'Hired').length, color: 'text-green-600' },
          { label: 'Rejected', value: apps.filter(a => a.status === 'Rejected').length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm text-center">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, position..."
          className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterJob} onChange={e => setFilterJob(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All Jobs</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Candidate</th>
              <th className="px-4 py-3 text-left">Position</th>
              <th className="px-4 py-3 text-left">Details</th>
              <th className="px-4 py-3 text-center">Rating</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">CV</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No applications found</td></tr>
            )}
            {filtered.map(app => (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{app.fullName}</div>
                  <div className="text-xs text-gray-400">{app.applicationId}</div>
                  <div className="text-xs text-gray-400">{new Date(app.createdAt).toLocaleDateString('en-AE')}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-700">{app.positionApplied}</div>
                  {app.job && <div className="text-xs text-blue-600">{app.job.title}</div>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  <div>{app.visaStatus || '—'}</div>
                  <div>{app.yearsExperience ? `${app.yearsExperience} exp` : ''}</div>
                  <div>{app.currentLocation || ''}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => handleRating(app, n)}
                        className={`w-4 h-4 text-${app.rating >= n ? 'amber' : 'gray'}-${app.rating >= n ? '400' : '200'}`}>
                        <Star className={`w-4 h-4 ${app.rating >= n ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <select value={app.status} onChange={e => handleStatusChange(app, e.target.value)}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  {cvDoc(app) ? (
                    <a href={cvDoc(app)!.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs">
                      <FileText className="w-3.5 h-3.5" /> CV
                    </a>
                  ) : <span className="text-gray-300 text-xs">None</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-center">
                    <button onClick={() => setViewApp(app)} title="View"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <a href={`tel:${app.phone}`} title="Call"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                      <Phone className="w-4 h-4" />
                    </a>
                    <a href={`https://wa.me/${app.phone?.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(app.fullName)}%2C%20this%20is%20Al%20Ghawas%20HR.`}
                      target="_blank" rel="noopener noreferrer" title="WhatsApp"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <button onClick={() => { setSchedModal(app); setSchedForm({ interviewDate: '', interviewTime: '', mode: 'In-person', location: '', notes: '' }); }}
                      title="Schedule Interview"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Application Modal */}
      {viewApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <div className="font-bold text-lg text-gray-900">{viewApp.fullName}</div>
                <div className="text-sm text-gray-500">{viewApp.applicationId} · {viewApp.positionApplied}</div>
              </div>
              <button onClick={() => setViewApp(null)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Phone', viewApp.phone], ['Email', viewApp.email],
                  ['Nationality', '—'], ['Location', viewApp.currentLocation || '—'],
                  ['Visa Status', viewApp.visaStatus || '—'], ['Experience', viewApp.yearsExperience || '—'],
                  ['Applied For', viewApp.positionApplied], ['Submitted', new Date(viewApp.createdAt).toLocaleDateString('en-AE')],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 uppercase mb-0.5">{k}</div>
                    <div className="text-sm font-semibold text-gray-800">{v}</div>
                  </div>
                ))}
              </div>

              {/* Status change */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Update Status</label>
                <select value={viewApp.status} onChange={e => { handleStatusChange(viewApp, e.target.value); }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Documents */}
              {viewApp.documents.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-600 mb-2">Documents</div>
                  <div className="space-y-2">
                    {viewApp.documents.map(doc => (
                      <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 hover:bg-blue-100 transition-colors">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700 flex-1">{doc.documentType} — {doc.fileName}</span>
                        <Download className="w-4 h-4 text-blue-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <a href={`tel:${viewApp.phone}`}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a href={`https://wa.me/${viewApp.phone?.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(viewApp.fullName)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <button onClick={() => { setSchedModal(viewApp); setViewApp(null); }}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  <Calendar className="w-3.5 h-3.5" /> Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {schedModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-gray-900">Schedule Interview — {schedModal.fullName}</h2>
              <button onClick={() => setSchedModal(null)} className="text-gray-400 text-2xl">&times;</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Interview Date *</label>
                <input type="date" value={schedForm.interviewDate} onChange={e => setSchedForm(f => ({...f, interviewDate: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Time</label>
                <input type="time" value={schedForm.interviewTime} onChange={e => setSchedForm(f => ({...f, interviewTime: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Mode</label>
                <select value={schedForm.mode} onChange={e => setSchedForm(f => ({...f, mode: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  {['Phone','WhatsApp','In-person','Online'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Location / Link</label>
                <input value={schedForm.location} onChange={e => setSchedForm(f => ({...f, location: e.target.value}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="Office address or meeting link" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
                <textarea value={schedForm.notes} onChange={e => setSchedForm(f => ({...f, notes: e.target.value}))} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleScheduleInterview} disabled={scheduling}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                {scheduling ? 'Scheduling...' : 'Schedule Interview'}
              </button>
              <button onClick={() => setSchedModal(null)}
                className="px-4 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
