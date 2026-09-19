'use client';
import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { captureUTMParams, fireLeadEvent } from '@/lib/tracking';

const SERVICES = [
  'AC Installation', 'AC Maintenance', 'AC Repair', 'Duct Fabrication',
  'Ventilation', 'Refrigeration', 'Cold Store', 'Chilled Water',
  'VRF System', 'AMC Contract', 'Plumbing', 'Retrofit', 'Consultancy', 'Other',
];
const PROJECT_TYPES = ['Private Villa', 'Apartment', 'Office', 'Retail Shop', 'Commercial Building', 'School', 'Hotel', 'Factory', 'Government', 'Other'];

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', service: '', projectType: '', location: '', message: '', honeypot: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [utmParams, setUtmParams] = useState({});

  useEffect(() => { setUtmParams(captureUTMParams()); }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.service) {
      setError('Name, phone, and service are required.');
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
          propertyType: form.projectType,
          sourcePage: 'contact-form',
          ...utmParams,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fireLeadEvent({ leadId: data.leadId, service: form.service, source: 'contact-form' });
        window.open(data.whatsappURL, '_blank');
        window.location.href = `/thank-you?id=${data.leadId}&name=${encodeURIComponent(form.name)}`;
      } else {
        setError(data.error || 'Submission failed.');
      }
    } catch {
      setError('Network error. Please call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="container-custom relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            Contact Us
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Get In Touch</h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Ready to discuss your HVAC project? Contact us today for a free consultation and quote.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left: Contact info */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: MapPin, label: 'Address', value: 'Building No.238, Mohamed Bin Zayed City, ME-11, Abu Dhabi, UAE', href: undefined },
              { icon: Phone, label: 'Phone / WhatsApp', value: '+971-50-672-5808', href: 'tel:+971506725808' },
              { icon: Mail, label: 'Email', value: 'info@alghawasac.com', href: 'mailto:info@alghawasac.com' },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-brand-red/20 border border-brand-red/30 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-red" />
                </div>
                <div>
                  <div className="text-white/50 text-xs mb-0.5">{label}</div>
                  {href ? (
                    <a href={href} className="text-white font-semibold hover:text-brand-gold transition-colors">{value}</a>
                  ) : (
                    <p className="text-white font-semibold text-sm">{value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/971506725808?text=Hello%20Al%20Ghawas%2C%20I%20have%20an%20HVAC%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full justify-center py-4 mt-4"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
            <a href="tel:+971506725808" className="w-full border-2 border-white/30 text-white hover:bg-white/10 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
              <Phone className="w-5 h-5" />
              Call Now
            </a>

            {/* Google Maps placeholder */}
            <div className="bg-white/5 border border-white/10 rounded-2xl h-52 flex items-center justify-center mt-4">
              <div className="text-center text-white/40">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Google Maps</p>
                <p className="text-xs">Mohamed Bin Zayed City,<br />Abu Dhabi, UAE</p>
                <a
                  href="https://maps.google.com/?q=Mohamed+Bin+Zayed+City+Abu+Dhabi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-gold text-xs mt-2 inline-block hover:underline"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Right: Contact form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="font-bold text-navy-900 text-xl mb-6">Send Us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="honeypot" value={form.honeypot} onChange={set('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />
                <div className="grid sm:grid-cols-2 gap-4">
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
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Service Required *</label>
                    <select className="form-select" value={form.service} onChange={set('service')} required>
                      <option value="">Select service...</option>
                      {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Project Type</label>
                    <select className="form-select" value={form.projectType} onChange={set('projectType')}>
                      <option value="">Select type...</option>
                      {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Location / Area</label>
                  <input className="form-input" placeholder="Project location or area" value={form.location} onChange={set('location')} />
                </div>
                <div>
                  <label className="form-label">Message / Project Details</label>
                  <textarea className="form-textarea" rows={4} placeholder="Tell us about your HVAC requirements..." value={form.message} onChange={set('message')} />
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required className="mt-1 rounded accent-brand-red" />
                  <span className="text-xs text-gray-500">
                    I consent to Al Ghawas A/C contacting me about my HVAC service inquiry via phone or WhatsApp.
                  </span>
                </label>
                {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-navy-900 hover:bg-brand-red disabled:bg-gray-300 text-white font-bold py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-5 h-5" /> Send Message & Open WhatsApp</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
