'use client';
import { useState, useEffect } from 'react';
import { Phone, MessageCircle, FileText, CheckCircle, Star, Zap, Award, Shield, Clock } from 'lucide-react';
import { captureUTMParams, fireLeadEvent, fireCallClick, fireWhatsAppClick } from '@/lib/tracking';

const PHONE = '+971506725808';
const WA_URL = 'https://wa.me/971506725808';

const SERVICES_LIST = [
  'AC Installation', 'AC Maintenance', 'AC Repair', 'Duct Fabrication',
  'VRF System', 'Chilled Water', 'Refrigeration', 'Ventilation',
  'Plumbing Works', 'Cold Store', 'Annual AMC', 'Consultancy',
];

const trustBadges = [
  { icon: Award, text: 'Since 2005' },
  { icon: Shield, text: 'Abu Dhabi Based' },
  { icon: Star, text: 'Certified Team' },
  { icon: Zap, text: 'Fast Response' },
  { icon: Clock, text: '24/7 Support' },
  { icon: CheckCircle, text: 'Quality Assured' },
];

export default function HeroSection() {
  const [form, setForm] = useState({ name: '', phone: '', service: '', location: '', honeypot: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [utmParams, setUtmParams] = useState({});

  useEffect(() => {
    setUtmParams(captureUTMParams());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.service || !form.location) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sourcePage: 'hero-form', ...utmParams }),
      });
      const data = await res.json();
      if (data.success) {
        fireLeadEvent({ leadId: data.leadId, service: form.service, source: 'hero-form' });
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

  return (
    <section
      className="relative min-h-screen flex items-center hero-gradient overflow-hidden"
      style={{ paddingTop: '80px' }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-100" />

      {/* ── HVAC Background Highlights ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">

        {/* Blueprint grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hvac-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.6"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hvac-grid)" />
        </svg>

        {/* Large AC unit silhouette — top-right */}
        <svg className="absolute -top-4 right-8 w-72 h-56 opacity-[0.05]" viewBox="0 0 200 140" fill="white" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="20" width="180" height="90" rx="12"/>
          <rect x="22" y="32" width="50" height="66" rx="6" opacity="0.5"/>
          {/* Fins */}
          {[0,1,2,3,4,5,6].map(i => (
            <rect key={i} x={82 + i * 13} y="36" width="7" height="58" rx="3" opacity="0.7"/>
          ))}
          {/* Vents */}
          <rect x="10" y="118" width="180" height="8" rx="4" opacity="0.3"/>
          <rect x="10" y="10" width="180" height="8" rx="4" opacity="0.3"/>
        </svg>

        {/* Snowflake — left center */}
        <svg className="absolute top-1/3 -left-6 w-48 h-48 opacity-[0.06]" viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg">
          {/* 6-arm snowflake */}
          {[0,30,60,90,120,150].map(deg => (
            <g key={deg} transform={`rotate(${deg} 50 50)`}>
              <rect x="48" y="8" width="4" height="84" rx="2"/>
              <rect x="28" y="28" width="4" height="20" rx="2" transform="rotate(45 30 38)"/>
              <rect x="68" y="28" width="4" height="20" rx="2" transform="rotate(-45 70 38)"/>
              <rect x="28" y="52" width="4" height="20" rx="2" transform="rotate(-45 30 62)"/>
              <rect x="68" y="52" width="4" height="20" rx="2" transform="rotate(45 70 62)"/>
            </g>
          ))}
        </svg>

        {/* Air flow waves — bottom center-left */}
        <svg className="absolute bottom-24 left-1/4 w-80 h-24 opacity-[0.06]" viewBox="0 0 300 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {[0,18,36].map((offset, i) => (
            <path key={i} d={`M 0 ${20 + offset} Q 75 ${offset} 150 ${20 + offset} Q 225 ${40 + offset} 300 ${20 + offset}`}
              stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          ))}
        </svg>

        {/* Pipe / duct cross — bottom right corner */}
        <svg className="absolute -bottom-6 -right-6 w-56 h-56 opacity-[0.05]" viewBox="0 0 160 160" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="60" width="140" height="40" rx="8"/>
          <rect x="60" y="10" width="40" height="140" rx="8"/>
          <rect x="14" y="64" width="132" height="32" rx="4" strokeWidth="2" opacity="0.4"/>
          <rect x="64" y="14" width="32" height="132" rx="4" strokeWidth="2" opacity="0.4"/>
        </svg>

        {/* Thermometer — far right mid */}
        <svg className="absolute top-1/2 -translate-y-1/2 right-4 w-10 h-40 opacity-[0.07]" viewBox="0 0 30 120" fill="white" xmlns="http://www.w3.org/2000/svg">
          <rect x="11" y="4" width="8" height="76" rx="4"/>
          <circle cx="15" cy="96" r="14"/>
          <rect x="13" y="30" width="4" height="62" rx="2" opacity="0.4"/>
          {[0,1,2,3,4].map(i => (
            <rect key={i} x="5" y={14 + i * 14} width="6" height="2" rx="1" opacity="0.5"/>
          ))}
        </svg>

        {/* Small hexagon cluster — upper left */}
        <svg className="absolute top-16 left-8 w-32 h-32 opacity-[0.05]" viewBox="0 0 120 120" fill="white" xmlns="http://www.w3.org/2000/svg">
          {[[60,34],[30,60],[90,60],[60,86]].map(([cx,cy],i) => (
            <polygon key={i} points={`${cx},${cy-22} ${cx+19},${cy-11} ${cx+19},${cy+11} ${cx},${cy+22} ${cx-19},${cy+11} ${cx-19},${cy-11}`} opacity="0.6"/>
          ))}
        </svg>

        {/* Gear / fan icon — bottom left */}
        <svg className="absolute bottom-16 left-16 w-20 h-20 opacity-[0.06]" viewBox="0 0 80 80" fill="white" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="10"/>
          {[0,45,90,135,180,225,270,315].map((deg, i) => (
            <ellipse key={i} cx="40" cy="18" rx="6" ry="14" transform={`rotate(${deg} 40 40)`} opacity="0.7"/>
          ))}
        </svg>

      </div>
      {/* ── End HVAC Highlights ── */}

      {/* Decorative glow orbs */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-brand-red/8 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-brand-gold/8 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-900/10 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-950/60" />

      <div className="container-custom relative z-10 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-red/15 border border-brand-red/30 text-brand-red rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
              <Zap className="w-3.5 h-3.5" />
              Abu Dhabi&apos;s Trusted HVAC Partner Since 2005
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
              Advanced HVAC &<br />
              <span className="text-brand-gold">Refrigeration</span><br />
              Services in Abu Dhabi
            </h1>

            {/* Sub-headline */}
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
              Professional AC installation, maintenance, repair, ducting, refrigeration, chilled water,
              VRF, ventilation & plumbing solutions for villas, buildings, commercial & industrial projects.
            </p>

            {/* Service pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {SERVICES_LIST.map((s) => (
                <span
                  key={s}
                  className="bg-white/10 border border-white/20 text-white/80 text-xs px-3 py-1 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mb-10">
              <a
                href="#quote-calculator"
                className="btn-primary text-base px-8 py-4"
              >
                <FileText className="w-5 h-5" />
                Get Free Quote
              </a>
              <a
                href={WA_URL + '?text=Hello%20Al%20Ghawas%2C%20I%20need%20HVAC%20service.'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => fireWhatsAppClick('hero-cta')}
                className="btn-whatsapp text-base px-8 py-4"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Now
              </a>
              <a
                href={`tel:${PHONE}`}
                onClick={() => fireCallClick('hero-cta')}
                className="btn-outline text-base px-8 py-4"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2">
              {trustBadges.map(({ icon: Icon, text }) => (
                <div key={text} className="trust-badge">
                  <Icon className="w-3.5 h-3.5 text-brand-gold" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quick Quote Form */}
          <div className="animate-slide-right">
            <div className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-3xl p-7 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Get Free Quote on WhatsApp</h2>
                  <p className="text-white/50 text-xs">Instant response • No obligation</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot */}
                <input type="text" name="honeypot" value={form.honeypot} onChange={(e) => setForm({ ...form, honeypot: e.target.value })} className="hidden" tabIndex={-1} autoComplete="off" />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/70 text-xs font-medium mb-1 block">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold focus:bg-white/15 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-xs font-medium mb-1 block">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      placeholder="+971 5X XXX XXXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold focus:bg-white/15 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/70 text-xs font-medium mb-1 block">Service Needed *</label>
                  <select
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold transition-all appearance-none"
                    required
                  >
                    <option value="" className="bg-navy-900">Select service...</option>
                    {SERVICES_LIST.map((s) => (
                      <option key={s} value={s} className="bg-navy-900">{s}</option>
                    ))}
                    <option value="Other" className="bg-navy-900">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/70 text-xs font-medium mb-1 block">Location / Area *</label>
                  <input
                    type="text"
                    placeholder="e.g. Khalifa City, Yas Island, MBZ City..."
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold focus:bg-white/15 transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl px-4 py-2 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-red hover:bg-red-700 disabled:bg-red-900 text-white font-bold py-4 rounded-xl text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-glow-red hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving Your Request...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      Get Free Quote on WhatsApp
                    </>
                  )}
                </button>

                <p className="text-white/35 text-xs text-center">
                  ✓ No spam &nbsp;·&nbsp; ✓ Fast response &nbsp;·&nbsp; ✓ Free consultation
                </p>
              </form>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { value: '20+', label: 'Years Exp.' },
                { value: '500+', label: 'Projects Done' },
                { value: '24/7', label: 'Support' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-brand-gold font-black text-2xl">{value}</div>
                  <div className="text-white/50 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce-slow">
        <span className="text-xs">Scroll to explore</span>
        <div className="w-5 h-8 border border-white/30 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
