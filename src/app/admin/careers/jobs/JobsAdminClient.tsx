'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Globe, EyeOff, Star, ExternalLink, Users, ToggleLeft, ToggleRight } from 'lucide-react';

type Job = {
  id: string; title: string; slug: string; department: string; location: string;
  jobType: string; experienceRequired: string; status: string; featured: boolean;
  published: boolean; closingDate: string | null; createdAt: string;
  _count: { applications: number };
};

const DEPTS = [
  'HVAC Technicians', 'A/C Mechanics', 'Duct Fabrication', 'Duct Installation',
  'Pipe Fitters', 'Welders', 'Project Supervisors', 'Site Supervisors',
  'Maintenance Team', 'Sales & Customer Support', 'Accounting & Admin',
  'Drivers / Helpers', 'Engineering / CAD Drafting',
];
const JOB_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Freelance'];
const LOCATIONS = ['Abu Dhabi, UAE', 'Dubai, UAE', 'Sharjah, UAE', 'UAE (Multiple Locations)'];

const EMPTY_FORM = {
  title: '', department: '', location: 'Abu Dhabi, UAE', jobType: 'Full-Time',
  experienceRequired: '1-3 years', salaryRange: '',
  overview: '', responsibilities: '', requirements: '', preferredSkills: '', benefits: '',
  requiredDocuments: '', status: 'Open', featured: false, published: true, closingDate: '',
  seoTitle: '', seoDescription: '',
};

const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-green-100 text-green-700',
  Draft: 'bg-gray-100 text-gray-600',
  Closed: 'bg-red-100 text-red-600',
  Archived: 'bg-amber-100 text-amber-700',
};

export default function JobsAdminClient({ jobs: init }: { jobs: Job[] }) {
  const [jobs, setJobs] = useState(init);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setModal(true); };
  const openEdit = (j: Job) => {
    setForm({
      title: j.title, department: j.department, location: j.location, jobType: j.jobType,
      experienceRequired: j.experienceRequired, salaryRange: '',
      overview: '', responsibilities: '', requirements: '', preferredSkills: '', benefits: '',
      requiredDocuments: '', status: j.status, featured: j.featured, published: j.published,
      closingDate: j.closingDate?.slice(0, 10) ?? '', seoTitle: '', seoDescription: '',
    });
    setEditing(j); setModal(true);
  };

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.department) return alert('Title and department are required.');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/careers/jobs', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      });
      if (!res.ok) throw new Error('Save failed');
      const saved = await res.json();
      if (editing) setJobs(v => v.map(j => j.id === saved.id ? { ...saved, _count: j._count, createdAt: j.createdAt } : j));
      else setJobs(v => [{ ...saved, _count: { applications: 0 } }, ...v]);
      setModal(false);
    } catch { alert('Save failed'); } finally { setSaving(false); }
  };

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    const res = await fetch('/api/admin/careers/jobs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: job.id, status: newStatus }),
    });
    if (res.ok) setJobs(v => v.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
  };

  const handleTogglePublish = async (job: Job) => {
    const res = await fetch('/api/admin/careers/jobs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: job.id, published: !job.published }),
    });
    if (res.ok) setJobs(v => v.map(j => j.id === job.id ? { ...j, published: !j.published } : j));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Archive this job?')) return;
    const res = await fetch(`/api/admin/careers/jobs?id=${id}`, { method: 'DELETE' });
    if (res.ok) setJobs(v => v.filter(j => j.id !== id));
  };

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    return (!q || j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q))
      && (!filterStatus || j.status === filterStatus);
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Positions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage open positions and career listings</p>
        </div>
        <button onClick={openAdd} className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', value: jobs.length, color: 'text-blue-600' },
          { label: 'Open', value: jobs.filter(j => j.status === 'Open').length, color: 'text-green-600' },
          { label: 'Published', value: jobs.filter(j => j.published).length, color: 'text-indigo-600' },
          { label: 'Total Applications', value: jobs.reduce((s, j) => s + j._count.applications, 0), color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color} mt-0.5`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..."
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
          <option value="">All Status</option>
          {['Open','Draft','Closed','Archived'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Title / Department</th>
              <th className="px-4 py-3 text-left">Location / Type</th>
              <th className="px-4 py-3 text-center">Apps</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Published</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No jobs found</td></tr>
            )}
            {filtered.map(job => (
              <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                    {job.featured && <Star className="w-3.5 h-3.5 text-amber-500" />}
                    {job.title}
                  </div>
                  <div className="text-xs text-red-600 mt-0.5">{job.department}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-700">{job.location}</div>
                  <div className="text-xs text-gray-400">{job.jobType}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link href={`/admin/careers/applications?jobId=${job.id}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold">
                    <Users className="w-3.5 h-3.5" />{job._count.applications}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleToggleStatus(job)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-600'}`}>
                    {job.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleTogglePublish(job)} className="text-gray-400 hover:text-blue-600 transition-colors">
                    {job.published ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-center">
                    <Link href={`/careers/${job.slug}`} target="_blank"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View public page">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    {job.published && job.status === 'Open' && (
                      <Link href={`/admin/careers/applications?jobId=${job.id}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="View applications">
                        <Users className="w-4 h-4" />
                      </Link>
                    )}
                    <button onClick={() => openEdit(job)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(job.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-4 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit' : 'Add'} Job Position</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Job Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. HVAC Technician" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Department *</label>
                <select value={form.department} onChange={e => set('department', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  <option value="">Select...</option>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
                <select value={form.location} onChange={e => set('location', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Job Type</label>
                <select value={form.jobType} onChange={e => set('jobType', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Experience Required</label>
                <input value={form.experienceRequired} onChange={e => set('experienceRequired', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="e.g. 2-5 years" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Salary Range</label>
                <input value={form.salaryRange} onChange={e => set('salaryRange', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="e.g. AED 2,000 - 4,000/month" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  {['Draft','Open','Closed','Archived'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Closing Date</label>
                <input type="date" value={form.closingDate} onChange={e => set('closingDate', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div className="flex items-center gap-4 col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} className="w-4 h-4 rounded text-red-600" />
                  <span className="text-sm text-gray-700">Published (visible on website)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 rounded text-amber-500" />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
              </div>
              {(['overview', 'responsibilities', 'requirements', 'preferredSkills', 'benefits'] as const).map(field => (
                <div key={field} className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')} {['overview','responsibilities','requirements'].includes(field) ? '*' : ''}
                  </label>
                  <textarea value={form[field]} onChange={e => set(field, e.target.value)} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={field === 'responsibilities' || field === 'requirements' ? 'One item per line' : ''} />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                {saving ? 'Saving...' : editing ? 'Update Job' : 'Create Job'}
              </button>
              <button onClick={() => setModal(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
