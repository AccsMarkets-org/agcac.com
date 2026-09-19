'use client';
import { useState } from 'react';
import Image from 'next/image';
import { MapPin, CheckCircle, ArrowRight, MessageCircle, FileText } from 'lucide-react';
import type { Project } from '@/data/projects';
import ProjectModal from '@/components/ui/ProjectModal';

export default function ProjectCategoryClient({ catProjects, categoryName }: { catProjects: Project[]; categoryName: string }) {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section id="quote" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {catProjects.map((project) => (
            <div
              key={project.id}
              className="card group hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => setSelected(project)}
            >
              <div className="h-44 relative overflow-hidden bg-navy-900">
                {project.image ? (
                  <>
                    <Image
                      src={`${project.image}?auto=format&fit=crop&w=800&q=75`}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/65" />
                  </>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.bgColor}`}>
                    <div className="absolute inset-0 bg-hero-pattern opacity-30" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                  {project.categories.slice(0, 2).map((cat) => (
                    <span key={cat} className="bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">{cat}</span>
                  ))}
                </div>
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Completed
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 z-10 text-4xl drop-shadow-lg">{project.icon}</div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-navy-900 text-base mb-2 group-hover:text-brand-red transition-colors leading-snug">{project.title}</h3>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
                  <MapPin className="w-3.5 h-3.5" /> {project.location}
                </div>
                <div className="text-brand-red font-semibold text-xs mb-3">{project.system}</div>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{project.scope}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.services.slice(0, 3).map((s) => (
                    <span key={s} className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <a
                    href={`#quote-calculator`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-navy-900 hover:bg-brand-red text-white text-xs font-semibold py-3 rounded-xl transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" /> Quote
                  </a>
                  <a
                    href={`https://wa.me/971506725808?text=${encodeURIComponent(`Hello Al Ghawas, I saw your project "${project.shortTitle}" and need similar HVAC services. Please contact me.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-3 rounded-xl transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(project); }}
                    className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all"
                    title="View details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {catProjects.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl">
            <p className="text-gray-400">No projects in this category yet.</p>
            <a href="/projects" className="btn-primary mt-4">View All Projects</a>
          </div>
        )}
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
