import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import EmergencySection from '@/components/sections/EmergencySection';
import Link from 'next/link';
import { ChevronRight, Phone, MessageCircle, Zap, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Emergency AC Repair Abu Dhabi | Al Ghawas A/C',
  description: '24/7 emergency AC breakdown repair in Abu Dhabi. Call or WhatsApp Al Ghawas for immediate response — we dispatch technicians fast.',
};

export default function EmergencyPage() {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">Emergency AC Repair</span>
          </div>
        </div>

        {/* Urgent CTA banner */}
        <section className="bg-red-600 text-white py-6">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-xl">AC Emergency? We Respond Fast!</div>
                  <div className="text-red-100 text-sm flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> Available 7 days a week · Fast dispatch Abu Dhabi
                  </div>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <a
                  href="tel:+971506725808"
                  className="flex items-center gap-2 bg-white text-red-600 font-bold px-5 py-3 rounded-xl hover:bg-red-50 transition-colors shadow-md"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </a>
                <a
                  href="https://wa.me/971506725808?text=EMERGENCY%3A%20My%20AC%20has%20broken%20down.%20I%20need%20urgent%20help%20in%20Abu%20Dhabi."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-md"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        <EmergencySection />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
