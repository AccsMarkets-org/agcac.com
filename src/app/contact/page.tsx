import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import ContactSection from '@/components/sections/ContactSection';
import Link from 'next/link';
import { ChevronRight, Phone, MessageCircle, MapPin, Clock, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Al Ghawas A/C Refrigeration Contracting LLC',
  description: 'Contact Al Ghawas A/C in Abu Dhabi. Call, WhatsApp, or submit a form for AC installation, repair, maintenance, and AMC services.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">Contact Us</span>
          </div>
        </div>

        {/* Quick contact bar */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-black text-gray-900">Get in Touch</h1>
              <p className="text-gray-500 mt-2">Our team is ready to help with all your HVAC needs</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Phone className="w-5 h-5" />, label: 'Call Us', value: '+971-50-672-5808', href: 'tel:+971506725808', bg: 'bg-blue-50', color: 'text-blue-600' },
                { icon: <MessageCircle className="w-5 h-5" />, label: 'WhatsApp', value: '+971-50-672-5808', href: 'https://wa.me/971506725808', bg: 'bg-green-50', color: 'text-green-600' },
                { icon: <Mail className="w-5 h-5" />, label: 'Email Us', value: 'info@alghawasac.com', href: 'mailto:info@alghawasac.com', bg: 'bg-purple-50', color: 'text-purple-600' },
                { icon: <Clock className="w-5 h-5" />, label: 'Working Hours', value: 'Mon–Sat 7AM–8PM', href: null, bg: 'bg-amber-50', color: 'text-amber-600' },
              ].map(({ icon, label, value, href, bg, color }) => (
                <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-4`}>
                  <div className={`w-10 h-10 rounded-xl bg-white ${color} flex items-center justify-center shadow-sm shrink-0`}>
                    {icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</div>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={`font-bold text-sm ${color} hover:underline`}>{value}</a>
                    ) : (
                      <div className="font-bold text-sm text-gray-800">{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ContactSection />

        {/* Map section */}
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Our Location</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-200 h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p className="font-semibold text-gray-700">Building No.238</p>
                  <p className="text-sm">Mohamed Bin Zayed City, Abu Dhabi, UAE</p>
                  <a
                    href="https://maps.google.com/?q=Mohamed+Bin+Zayed+City+Abu+Dhabi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
