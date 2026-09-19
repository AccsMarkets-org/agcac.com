import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import CTASection from '@/components/sections/CTASection';
import { servicesData, getServiceBySlug } from '@/data/services';
import ServicePageClient from './ServicePageClient';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function generateStaticParams() {
  return servicesData.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: 'Service Not Found' };
  return {
    title: `${service.name} Abu Dhabi | Al Ghawas A/C`,
    description: service.description.slice(0, 160),
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/services" className="hover:text-red-600 transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">{service.name}</span>
          </div>
        </div>

        <ServicePageClient service={service} />

        <CTASection
          variant="dark"
          title={`Need ${service.name} in Abu Dhabi?`}
          subtitle="Get a free quote sent to your WhatsApp within minutes. Our engineers are ready."
        />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
