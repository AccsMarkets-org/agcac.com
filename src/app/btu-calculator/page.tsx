import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import BTUCalculator from '@/components/sections/BTUCalculator';
import CTASection from '@/components/sections/CTASection';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free AC BTU Calculator | Al Ghawas A/C Abu Dhabi',
  description: 'Calculate the exact AC capacity (BTU/ton) you need for any room or space in Abu Dhabi. Free online BTU calculator for villas, apartments, offices, and commercial spaces.',
  alternates: { canonical: 'https://www.alghawasac.com/btu-calculator' },
};

export default function BTUCalculatorPage() {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">BTU Calculator</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-navy-950 to-gray-900 py-14 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
              🧮 Free Online Tool
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              AC BTU Calculator<br />
              <span className="text-brand-gold">Abu Dhabi & UAE</span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Calculate the exact cooling capacity your room needs based on size, sun exposure,
              insulation, and occupancy. Get an instant recommendation.
            </p>
          </div>
        </section>

        <BTUCalculator />

        {/* Info section */}
        <section className="section-padding bg-white">
          <div className="container-custom max-w-4xl">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Understanding BTU and AC Capacity</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-navy-900 mb-3">What is BTU?</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  BTU (British Thermal Unit) measures the cooling or heating power of an air conditioner.
                  The higher the BTU, the more powerful the unit. In Abu Dhabi's extreme summer heat,
                  choosing the right BTU rating is critical for comfort and energy efficiency.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-navy-900 mb-3">Abu Dhabi Climate Factor</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Abu Dhabi temperatures frequently exceed 45°C in summer. Our calculator factors in
                  UAE-specific conditions including high sun exposure, modern vs. older building insulation,
                  and local humidity levels to give you accurate recommendations.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-navy-900 mb-3">Common AC Sizes</h3>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• <strong>9,000 BTU (0.75 ton)</strong> — Small bedroom or study</li>
                  <li>• <strong>12,000 BTU (1 ton)</strong> — Standard bedroom</li>
                  <li>• <strong>18,000 BTU (1.5 ton)</strong> — Large bedroom or office</li>
                  <li>• <strong>24,000 BTU (2 ton)</strong> — Large living room</li>
                  <li>• <strong>36,000+ BTU (3+ ton)</strong> — Open-plan or commercial</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-navy-900 mb-3">Professional Sizing Matters</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  While this calculator provides a useful estimate, professional AC sizing considers
                  additional factors: ductwork, ventilation, heat loads from equipment, and building
                  orientation. Contact Al Ghawas for a free on-site assessment.
                </p>
              </div>
            </div>
          </div>
        </section>

        <CTASection
          variant="dark"
          title="Get a Professional AC Assessment"
          subtitle="Our HVAC engineers will visit your site and recommend the perfect system for your needs."
        />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
