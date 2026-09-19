'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle, X } from 'lucide-react';

type JobInfo = { id: string; title: string; department: string; location: string; jobType: string };

type DocUpload = { fileName: string; storedName: string; fileType: string; fileSize: number; documentType: string; url: string };

const VISA_OPTIONS = ['Visit Visa', 'Employment Visa', 'Residence Visa', 'Cancelled Visa', 'New Entry'];
const NOTICE_OPTIONS = ['Immediately', '2 Weeks', '1 Month', '2 Months', '3 Months'];

const CONSENT_TEXT = 'By submitting this application, I agree that Al Ghawas A/C Refrigeration Contracting LLC may contact me by phone, WhatsApp, or email regarding my job application. I confirm the information provided is accurate.';

export default function ApplicationFormClient({ job }: { job: JobInfo }) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '', phone: '', whatsapp: '', email: '',
    nationality: '', currentLocation: '', visaStatus: '',
    yearsExperience: '', currentSalary: '', expectedSalary: '',
    noticePeriod: '', drivingLicense: false,
    skills: '', message: '', consentGiven: false,
  });
  const [docs, setDocs] = useState<DocUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/careers/upload-cv', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Upload failed'); return; }
      setDocs(prev => [...prev.filter(d => d.documentType !== docType), { ...data, documentType: docType }]);
    } catch { alert('Upload failed'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const removeDoc = (docType: string) => setDocs(prev => prev.filter(d => d.documentType !== docType));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.email) return alert('Full name, phone, and email are required.');
    if (!form.consentGiven) return alert('Please agree to the consent statement.');
    if (docs.length === 0) return alert('Please upload your CV.');

    setSubmitting(true);
    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          jobId: job.id,
          positionApplied: job.title,
          department: job.department,
          consentText: CONSENT_TEXT,
          documents: docs,
        }),
      });
      if (res.ok) router.push('/careers/thank-you');
      else {
        const err = await res.json();
        alert(err.error || 'Submission failed. Please try again.');
      }
    } catch { alert('Submission error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const cv = docs.find(d => d.documentType === 'CV');
  const passport = docs.find(d => d.documentType === 'Passport');
  const cert = docs.find(d => d.documentType === 'Certificate');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Job summary */}
      <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0">AG</div>
        <div>
          <div className="font-bold text-gray-900">{job.title}</div>
          <div className="text-sm text-gray-500">{job.department} · {job.location} · {job.jobType}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 block mb-1">Full Name *</label>
              <input required value={form.fullName} onChange={e => set('fullName', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="As on passport" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Phone *</label>
              <input required value={form.phone} onChange={e => set('phone', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="+971 5X XXX XXXX" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">WhatsApp</label>
              <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Same as phone?" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Nationality</label>
              <input value={form.nationality} onChange={e => set('nationality', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. Indian, Pakistani..." />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Current Location</label>
              <input value={form.currentLocation} onChange={e => set('currentLocation', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="City, Country" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">UAE Visa Status</label>
              <select value={form.visaStatus} onChange={e => set('visaStatus', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                <option value="">Select...</option>
                {VISA_OPTIONS.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Experience & Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Years of Experience</label>
              <input value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. 3 years" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Notice Period</label>
              <select value={form.noticePeriod} onChange={e => set('noticePeriod', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                <option value="">Select...</option>
                {NOTICE_OPTIONS.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Current Salary (AED/month)</label>
              <input value={form.currentSalary} onChange={e => set('currentSalary', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Optional" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Expected Salary (AED/month)</label>
              <input value={form.expectedSalary} onChange={e => set('expectedSalary', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Optional" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-600 block mb-1">Skills</label>
              <input value={form.skills} onChange={e => set('skills', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. VRF, chilled water, duct installation, welding..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="dl" checked={form.drivingLicense} onChange={e => set('drivingLicense', e.target.checked)}
                className="w-4 h-4 rounded text-red-600" />
              <label htmlFor="dl" className="text-sm text-gray-700">I have a UAE driving license</label>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium text-gray-600 block mb-1">Cover Note / Message</label>
            <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Brief about yourself and why you want to join Al Ghawas..." />
          </div>
        </section>

        {/* Documents */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Upload Documents</h2>
          <div className="space-y-4">
            {/* CV */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">CV / Resume * (PDF, DOC, DOCX)</label>
              {cv ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{cv.fileName}</span>
                  <button type="button" onClick={() => removeDoc('CV')} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-red-400 hover:bg-red-50/30'}`}>
                  <Upload className={`w-4 h-4 ${uploading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                  <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Upload CV (max 10 MB)'}</span>
                  <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" disabled={uploading} onChange={e => handleFileUpload(e, 'CV')} />
                </label>
              )}
            </div>

            {/* Passport */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Passport Copy (optional)</label>
              {passport ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{passport.fileName}</span>
                  <button type="button" onClick={() => removeDoc('Passport')} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl px-4 py-3 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Upload passport copy (optional)</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled={uploading} onChange={e => handleFileUpload(e, 'Passport')} />
                </label>
              )}
            </div>

            {/* Certificates */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Certificates (optional)</label>
              {cert ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{cert.fileName}</span>
                  <button type="button" onClick={() => removeDoc('Certificate')} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl px-4 py-3 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Upload certificates (optional)</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled={uploading} onChange={e => handleFileUpload(e, 'Certificate')} />
                </label>
              )}
            </div>
          </div>
        </section>

        {/* Consent */}
        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <label className="flex gap-3 cursor-pointer">
            <input type="checkbox" checked={form.consentGiven} onChange={e => set('consentGiven', e.target.checked)}
              className="w-5 h-5 rounded text-red-600 mt-0.5 shrink-0" />
            <span className="text-sm text-gray-700 leading-relaxed">{CONSENT_TEXT}</span>
          </label>
        </section>

        <button type="submit" disabled={submitting || uploading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors disabled:opacity-60">
          {submitting ? 'Submitting Application...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
