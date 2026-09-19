'use client';
import { useState, useEffect } from 'react';
import { Zap, Phone, MessageCircle, AlertTriangle } from 'lucide-react';
import { captureUTMParams, fireLeadEvent, fireCallClick } from '@/lib/tracking';

const PROBLEMS = [
  'AC not cooling', 'AC not turning on', 'Water leaking from AC',
  'Strange noise from AC', 'Foul smell from AC', 'Weak airflow',
  'AC freezing up', 'Chiller shutdown', 'Refrigeration failure', 'Other',
];
const URGENCY = ['Emergency - Need technician NOW', 'Within 2-3 hours', 'Today', 'Tomorrow'];

export default function EmergencySection() {
  const [form, setForm] = useState({ name: '', phone: '', location: '', problem: '', urgency: '', honeypot: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [utmParams, setUtmParams] = useState({});

  useEffect(() => { setUtmParams(captureUTMParams()); }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.location || !form.problem) {
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
        body: JSON.stringify({
          ...form,
          service: `Emergency: ${form.problem}`,
          sourcePage: 'emergency-form',
          ...utmParams,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fireLeadEvent({ leadId: data.leadId, service: 'Emergency Repair', source: 'emergency-form' });
        window.open(data.whatsappURL, '_blank');
        window.location.href = `/thank-you?id=${data.leadId}&name=${encodeURIComponent(form.name)}&emergency=1`;
      } else {
        setError(data.error || 'Submission failed. Please call us directly.');
      }
    } catch {
      setError('Network error. Please call us directly on +971-50-672-5808');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="emergency" className="section-padding bg-brand-red relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <span className="text-white/80 font-semibold text-sm uppercase tracking-wider">Emergency Support</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
              Need Emergency<br />
              AC Support in<br />
              Abu Dhabi?
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              Our team can assist with urgent AC breakdowns, cooling failures, refrigerant leaks,
              abnormal noise, weak airflow, water damage, and complete system failures.
            </p>

            {/* Emergency situations */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              {[
                '🌡️ AC not cooling', '💧 Water leaking', '🔊 Strange noise',
                '❄️ System freezing', '💨 Weak airflow', '⚡ Sudden shutdown',
                '🧊 Chiller failure', '🏭 Refrigeration fault',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-white/80 text-sm">
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="tel:+971506725808"
                onClick={() => fireCallClick('emergency-section')}
                className="bg-white text-brand-red hover:bg-red-50 font-bold px-8 py-4 rounded-xl flex items-center gap-2 transition-all shadow-xl text-lg"
              >
                <Phone className="w-5 h-5" />
                Call Now: +971-50-672-5808
              </a>
              <a
                href="https://wa.me/971506725808?text=EMERGENCY%3A%20I%20need%20urgent%20AC%20support%20in%20Abu%20Dhabi."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 border-2 border-white/40 text-white font-bold px-6 py-4 rounded-xl flex items-center gap-2 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Emergency
              </a>
            </div>
          </div>

          {/* Right: Emergency form */}
          <div>
            <div className="bg-white rounded-3xl shadow-2xl p-7">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-7 h-7 text-brand-red" />
                <div>
                  <h3 className="font-bold text-navy-900 text-lg">Emergency Request Form</h3>
                  <p className="text-gray-500 text-xs">Our team will respond immediately</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="honeypot" value={form.honeypot} onChange={set('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" placeholder="Your name" value={form.name} onChange={set('name')} required />
                  </div>
                  <div>
                    <label className="form-label">Phone *</label>
                    <input className="form-input" type="tel" placeholder="+971 5X XXX XXXX" value={form.phone} onChange={set('phone')} required />
                  </div>
                </div>
                <div>
                  <label className="form-label">Location / Address *</label>
                  <input className="form-input" placeholder="Full address or area name" value={form.location} onChange={set('location')} required />
                </div>
                <div>
                  <label className="form-label">Problem Type *</label>
                  <select className="form-select" value={form.problem} onChange={set('problem')} required>
                    <option value="">Select problem...</option>
                    {PROBLEMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Urgency</label>
                  <select className="form-select" value={form.urgency} onChange={set('urgency')}>
                    <option value="">Select urgency...</option>
                    {URGENCY.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-red hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Zap className="w-5 h-5" /> Send Emergency Request</>
                  )}
                </button>

                <p className="text-gray-400 text-xs text-center">
                  Or call directly: <a href="tel:+971506725808" className="font-bold text-brand-red">+971-50-672-5808</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
