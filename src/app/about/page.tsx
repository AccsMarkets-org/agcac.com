import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import AboutSection from '@/components/sections/AboutSection';
import QualitySection from '@/components/sections/QualitySection';
import SafetySection from '@/components/sections/SafetySection';
import CertificatesSection from '@/components/sections/CertificatesSection';
import ProjectStats from '@/components/sections/ProjectStats';
import CTASection from '@/components/sections/CTASection';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Al Ghawas A/C Refrigeration Contracting LLC',
  description: 'Over 19 years of HVAC excellence in Abu Dhabi. Learn about Al Ghawas A/C — our team, certifications, and commitment to quality.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">About Us</span>
          </div>
        </div>

        <AboutSection />
        <ProjectStats />
        <QualitySection />
        <SafetySection />
        <CertificatesSection />
        <CTASection
          variant="dark"
          title="Ready to Work With Us?"
          subtitle="Contact our team today for a free consultation and site visit."
        />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
