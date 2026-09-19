'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, MapPin, CheckCircle, ArrowRight, MessageCircle, FileText, X, Building2 } from 'lucide-react';
import { projects, allCategories, categoryLabels } from '@/data/projects';
import type { Project, ProjectCategory } from '@/data/projects';
import ProjectModal from '@/components/ui/ProjectModal';

export default function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    let result = projects;
    if (activeCategory !== 'All') {
      result = result.filter((p) => p.categories.includes(activeCategory));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          p.system.toLowerCase().includes(q) ||
          p.services.some((s) => s.toLowerCase().includes(q)) ||
          p.categories.some((c) => c.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [activeCategory, search]);

  const handleQuoteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const params = new URLSearchParams({
      service: project.relatedService,
      projectType: project.categories[0],
    });
    window.location.href = `#quote-calculator?${params}`;
  };

  return (
    <section id="projects" className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-navy-900/5 border border-navy-900/10 text-navy-900 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            <Building2 className="w-3.5 h-3.5" />
            Project Portfolio
          </div>
          <h2 className="section-heading">
            Proven HVAC Project Experience<br className="hidden sm:block" /> Across Abu Dhabi
          </h2>
          <p className="section-subheading mx-auto mt-4 text-base">
            From private villas and commercial towers to hotels, schools, factories, and government buildings —
            Al Ghawas A/C has delivered reliable HVAC, refrigeration, ducting, VRF, chilled water, and maintenance
            solutions across Abu Dhabi and the UAE.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            '✅ Completed HVAC Projects',
            '🏠 Villa & Commercial Experts',
            '🔄 VRF System Experience',
            '❄️ Chiller Installation',
            '🌀 Duct Fabrication Specialists',
            '🔧 Maintenance Support',
            '🦺 Safety-Focused Team',
            '⭐ Quality Tested Systems',
          ].map((badge) => (
            <span key={badge} className="bg-white border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
              {badge}
            </span>
          ))}
        </div>

        {/* Search bar */}
        <div className="max-w-xl mx-auto mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full form-input pl-11 py-4 text-base shadow-sm"
            placeholder="Search by location, system, or project type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('All')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeCategory === 'All'
                ? 'bg-navy-900 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-navy-700 hover:text-navy-900'
            }`}
          >
            All Projects ({projects.length})
          </button>
          {allCategories.map((cat) => {
            const count = projects.filter((p) => p.categories.includes(cat)).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-navy-700 hover:text-navy-900'
                }`}
              >
                {categoryLabels[cat]} ({count})
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm font-medium">
            {filtered.length} project{filtered.length !== 1 ? 's' : ''} found
            {search && ` for "${search}"`}
          </p>
          <a href="#quote-calculator" className="btn-primary text-sm py-2.5 px-5">
            <FileText className="w-4 h-4" />
            Request Quote
          </a>
        </div>

        {/* Projects grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-gray-400 text-xl mb-2">No matching projects</h3>
            <p className="text-gray-400 text-sm mb-4">Try a different search term or select another category.</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="btn-primary">
              Show All Projects
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="card group hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => setSelected(project)}
              >
                {/* Card image/header */}
                <div className="h-40 relative overflow-hidden bg-navy-900">
                  {project.image ? (
                    <>
                      <Image
                        src={`${project.image}?auto=format&fit=crop&w=600&q=70`}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/65" />
                    </>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.bgColor}`}>
                      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap z-10">
                    <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {project.categories[0]}
                    </span>
                    {project.categories.includes('VRF') && project.categories[0] !== 'VRF' && (
                      <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full">VRF</span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" /> Done
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent z-10">
                    <div className="text-3xl drop-shadow-lg">{project.icon}</div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-navy-900 text-sm mb-1 group-hover:text-brand-red transition-colors leading-snug line-clamp-2">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="text-brand-red text-xs font-semibold mb-2">{project.system}</div>

                  {/* Services tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.services.slice(0, 2).map((s) => (
                      <span key={s} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {project.services.length > 2 && (
                      <span className="bg-gray-100 text-gray-400 text-xs px-2 py-0.5 rounded-full">+{project.services.length - 2}</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleQuoteClick(e, project)}
                      className="flex-1 flex items-center justify-center gap-1 bg-navy-900 hover:bg-brand-red text-white text-xs font-semibold py-2.5 rounded-xl transition-all duration-200"
                    >
                      <FileText className="w-3 h-3" />
                      Quote
                    </button>
                    <a
                      href={`https://wa.me/971506725808?text=${encodeURIComponent(
                        `Hello Al Ghawas, I saw your project "${project.shortTitle}" and need a similar HVAC solution. Please contact me with a quote.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-all duration-200"
                    >
                      <MessageCircle className="w-3 h-3" />
                      WhatsApp
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(project); }}
                      className="px-2.5 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all duration-200"
                      title="View details"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-14 bg-navy-900 rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="relative z-10">
            <h3 className="text-white font-bold text-2xl mb-3">
              Planning a Similar HVAC Project?
            </h3>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Request a free consultation today. Our team responds within minutes on WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="#quote-calculator" className="btn-primary px-8 py-4">
                <FileText className="w-5 h-5" />
                Request Free Quote
              </a>
              <a
                href="https://wa.me/971506725808?text=Hello%20Al%20Ghawas%2C%20I%20saw%20your%20project%20portfolio%20and%20need%20a%20similar%20HVAC%20solution.%20Please%20contact%20me."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp px-8 py-4"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Project Team
              </a>
              <a
                href="/company-profile.pdf"
                download
                className="inline-flex items-center gap-2 border-2 border-brand-gold/50 text-brand-gold hover:bg-brand-gold/10 font-semibold px-8 py-4 rounded-xl transition-all"
              >
                📄 Download Company Profile
              </a>
            </div>
          </div>
        </div>
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
