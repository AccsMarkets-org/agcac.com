import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import CareersClient from './CareersClient';

export const metadata: Metadata = {
  title: 'Careers & Jobs | Al Ghawas A/C Refrigeration Contracting LLC',
  description: 'Join our HVAC team in Abu Dhabi. We are hiring AC technicians, duct fabricators, pipe fitters, supervisors, and more. Apply now.',
  keywords: 'HVAC jobs Abu Dhabi, AC technician jobs UAE, HVAC careers, duct fabricator jobs, pipe fitter jobs Abu Dhabi',
};

export default function CareersPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px' }}>
        <CareersClient />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
