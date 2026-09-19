'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Clock, Briefcase, Star, ChevronRight, ArrowRight, Users, Award, TrendingUp, Heart } from 'lucide-react';

type Job = {
  id: string; title: string; slug: string; department: string;
  location: string; jobType: string; experienceRequired: string;
  salaryRange: string | null; overview: string; featured: boolean;
  closingDate: string | null; createdAt: string;
};

const DEPARTMENTS = [
  'All', 'HVAC Technicians', 'A/C Mechanics', 'Duct Fabrication', 'Duct Installation',
  'Pipe Fitters', 'Welders', 'Project Supervisors', 'Site Supervisors',
  'Maintenance Team', 'Sales & Customer Support', 'Accounting & Admin',
  'Drivers / Helpers', 'Engineering / CAD Drafting',
];
const JOB_TYPES = ['All', 'Full-Time', 'Part-Time', 'Contract', 'Freelance'];

const WHY_WORK = [
  { icon: <TrendingUp className="w-6 h-6" />, title: 'Career Growth', desc: 'Clear advancement paths for technicians, supervisors, and engineers.' },
  { icon: <Award className="w-6 h-6" />, title: 'Certifications', desc: 'Company-sponsored training and UAE regulatory certifications.' },
  { icon: <Users className="w-6 h-6" />, title: 'Strong Team', desc: 'Work alongside experienced HVAC professionals in Abu Dhabi.' },
  { icon: <Heart className="w-6 h-6" />, title: 'Work Benefits', desc: 'Competitive salary, accommodation support, and transportation.' },
];

