'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, MapPin, CheckCircle, MessageCircle } from 'lucide-react';
import { projects } from '@/data/projects';
import ProjectModal from '@/components/ui/ProjectModal';
import type { Project } from '@/data/projects';

const featured = projects.filter((p) => p.featured);

export default function FeaturedProjects() {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/30 text-yellow-700 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            ⭐ Featured Case Studies
          </div>
          <h2 className="section-heading">Highlighted Project Success Stories</h2>
          <p className="section-subheading mx-auto mt-3">
            See how we delivered reliable HVAC solutions for commercial buildings, luxury villas, hotels, and industrial facilities across Abu Dhabi.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {featured.map((project, idx) => (
            <div
              key={project.id}
              className="card group overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => setSelected(project)}
            >
              {/* Image / Header */}
              <div className="h-52 relative overflow-hidden bg-navy-900">
                {project.image ? (
                  <>
                    <Image
                      src={`${project.image}?auto=format&fit=crop&w=800&q=75`}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
                  </>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.bgColor}`}>
                    <div className="absolute inset-0 bg-hero-pattern opacity-30" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                  {project.categories.slice(0, 2).map((cat) => (
                    <span key={cat} className="bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Completed
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 z-10">
                  <div className="text-4xl drop-shadow-lg">{project.icon}</div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-navy-900 text-lg mb-1 group-hover:text-brand-red transition-colors leading-snug">
                  {project.title}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {project.location}
                </div>
                <div className="text-brand-red text-xs font-semibold mb-3">{project.system}</div>
                <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">{project.scope}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {project.services.slice(0, 3).map((s) => (
                    <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(project); }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-navy-900 hover:bg-brand-red text-white text-xs font-semibold py-2.5 rounded-xl transition-all"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    View Case Study
                  </button>
                  <a
                    href={`https://wa.me/971506725808?text=${encodeURIComponent(
                      `Hello Al Ghawas, I saw your project "${project.shortTitle}" and need a similar HVAC solution. Please contact me.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      </div>
    </section>
  );
}
