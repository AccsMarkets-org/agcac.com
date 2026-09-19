import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import ProjectStats from '@/components/sections/ProjectStats';
import FeaturedProjects from '@/components/sections/FeaturedProjects';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ProjectMapSection from '@/components/sections/ProjectMapSection';
import BeforeAfterSection from '@/components/sections/BeforeAfterSection';
import CTASection from '@/components/sections/CTASection';

export const metadata: Metadata = {
  title: 'HVAC Project Portfolio | Al Ghawas A/C Abu Dhabi',
  description:
    'Explore Al Ghawas A/C project portfolio — commercial buildings, private villas, hotels, factories, VRF systems, chiller installations, and duct fabrication projects in Abu Dhabi, UAE.',
  openGraph: {
    title: 'HVAC Projects Portfolio — Al Ghawas A/C Abu Dhabi',
    description: '30+ completed HVAC projects in Abu Dhabi — villas, commercial buildings, VRF systems, chillers, ducting, and maintenance.',
  },
};

const projectsPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Al Ghawas HVAC Project Portfolio',
  description: 'Completed HVAC projects by Al Ghawas A/C Refrigeration Contracting LLC in Abu Dhabi, UAE',
  numberOfItems: 30,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Commercial Buildings HVAC — Electra Street & MBZ City' },
    { '@type': 'ListItem', position: 2, name: 'VRF Villa Projects — Yas Island, Baniyas, Khalifa A' },
    { '@type': 'ListItem', position: 3, name: 'Chiller Installation — Al Maryah Island' },
    { '@type': 'ListItem', position: 4, name: 'Intercontinental Hotel HVAC Maintenance' },
    { '@type': 'ListItem', position: 5, name: 'ICAD Steel Factory Industrial Ventilation' },
  ],
};

export default function ProjectsPage() {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0">
        {/* Hero */}
        <div className="hero-gradient pt-28 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="container-custom relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
              📋 Project Portfolio
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Proven HVAC Project Experience<br className="hidden md:block" /> Across Abu Dhabi
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
              30+ completed projects — commercial buildings, private villas, hotels, factories,
              VRF systems, chiller installations, duct fabrication, and maintenance contracts.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="#projects" className="btn-primary px-8 py-4">Browse All Projects</a>
              <a href="/projects#quote-calculator" className="btn-whatsapp px-8 py-4">Request Similar Quote</a>
              <a href="/company-profile.pdf" download className="inline-flex items-center gap-2 border-2 border-brand-gold/50 text-brand-gold font-semibold px-8 py-4 rounded-xl hover:bg-brand-gold/10 transition-all">
                📄 Download Profile
              </a>
            </div>
          </div>
        </div>

        <ProjectStats />
        <FeaturedProjects />
        <ProjectsSection />
        <ProjectMapSection />
        <BeforeAfterSection />

        <CTASection
          variant="dark"
          title="Ready to Start Your HVAC Project in Abu Dhabi?"
          subtitle="Our team has experience across all project types. Get a free quote today."
        />
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsPageSchema) }}
      />

      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
