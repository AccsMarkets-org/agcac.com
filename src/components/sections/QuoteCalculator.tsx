'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, Send, CheckCircle } from 'lucide-react';
import { captureUTMParams, fireLeadEvent } from '@/lib/tracking';

const PROPERTY_TYPES = ['Villa', 'Apartment', 'Office', 'Shop', 'Building', 'Warehouse', 'Factory', 'School', 'Hotel', 'Other'];
const SERVICE_TYPES = ['AC Installation', 'AC Repair', 'AC Maintenance', 'Duct Fabrication', 'VRF System', 'Chilled Water Works', 'Refrigeration', 'Plumbing', 'Ventilation', 'Annual Maintenance Contract (AMC)', 'Other'];
const URGENCY_OPTS = ['Emergency Today', 'Within 24 Hours', 'This Week', 'Planning Stage'];
const SYSTEMS = ['Split AC', 'Ducted Split', 'Package Unit', 'VRF/VRV', 'Chiller', 'Not Sure'];

const INITIAL = {
  name: '', phone: '', email: '', location: '',
  propertyType: '', service: '', rooms: '', area: '',
  acUnits: '', urgency: '', existingSystem: '', message: '',
  honeypot: '',
};

export default function QuoteCalculator() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [utmParams, setUtmParams] = useState({});

  useEffect(() => { setUtmParams(captureUTMParams()); }, []);

  const set = (key: keyof typeof INITIAL) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const nextStep = () => {
    if (step === 1 && (!form.name || !form.phone || !form.location)) {
      setError('Please fill Name, Phone and Location.');
      return;
    }
    if (step === 2 && (!form.propertyType || !form.service)) {
      setError('Please select Property Type and Service.');
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.location || !form.service || !form.propertyType) {
      setError('Please fill all required fields.');
      return;
    }
    if (form.honeypot) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sourcePage: 'quote-calculator', ...utmParams }),
      });
      const data = await res.json();
      if (data.success) {
        fireLeadEvent({ leadId: data.leadId, service: form.service, source: 'quote-calculator' });
        window.open(data.whatsappURL, '_blank');
        window.location.href = `/thank-you?id=${data.leadId}&name=${encodeURIComponent(form.name)}`;
      } else {
        setError(data.error || 'Submission failed. Please try again.');
      }
    } catch {
      setError('Network error. Please call us directly.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'form-input';
  const selectClass = 'form-select';

  return (
    <section id="quote-calculator" className="section-padding bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            Free HVAC Quote Tool
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Request Your HVAC Quote
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Fill out the form and our team will prepare a tailored quote for your project.
            Redirects to WhatsApp instantly.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Progress steps */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {[
              { n: 1, label: 'Your Info' },
              { n: 2, label: 'Project Details' },
              { n: 3, label: 'Submit' },
            ].map(({ n, label }) => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step > n ? 'bg-green-500 text-white' :
                  step === n ? 'bg-brand-red text-white shadow-glow-red' :
                  'bg-white/10 text-white/40'
                }`}>
                  {step > n ? <CheckCircle className="w-5 h-5" /> : n}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step >= n ? 'text-white' : 'text-white/30'}`}>{label}</span>
                {n < 3 && <div className={`w-12 h-0.5 ${step > n ? 'bg-green-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Honeypot */}
            <input type="text" name="honeypot" value={form.honeypot} onChange={set('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-bold text-navy-900 text-lg mb-5">Step 1: Your Contact Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input className={inputClass} placeholder="Your full name" value={form.name} onChange={set('name')} required />
                  </div>
                  <div>
                    <label className="form-label">Phone / WhatsApp *</label>
                    <input className={inputClass} placeholder="+971 5X XXX XXXX" type="tel" value={form.phone} onChange={set('phone')} required />
                  </div>
                </div>
                <div>
                  <label className="form-label">Email Address</label>
                  <input className={inputClass} placeholder="your@email.com" type="email" value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <label className="form-label">Location / Area *</label>
                  <input className={inputClass} placeholder="e.g. Khalifa City, MBZ City, Yas Island..." value={form.location} onChange={set('location')} required />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-bold text-navy-900 text-lg mb-5">Step 2: Project Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Property Type *</label>
                    <select className={selectClass} value={form.propertyType} onChange={set('propertyType')} required>
                      <option value="">Select type...</option>
                      {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Service Required *</label>
                    <select className={selectClass} value={form.service} onChange={set('service')} required>
                      <option value="">Select service...</option>
                      {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">No. of Rooms</label>
                    <input className={inputClass} placeholder="e.g. 4" type="number" min="0" value={form.rooms} onChange={set('rooms')} />
                  </div>
                  <div>
                    <label className="form-label">Area (sq.ft)</label>
                    <input className={inputClass} placeholder="e.g. 2500" type="number" min="0" value={form.area} onChange={set('area')} />
                  </div>
                  <div>
                    <label className="form-label">AC Units</label>
                    <input className={inputClass} placeholder="e.g. 5" type="number" min="0" value={form.acUnits} onChange={set('acUnits')} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Urgency</label>
                    <select className={selectClass} value={form.urgency} onChange={set('urgency')}>
                      <option value="">Select urgency...</option>
                      {URGENCY_OPTS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Existing System</label>
                    <select className={selectClass} value={form.existingSystem} onChange={set('existingSystem')}>
                      <option value="">Select system...</option>
                      {SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-bold text-navy-900 text-lg mb-5">Step 3: Additional Details</h3>
                <div>
                  <label className="form-label">Problem Description / Message</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Describe your HVAC issue, project requirements, or any specific details..."
                    value={form.message}
                    onChange={set('message')}
                  />
                </div>
                {/* Summary */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <h4 className="font-semibold text-navy-900 text-sm mb-3">Quote Request Summary</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {[
                      ['Name', form.name],
                      ['Phone', form.phone],
                      ['Location', form.location],
                      ['Service', form.service],
                      ['Property', form.propertyType],
                      ['Urgency', form.urgency || 'Not specified'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-gray-400 shrink-0">{k}:</span>
                        <span className="text-gray-700 font-medium truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="mt-1 rounded accent-brand-red" />
                  <span className="text-xs text-gray-500">
                    I agree to be contacted by Al Ghawas A/C team via phone or WhatsApp regarding my HVAC service request.
                  </span>
                </label>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 hover:border-navy-700 hover:text-navy-900 font-semibold py-3.5 rounded-xl transition-all"
                >
                  ← Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 btn-primary justify-center py-3.5 text-base"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3.5 rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                  ) : (
                    <><MessageCircle className="w-5 h-5" /> Submit & Open WhatsApp</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
