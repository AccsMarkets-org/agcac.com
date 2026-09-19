'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, MapPin, Wrench, CheckCircle, ArrowRight, MessageCircle, Phone, Download } from 'lucide-react';
import type { Project } from '@/data/projects';
import { captureUTMParams, fireLeadEvent } from '@/lib/tracking';

interface Props {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', location: '', message: '', honeypot: '' });
  const [loading, setLoading] = useState(false);
  const [utmParams, setUtmParams] = useState({});

  useEffect(() => {
    setUtmParams(captureUTMParams());
    setShowForm(false);
  }, [project]);

  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [project]);

  if (!project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    if (form.honeypot) return;
    setLoading(true);
    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          service: project.relatedService,
          propertyType: project.categories[0],
          sourcePage: 'project-modal',
          message: `Interested in similar project to: ${project.title}. ${form.message}`,
          ...utmParams,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fireLeadEvent({ leadId: data.leadId, service: project.relatedService, source: 'project-modal' });
        window.open(data.whatsappURL, '_blank');
        onClose();
      }
    } catch {
      window.open(`https://wa.me/971506725808?text=${encodeURIComponent(
        `Hello Al Ghawas, I saw your project: ${project.title}. I need a similar HVAC solution.\n\nName: ${form.name}\nPhone: ${form.phone}\nLocation: ${form.location}`
      )}`, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${project.bgColor} p-8 relative overflow-hidden min-h-[180px]`}>
          {project.image ? (
            <>
              <Image
                src={`${project.image}?auto=format&fit=crop&w=1200&q=80`}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
            </>
          ) : (
            <div className="absolute inset-0 bg-hero-pattern opacity-30" />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="relative z-10">
            <div className="flex flex-wrap gap-2 mb-3">
              {project.categories.map((cat) => (
                <span key={cat} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {cat}
                </span>
              ))}
              <span className="bg-green-500/80 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Completed
              </span>
            </div>
            <h2 className="text-white font-black text-2xl md:text-3xl mb-2 leading-tight">{project.title}</h2>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <MapPin className="w-4 h-4" />
              {project.location}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Project Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'System', value: project.system },
              { label: 'Type', value: project.categories[0] },
              { label: 'Status', value: '✅ Completed' },
              { label: 'Location', value: project.area },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-gray-400 text-xs">{label}</div>
                <div className="text-navy-900 font-semibold text-sm mt-0.5">{value}</div>
              </div>
            ))}
          </div>

          {/* Services */}
          <div className="mb-6">
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Services Provided</h3>
            <div className="flex flex-wrap gap-2">
              {project.services.map((s) => (
                <span key={s} className="flex items-center gap-1.5 bg-brand-red/5 border border-brand-red/20 text-brand-red text-xs font-medium px-3 py-1.5 rounded-full">
                  <Wrench className="w-3 h-3" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Case Study */}
          <div className="space-y-5 mb-8">
            <div>
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">1</span>
                Scope of Work
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{project.scope}</p>
            </div>
            <div>
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-600 text-xs flex items-center justify-center font-bold">2</span>
                Challenge
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{project.challenge}</p>
            </div>
            <div>
              <h3 className="font-bold text-navy-900 text-base flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs flex items-center justify-center font-bold">3</span>
                Our Solution
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{project.solution}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-bold text-green-800 text-base flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Result
              </h3>
              <p className="text-green-700 text-sm leading-relaxed">{project.result}</p>
            </div>
          </div>

          {/* Gallery */}
          {project.image && (
            <div className="mb-8">
              <h3 className="font-bold text-navy-900 mb-3 text-sm">Project Gallery</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <Image
                    src={`${project.image}?auto=format&fit=crop&w=800&q=80`}
                    alt={`${project.title} — main photo`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 66vw, 400px"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="relative flex-1 rounded-xl overflow-hidden bg-gray-100 min-h-[80px]">
                    <Image
                      src={`${project.image}?auto=format&fit=crop&w=400&q=70&crop=entropy`}
                      alt={`${project.title} — detail`}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <div className="flex-1 rounded-xl overflow-hidden bg-navy-900/10 flex items-center justify-center min-h-[80px]">
                    <div className="text-center text-gray-400">
                      <div className="text-xl mb-0.5">{project.icon}</div>
                      <div className="text-xs font-medium">{project.categories[0]}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          {!showForm ? (
            <div className="bg-navy-900 rounded-2xl p-6 text-center">
              <h3 className="text-white font-bold text-lg mb-2">Need a Similar HVAC Solution?</h3>
              <p className="text-white/60 text-sm mb-5">Request a free consultation for a project similar to this one.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex-1 btn-primary justify-center py-3"
                >
                  <ArrowRight className="w-4 h-4" />
                  Request Similar Quote
                </button>
                <a
                  href={`https://wa.me/971506725808?text=${encodeURIComponent(
                    `Hello Al Ghawas, I saw your project "${project.title}" and need a similar HVAC solution. Please contact me.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-whatsapp justify-center py-3"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Project Team
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-navy-900 mb-4">Request Similar Project Quote</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" value={form.honeypot} onChange={(e) => setForm({ ...form, honeypot: e.target.value })} className="hidden" tabIndex={-1} />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input className="form-input" placeholder="Your Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <input className="form-input" type="tel" placeholder="Phone / WhatsApp *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <input className="form-input" placeholder="Your Location / Area" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                <textarea className="form-textarea" rows={2} placeholder="Project details or requirements..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><MessageCircle className="w-4 h-4" /> Submit & Open WhatsApp</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
