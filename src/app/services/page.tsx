import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import ServicesSection from '@/components/sections/ServicesSection';
import AMCSection from '@/components/sections/AMCSection';
import CTASection from '@/components/sections/CTASection';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'HVAC Services Abu Dhabi | Al Ghawas A/C',
  description: 'Complete HVAC services: AC installation, repair, maintenance, duct fabrication, VRF systems, chilled water, refrigeration, plumbing, ventilation, and AMC contracts in Abu Dhabi.',
};

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">Services</span>
          </div>
        </div>
        <ServicesSection />
        <AMCSection />
        <CTASection
          variant="dark"
          title="Need a Custom HVAC Solution?"
          subtitle="Our engineers design systems tailored for your property. Get a free consultation today."
        />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