export default function CareersClient() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [type, setType] = useState('All');

  // General CV form
  const [cvForm, setCvForm] = useState({ fullName: '', phone: '', email: '', desiredPosition: '', department: '', message: '' });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvSubmitting, setCvSubmitting] = useState(false);
  const [cvDone, setCvDone] = useState(false);

  useEffect(() => {
    fetch('/api/careers/jobs')
      .then(r => r.json())
      .then(d => { setJobs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q) || j.location.toLowerCase().includes(q);
    const matchDept = dept === 'All' || j.department === dept;
    const matchType = type === 'All' || j.jobType === type;
    return matchSearch && matchDept && matchType;
  });

  const handleCvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvForm.fullName || !cvForm.phone) return alert('Name and phone are required');
    setCvSubmitting(true);
    try {
      let docs: object[] = [];
      if (cvFile) {
        const fd = new FormData();
        fd.append('file', cvFile);
        const up = await fetch('/api/careers/upload-cv', { method: 'POST', body: fd });
        const upData = await up.json();
        if (up.ok) docs = [{ ...upData, documentType: 'CV' }];
      }
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cvForm,
          email: cvForm.email || 'noemail@placeholder.com',
          positionApplied: cvForm.desiredPosition || 'General Application',
          message: cvForm.message,
          consentGiven: true,
          consentText: 'General CV submission',
          documents: docs,
        }),
      });
      if (res.ok) setCvDone(true);
      else alert('Submission failed. Please try again.');
    } catch { alert('Error submitting. Please try again.'); }
    finally { setCvSubmitting(false); }
  };

  return (
    <div className="pb-16 md:pb-0">
      {/* Hero */}
      <section className="bg-navy-950 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            <Briefcase className="w-4 h-4" /> We&apos;re Hiring
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Build Your Career with<br />
            <span className="text-red-500">Al Ghawas A/C</span> Refrigeration Contracting
          </h1>
          <p className="text-white/65 text-lg max-w-2xl mx-auto mb-8">
            Join a professional HVAC and mechanical contracting team serving residential, commercial, and industrial projects across Abu Dhabi and the UAE.
          </p>
          <div className="flex justify-center gap-6 text-sm text-white/50">
            <span>✓ Since 2005</span>
            <span>✓ Abu Dhabi Based</span>
            <span>✓ {jobs.length} Open Positions</span>
          </div>
        </div>
      </section>

      {/* Why work with us */}
      <section className="bg-white py-12 px-4 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Work With Al Ghawas?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {WHY_WORK.map(w => (
              <div key={w.title} className="text-center p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-red-600">{w.icon}</div>
                <div className="font-bold text-gray-900 text-sm mb-1">{w.title}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="bg-gray-50 py-8 px-4 border-b border-gray-200 sticky top-[80px] z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search jobs, skills, department..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              />
            </div>
            <select value={dept} onChange={e => setDept(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500">
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={type} onChange={e => setType(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500">
              {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {loading ? 'Loading jobs...' : `${filtered.length} position${filtered.length !== 1 ? 's' : ''} found`}
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No positions found matching your criteria.</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or submit a general CV below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map(job => (
                <div key={job.id} className={`bg-white rounded-2xl border ${job.featured ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} p-6 hover:shadow-lg transition-all group`}>
                  {job.featured && (
                    <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full mb-3">
                      <Star className="w-3 h-3" /> Featured
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors mb-1">{job.title}</h3>
                  <p className="text-sm text-red-600 font-medium mb-3">{job.department}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.jobType}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.experienceRequired}</span>
                    {job.salaryRange && <span className="text-green-600 font-medium">{job.salaryRange}</span>}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{job.overview}</p>
                  {job.closingDate && (
                    <p className="text-xs text-amber-600 mb-3">
                      Closing: {new Date(job.closingDate).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/careers/${job.slug}`}
                      className="flex-1 text-center bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                      Apply Now
                    </Link>
                    <Link href={`/careers/${job.slug}`}
                      className="border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm px-3 py-2 rounded-xl transition-colors flex items-center gap-1">
                      Details <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* General CV Section */}
      <section className="bg-navy-950 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Don&apos;t See Your Role?</h2>
            <p className="text-white/60 text-sm">Submit your CV and we&apos;ll keep it on file for future openings.</p>
          </div>

          {cvDone ? (
            <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-8 text-center text-white">
              <div className="text-4xl mb-3">✓</div>
              <p className="font-bold text-lg">CV Submitted!</p>
              <p className="text-white/60 text-sm mt-1">We&apos;ll contact you when a suitable position opens.</p>
            </div>
          ) : (
            <form onSubmit={handleCvSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60 font-medium block mb-1">Full Name *</label>
                  <input value={cvForm.fullName} onChange={e => setCvForm(f => ({...f, fullName: e.target.value}))}
                    required className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs text-white/60 font-medium block mb-1">Phone / WhatsApp *</label>
                  <input value={cvForm.phone} onChange={e => setCvForm(f => ({...f, phone: e.target.value}))}
                    required className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="+971 5X XXX XXXX" />
                </div>
                <div>
                  <label className="text-xs text-white/60 font-medium block mb-1">Email</label>
                  <input type="email" value={cvForm.email} onChange={e => setCvForm(f => ({...f, email: e.target.value}))}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-xs text-white/60 font-medium block mb-1">Desired Position</label>
                  <input value={cvForm.desiredPosition} onChange={e => setCvForm(f => ({...f, desiredPosition: e.target.value}))}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. HVAC Technician" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/60 font-medium block mb-1">Message</label>
                <textarea value={cvForm.message} onChange={e => setCvForm(f => ({...f, message: e.target.value}))}
                  rows={2} className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Brief about your experience..." />
              </div>
              <div>
                <label className="text-xs text-white/60 font-medium block mb-1">Upload CV (PDF/DOC/DOCX/JPG)</label>
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={e => setCvFile(e.target.files?.[0] || null)}
                  className="block text-xs text-white/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer" />
              </div>
              <button type="submit" disabled={cvSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {cvSubmitting ? 'Submitting...' : (<><ArrowRight className="w-4 h-4" /> Submit General CV</>)}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
