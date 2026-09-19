import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import AboutSection from '@/components/sections/AboutSection';
import ProjectStats from '@/components/sections/ProjectStats';
import QualitySection from '@/components/sections/QualitySection';
import CertificatesSection from '@/components/sections/CertificatesSection';
import CTASection from '@/components/sections/CTASection';
import Link from 'next/link';
import { ChevronRight, Phone, Mail, MapPin, MessageCircle, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Company Profile | Al Ghawas A/C Refrigeration Contracting LLC',
  description: 'Download or view the full company profile of Al Ghawas A/C Refrigeration Contracting LLC — Abu Dhabi HVAC contractor since 2005. Services, certifications, projects, and contact details.',
  alternates: { canonical: 'https://www.alghawasac.com/company-profile' },
};

const services = [
  'AC Installation (Split, Ducted, Cassette, Concealed)',
  'AC Maintenance & Servicing',
  'AC Repair & Fault Diagnosis',
  'Duct Fabrication & Installation',
  'VRF / VRV System Design & Installation',
  'Chilled Water Pipe Works',
  'Air Handling Units (AHU)',
  'Ventilation & Exhaust Systems',
  'Refrigeration & Cold Store Works',
  'Plumbing Works',
  'Annual Maintenance Contracts (AMC)',
  'HVAC Consultancy & Engineering',
  'Commercial Refrigeration',
  'Industrial HVAC Projects',
];

export default function CompanyProfilePage() {
  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">Company Profile</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-navy-950 to-gray-900 py-14 text-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
                  🏢 Since 2005 · Abu Dhabi, UAE
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                  Al Ghawas A/C<br />
                  <span className="text-brand-gold">Refrigeration Contracting LLC</span>
                </h1>
                <p className="text-white/70 text-base mb-6 leading-relaxed">
                  A leading HVAC and refrigeration contracting company in Abu Dhabi, UAE.
                  Over 19 years of expertise in air conditioning, ducting, VRF systems,
                  chilled water works, refrigeration, and mechanical contracting.
                </p>
                <a
                  href="https://wa.me/971506725808?text=Hello%2C%20I%20would%20like%20to%20request%20your%20company%20profile."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Request Company Profile PDF
                </a>
              </div>
              <div className="space-y-3">
                {[
                  { icon: MapPin, label: 'Address', value: 'Building No.238, Mohamed Bin Zayed City, ME-11, Abu Dhabi, UAE' },
                  { icon: Phone, label: 'Phone / WhatsApp', value: '+971-50-672-5808' },
                  { icon: Mail, label: 'Email', value: 'info@alghawasac.com' },
                  { icon: MessageCircle, label: 'WhatsApp', value: 'wa.me/971506725808' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <Icon className="w-4 h-4 text-brand-gold mt-0.5 shrink-0" />
                    <div>
                      <div className="text-white/50 text-xs">{label}</div>
                      <div className="text-white text-sm font-medium">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Company overview */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Services list */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-navy-900 mb-6">Services We Provide</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {services.map((s) => (
                    <div key={s} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-brand-red mt-0.5 shrink-0">✓</span>
                      <span className="text-sm text-gray-700">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company facts */}
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-6">Company Facts</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Founded', value: '2005' },
                    { label: 'Years in Operation', value: '19+ Years' },
                    { label: 'Headquarters', value: 'Abu Dhabi, UAE' },
                    { label: 'Service Area', value: 'Abu Dhabi & UAE' },
                    { label: 'Projects Completed', value: '1,000+' },
                    { label: 'Clients Served', value: '500+' },
                    { label: 'Technical Staff', value: 'Experienced Team' },
                    { label: 'License Type', value: 'Mechanical Contractor' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">{label}</span>
                      <span className="font-semibold text-gray-900 text-sm">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-5 bg-brand-red/5 border border-brand-red/20 rounded-2xl">
                  <h3 className="font-bold text-navy-900 mb-2 text-sm">Areas We Cover</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {['Abu Dhabi City', 'Mohamed Bin Zayed City', 'Khalifa City', 'Musaffah', 'Shahama', 'Al Reem Island', 'Yas Island', 'Al Ain', 'Dubai', 'Sharjah'].map((a) => (
                      <span key={a} className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded-lg">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AboutSection />
        <ProjectStats />

        {/* Our Team */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
                👷 Our Team
              </div>
              <h2 className="text-3xl font-black text-navy-900 mb-3">The People Behind the Work</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Our skilled technicians and engineers bring decades of combined experience to every HVAC and refrigeration project across Abu Dhabi and the UAE.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/team.jpg"
                alt="Al Ghawas A/C team — HVAC technicians and engineers on site"
                className="w-full object-cover max-h-[480px]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="font-bold text-lg">Al Ghawas A/C Field Team · Abu Dhabi, UAE</p>
                <p className="text-white/70 text-sm">Certified HVAC technicians ready for residential, commercial &amp; industrial projects</p>
              </div>
            </div>
          </div>
        </section>

        <CertificatesSection />
        <QualitySection />

        <CTASection
          variant="red"
          title="Start Your HVAC Project Today"
          subtitle="Contact our team for a free consultation, site visit, and quotation."
        />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
