import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import CertificatesSection from '@/components/sections/CertificatesSection';
import CTASection from '@/components/sections/CTASection';
import Link from 'next/link';
import { ChevronRight, Shield, Award, CheckCircle, Building2, FileText, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Licenses & Certifications | Al Ghawas A/C Abu Dhabi',
  description: 'Al Ghawas A/C Refrigeration Contracting LLC is fully licensed by Abu Dhabi DED, registered with ADM, and holds all required UAE contractor certifications for HVAC and mechanical works.',
  alternates: { canonical: 'https://www.alghawasac.com/certificates' },
};

const registrations = [
  {
    icon: Building2,
    authority: 'Abu Dhabi DED',
    description: 'Department of Economic Development — Commercial Trade License',
    category: 'Business License',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    icon: Award,
    authority: 'Abu Dhabi Municipality (ADM)',
    description: 'Contractor registration for mechanical and HVAC works in Abu Dhabi',
    category: 'Contractor Registration',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    icon: Shield,
    authority: 'Abu Dhabi Civil Defence',
    description: 'Fire safety compliance approval for HVAC and mechanical installations',
    category: 'Safety Clearance',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    icon: FileText,
    authority: 'Chamber of Commerce & Industry',
    description: 'Abu Dhabi Chamber of Commerce membership and business certification',
    category: 'Chamber Membership',
    color: 'bg-green-50 text-green-700 border-green-200',
  },
  {
    icon: Star,
    authority: 'HVAC Technical Registration',
    description: 'Technical competency certification for HVAC installation and maintenance',
    category: 'Technical Certification',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    icon: CheckCircle,
    authority: 'OSHAD Compliance',
    description: 'Abu Dhabi Occupational Health & Safety framework compliance',
    category: 'Safety Standard',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
];

export default function CertificatesPage() {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">Licenses & Certifications</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-navy-950 to-gray-900 py-14 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
              <Award className="w-3.5 h-3.5" />
              Licensed & Certified
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Certifications &<br />
              <span className="text-brand-gold">Official Licenses</span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Al Ghawas A/C Refrigeration Contracting LLC is fully licensed, certified, and
              registered with all relevant UAE and Abu Dhabi authorities.
            </p>
          </div>
        </section>

        {/* Registrations grid */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="section-heading">Our Official Registrations</h2>
              <p className="section-subheading mx-auto mt-3">
                We hold all required business, technical, and safety certifications to operate as a
                HVAC and mechanical contracting company in Abu Dhabi.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {registrations.map((reg) => {
                const Icon = reg.icon;
                return (
                  <div key={reg.authority} className="card p-6 hover:-translate-y-1 transition-all duration-300">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-4 ${reg.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {reg.category}
                    </div>
                    <h3 className="font-bold text-navy-900 text-lg mb-2">{reg.authority}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{reg.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Trust badges */}
            <div className="bg-navy-950 rounded-3xl p-8 text-white text-center">
              <h3 className="text-xl font-bold mb-6">Why This Matters to You</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: '✅', title: 'Legally Compliant', desc: 'All works are performed under valid trade and contractor licenses' },
                  { icon: '🛡️', title: 'Insurance Covered', desc: 'Our operations are backed by appropriate contractor insurance' },
                  { icon: '🏛️', title: 'Govt. Approved', desc: 'Registered with Abu Dhabi DED, ADM, and Civil Defence' },
                  { icon: '⭐', title: 'Since 2005', desc: '19+ years of uninterrupted operations in Abu Dhabi' },
                ].map((item) => (
                  <div key={item.title} className="text-center">
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <div className="font-bold text-white mb-1">{item.title}</div>
                    <div className="text-white/60 text-sm">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <CertificatesSection />

        <CTASection
          variant="red"
          title="Hire a Certified HVAC Contractor"
          subtitle="Work with a fully licensed and certified team. Contact us for a free quote today."
        />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
