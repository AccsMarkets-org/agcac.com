'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, MessageCircle, CheckCircle, ChevronDown, Send, Loader2 } from 'lucide-react';
import { captureUTMParams, fireLeadEvent } from '@/lib/tracking';
import type { ServiceData } from '@/data/services';

const PHONE = '+971506725808';

export default function ServicePageClient({ service }: { service: ServiceData }) {
  const [form, setForm] = useState({ name: '', phone: '', location: '', message: '', honeypot: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [utmParams, setUtmParams] = useState({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => { setUtmParams(captureUTMParams()); }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return;
    if (!form.name || !form.phone) { setError('Name and phone are required.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          service: service.name,
          sourcePage: `services/${service.slug}`,
          formName: 'service-page-form',
          ...utmParams,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fireLeadEvent({ leadId: data.leadId, service: service.name, source: `services/${service.slug}` });
        window.open(data.whatsappURL, '_blank');
        window.location.href = `/thank-you?id=${data.leadId}&name=${encodeURIComponent(form.name)}`;
      } else {
        setError(data.error || 'Submission failed. Please call us directly.');
      }
    } catch {
      setError('Network error. Please call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className={`relative bg-gradient-to-br ${service.color} text-white py-16 overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <Image src={service.image} alt={service.name} fill className="object-cover" sizes="100vw" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <div className="text-5xl mb-4">{service.icon}</div>
            <h1 className="text-4xl font-black mb-3">{service.tagline}</h1>
            <p className="text-white/80 text-lg leading-relaxed mb-8">{service.description}</p>
            <div className="flex flex-wrap gap-3">
              <a href={`tel:${PHONE}`}
                className="flex items-center gap-2 bg-white text-gray-900 font-bold px-5 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-md"
              >
                <Phone className="w-4 h-4" /> Call Now
              </a>
              <a
                href={`https://wa.me/971506725808?text=${encodeURIComponent(`Hello, I need ${service.name} service in Abu Dhabi. Please contact me.`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-md"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Content + Form */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left: Features & Benefits */}
            <div className="lg:col-span-2 space-y-10">
              {/* Features */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">What's Included</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {service.features.map((f) => (
                    <div key={f} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">Why Choose Us</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {service.benefits.map((b) => (
                    <div key={b} className="flex items-start gap-3 p-4">
                      <div className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-2" />
                      <span className="text-gray-700 font-medium text-sm">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <Image src={service.image} alt={service.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
              </div>

              {/* FAQs */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {service.faqs.map((faq, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-150 ${openFaq === i ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 bg-gray-50">
                          <div className="pt-3">{faq.a}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Quote Form */}
            <div className="lg:sticky lg:top-28 self-start">
              <div className="bg-gray-900 rounded-3xl p-6 text-white">
                <h3 className="text-xl font-bold mb-1">Get a Free Quote</h3>
                <p className="text-gray-400 text-sm mb-5">We'll reply via WhatsApp within minutes.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" name="honeypot" className="hidden" value={form.honeypot} onChange={set('honeypot')} />
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Your Name *</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
                      placeholder="e.g. Ahmed Al Rashidi"
                      value={form.name}
                      onChange={set('name')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Phone Number *</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
                      placeholder="+971 50 XXX XXXX"
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Location / Area</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
                      placeholder="e.g. MBZ City, Khalifa A"
                      value={form.location}
                      onChange={set('location')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Additional Details</label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                      rows={3}
                      placeholder={`Tell us about your ${service.name.toLowerCase()} requirement...`}
                      value={form.message}
                      onChange={set('message')}
                    />
                  </div>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send via WhatsApp</>}
                  </button>
                </form>

                <div className="border-t border-white/10 mt-5 pt-4 flex gap-3">
                  <a href={`tel:${PHONE}`} className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  <a
                    href={`https://wa.me/971506725808?text=${encodeURIComponent(`Hello, I need ${service.name} in Abu Dhabi.`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>

              {/* Other services */}
              <div className="mt-4 bg-gray-50 rounded-2xl p-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Other Services</div>
                <div className="space-y-1">
                  {[
                    { name: 'AC Installation', slug: 'ac-installation' },
                    { name: 'AC Repair', slug: 'ac-repair' },
                    { name: 'AC Maintenance', slug: 'ac-maintenance' },
                    { name: 'VRF Systems', slug: 'vrf-systems' },
                    { name: 'AMC Contracts', slug: 'amc' },
                  ].filter((s) => s.slug !== service.slug).map((s) => (
                    <Link key={s.slug} href={`/services/${s.slug}`} className="block px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-white hover:text-red-600 transition-colors font-medium">
                      → {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
