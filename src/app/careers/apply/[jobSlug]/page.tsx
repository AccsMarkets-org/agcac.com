import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ApplicationFormClient from './ApplicationFormClient';

export async function generateMetadata({ params }: { params: Promise<{ jobSlug: string }> }): Promise<Metadata> {
  const { jobSlug } = await params;
  const job = await prisma.careerJob.findFirst({ where: { slug: jobSlug, published: true, deletedAt: null } });
  return { title: `Apply — ${job?.title || 'Job'} | Al Ghawas Careers`, robots: 'noindex' };
}

export default async function ApplyPage({ params }: { params: Promise<{ jobSlug: string }> }) {
  const { jobSlug } = await params;
  const job = await prisma.careerJob.findFirst({
    where: { slug: jobSlug, published: true, status: 'Open', deletedAt: null },
    select: { id: true, title: true, department: true, location: true, jobType: true },
  });
  if (!job) notFound();

  return (
    <>
      <Header />
      <main className="bg-gray-50 pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/careers" className="hover:text-red-600">Careers</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/careers/${jobSlug}`} className="hover:text-red-600">{job.title}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">Apply</span>
          </div>
        </div>
        <ApplicationFormClient job={job} />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
