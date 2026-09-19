'use client';
import { useState } from 'react';

const REQUEST_TYPES = [
  { value: 'access', label: 'Access — get a copy of my data' },
  { value: 'correction', label: 'Correction — fix inaccurate data' },
  { value: 'deletion', label: 'Deletion — delete my data' },
  { value: 'withdrawal', label: 'Consent Withdrawal — withdraw consent' },
  { value: 'other', label: 'Other — general privacy enquiry' },
];

export default function DataRequestForm() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    requestType: '',
    details: '',
    consentGiven: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.email || !form.requestType || !form.details) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!form.consentGiven) {
      setError('Please confirm your identity and agreement before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/legal/privacy-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-green-800 mb-1">Request Submitted Successfully</h3>
            <p className="text-green-700 text-sm">
              Thank you for your submission. Our team will review your request and respond within a reasonable timeframe (typically within 30 days). We may contact you to verify your identity before processing.
            </p>
            <p className="text-green-600 text-xs mt-2">
              For urgent matters, please call us at{' '}
              <a href="tel:+971506725808" className="font-semibold hover:underline">+971-50-672-5808</a> or email{' '}
              <a href="mailto:info@alghawasac.com" className="font-semibold hover:underline">info@alghawasac.com</a>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={e => set('fullName', e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Phone / WhatsApp Number
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="+971 50 XXX XXXX"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Request Type <span className="text-red-500">*</span>
        </label>
        <select
          value={form.requestType}
          onChange={e => set('requestType', e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">Select a request type</option>
          {REQUEST_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Details of Your Request <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.details}
          onChange={e => set('details', e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-y"
          placeholder="Please describe your request in detail. For deletion or access requests, include any relevant reference numbers, service dates, or the email/phone you used when contacting us."
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consentGiven}
            onChange={e => set('consentGiven', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-red-600"
          />
          <span className="text-sm text-gray-700 leading-relaxed">
            I confirm that the information I have provided is accurate and relates to data about me personally. I understand that Al Ghawas may need to verify my identity before processing this request. I have read the{' '}
            <a href="/privacy-policy" className="text-red-600 hover:underline font-semibold">Privacy Policy</a>.{' '}
            <span className="text-red-500 font-semibold">*</span>
          </span>
        </label>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm"
      >
        {submitting ? 'Submitting...' : 'Submit Data Request'}
      </button>
    </form>
  );
}
