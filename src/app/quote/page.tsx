import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import QuoteCalculator from '@/components/sections/QuoteCalculator';
import BTUCalculator from '@/components/sections/BTUCalculator';
import Link from 'next/link';
import { ChevronRight, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free HVAC Quote | Al Ghawas A/C Refrigeration Contracting LLC',
  description: 'Get a free HVAC quote online. Use our quote calculator and BTU calculator for AC installation, repair, AMC contracts and more in Abu Dhabi.',
};

export default function QuotePage() {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">Free Quote</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-14 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-4xl font-black mb-3">Get Your Free HVAC Quote</h1>
            <p className="text-gray-300 text-lg mb-6">Fill the form below and receive a detailed quote via WhatsApp within minutes.</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['No obligation', 'Fast response', 'Competitive pricing', 'Expert advice'].map((t) => (
                <div key={t} className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-sm font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </section>

        <QuoteCalculator />
        <BTUCalculator />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
