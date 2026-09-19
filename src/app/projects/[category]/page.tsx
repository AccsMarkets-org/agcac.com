import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import CTASection from '@/components/sections/CTASection';
import { projects, categoryLabels, allCategories } from '@/data/projects';
import type { ProjectCategory } from '@/data/projects';
import ProjectCategoryClient from './ProjectCategoryClient';

const categoryMeta: Record<string, { title: string; desc: string; icon: string }> = {
  'commercial-buildings': {
    title: 'Commercial Building HVAC Projects Abu Dhabi',
    desc: 'Professional HVAC installation and maintenance for commercial buildings in Abu Dhabi — package units, AHUs, ducting, and AMC contracts.',
    icon: '🏢',
  },
  'private-villas': {
    title: 'Villa AC & HVAC Installation Abu Dhabi',
    desc: 'Split AC, ducted split, VRF system installation and maintenance for private villas across Abu Dhabi — Khalifa City, Yas Island, Baniyas, MBZ City.',
    icon: '🏠',
  },
  'vrf-systems': {
    title: 'VRF System Installation Abu Dhabi',
    desc: 'Professional VRF multi-zone system design, installation, and commissioning for villas and commercial properties in Abu Dhabi.',
    icon: '🔄',
  },
  'chiller-installation': {
    title: 'Chiller Installation Abu Dhabi',
    desc: 'Chiller installation, chilled water piping, AHU connection, and full commissioning for commercial buildings in Abu Dhabi.',
    icon: '❄️',
  },
  'duct-fabrication': {
    title: 'Duct Fabrication & Installation Abu Dhabi',
    desc: 'Custom GI ductwork fabrication, installation, and balancing for commercial, industrial, and residential projects in Abu Dhabi.',
    icon: '🌀',
  },
  'maintenance': {
    title: 'AC Maintenance & AMC Abu Dhabi',
    desc: 'Annual maintenance contracts, preventive maintenance, and emergency HVAC support for buildings, villas, and commercial properties in Abu Dhabi.',
    icon: '🔧',
  },
  'hotels-schools-factories': {
    title: 'HVAC for Hotels, Schools & Factories — Abu Dhabi',
    desc: 'Specialized HVAC services for hotels, schools, and industrial facilities in Abu Dhabi — Intercontinental Hotel, private schools, ICAD factories.',
    icon: '🏨',
  },
  'government-buildings': {
    title: 'Government Building HVAC — Abu Dhabi',
    desc: 'HVAC maintenance and installation for government facilities in Abu Dhabi — police stations, courts, and municipal buildings.',
    icon: '🏛️',
  },
};

const slugToCategory: Record<string, ProjectCategory> = {
  'commercial-buildings': 'Commercial',
  'private-villas': 'Villas',
  'vrf-systems': 'VRF',
  'chiller-installation': 'Chiller',
  'duct-fabrication': 'Ducting',
  'maintenance': 'Maintenance',
  'hotels-schools-factories': 'Hotels',
  'government-buildings': 'Government',
};

type Props = { params: { category: string } };

export async function generateStaticParams() {
  return Object.keys(categoryMeta).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = categoryMeta[params.category];
  if (!meta) return { title: 'Projects | Al Ghawas A/C' };
  return {
    title: `${meta.title} | Al Ghawas A/C`,
    description: meta.desc,
  };
}

export default function CategoryPage({ params }: Props) {
  const meta = categoryMeta[params.category];
  if (!meta) notFound();

  const cat = slugToCategory[params.category];
  const catProjects = cat ? projects.filter((p) => p.categories.includes(cat)) : projects;

  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0">
        {/* Hero */}
        <div className="hero-gradient pt-28 pb-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="container-custom relative z-10">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <span>/</span>
              <a href="/projects" className="hover:text-white transition-colors">Projects</a>
              <span>/</span>
              <span className="text-white">{meta.icon} {meta.title.split('|')[0].trim()}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">{meta.title}</h1>
            <p className="text-white/70 text-lg max-w-2xl">{meta.desc}</p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <span className="bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-sm font-bold px-4 py-2 rounded-xl">
                {catProjects.length} Projects Completed
              </span>
              <a href="#quote" className="btn-primary py-2">Request Similar Quote</a>
            </div>
          </div>
        </div>

        <ProjectCategoryClient catProjects={catProjects} categoryName={cat ? categoryLabels[cat] : 'All'} />

        <CTASection
          variant="dark"
          title={`Need ${cat ? categoryLabels[cat] : 'HVAC'} Services in Abu Dhabi?`}
          subtitle="Request a free consultation from our experienced HVAC team."
        />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
