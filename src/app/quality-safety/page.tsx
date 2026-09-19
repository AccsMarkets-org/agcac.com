import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import QualitySection from '@/components/sections/QualitySection';
import SafetySection from '@/components/sections/SafetySection';
import CTASection from '@/components/sections/CTASection';
import Link from 'next/link';
import { ChevronRight, Shield, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Quality & Safety | Al Ghawas A/C Abu Dhabi',
  description: 'Al Ghawas A/C follows strict quality assurance and safety protocols on every HVAC project. UAE Civil Defence approved, OSHAD compliant, PPE on every site in Abu Dhabi.',
  alternates: { canonical: 'https://www.alghawasac.com/quality-safety' },
};

export default function QualitySafetyPage() {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">Quality & Safety</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-navy-950 to-gray-900 py-14 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
              <Shield className="w-3.5 h-3.5" />
              Quality Assurance & Safety
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Quality & Safety<br />
              <span className="text-brand-gold">Our Commitment</span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Every Al Ghawas project is completed to the highest standards of workmanship,
              safety, and quality — fully compliant with UAE regulations and Abu Dhabi codes.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {['ISO Standards', 'OSHAD Compliant', 'Civil Defence Approved', 'UAE Building Code'].map((b) => (
                <div key={b} className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm text-white/80">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </section>

        <QualitySection />
        <SafetySection />

        <CTASection
          variant="dark"
          title="Work With a Quality-First HVAC Team"
          subtitle="Safety and quality are built into every job we do. Contact us for a free consultation."
        />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
