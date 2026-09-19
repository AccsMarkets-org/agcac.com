import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MapPin, Clock, Briefcase, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ jobSlug: string }> }): Promise<Metadata> {
  const { jobSlug } = await params;
  const job = await prisma.careerJob.findFirst({ where: { slug: jobSlug, published: true, deletedAt: null } });
  if (!job) return { title: 'Job Not Found' };
  return {
    title: job.seoTitle || `${job.title} | Al Ghawas Careers`,
    description: job.seoDescription || job.overview.slice(0, 160),
    openGraph: { title: job.title, description: job.overview.slice(0, 160), type: 'website' },
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ jobSlug: string }> }) {
  const { jobSlug } = await params;
  const job = await prisma.careerJob.findFirst({
    where: { slug: jobSlug, published: true, status: 'Open', deletedAt: null },
  });
  if (!job) notFound();

  const related = await prisma.careerJob.findMany({
    where: { published: true, status: 'Open', deletedAt: null, department: job.department, id: { not: job.id } },
    take: 3,
    select: { id: true, title: true, slug: true, department: true, location: true, jobType: true },
  });

  const responsibilities = job.responsibilities.split('\n').filter(Boolean);
  const requirements = job.requirements.split('\n').filter(Boolean);
  const preferred = job.preferredSkills?.split('\n').filter(Boolean) || [];
  const benefits = job.benefits?.split('\n').filter(Boolean) || [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.overview,
    datePosted: job.createdAt.toISOString().slice(0, 10),
    validThrough: job.closingDate?.toISOString().slice(0, 10),
    employmentType: job.jobType.toUpperCase().replace('-', '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Al Ghawas A/C Refrigeration Contracting LLC',
      sameAs: 'https://alghawasac.com',
    },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: 'Abu Dhabi', addressCountry: 'AE' },
    },
  };

  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0 bg-gray-50" style={{ paddingTop: '100px' }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/careers" className="hover:text-red-600">Careers</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">{job.title}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
              <p className="text-red-600 font-semibold mb-4">{job.department}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-5">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />{job.location}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" />{job.jobType}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-gray-400" />{job.experienceRequired}</span>
                {job.salaryRange && <span className="text-green-600 font-medium">{job.salaryRange}</span>}
              </div>
              {job.closingDate && (
                <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 inline-block mb-4">
                  Closing Date: {new Date(job.closingDate).toLocaleDateString('en-AE', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              )}
              <Link href={`/careers/apply/${job.slug}`}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Job Overview</h2>
              <p className="text-gray-600 leading-relaxed">{job.overview}</p>
            </div>

            {/* Responsibilities */}
            {responsibilities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Responsibilities</h2>
                <ul className="space-y-2">
                  {responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {r.replace(/^[-•*]\s*/, '')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      {r.replace(/^[-•*]\s*/, '')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preferred skills */}
            {preferred.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Preferred Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {preferred.map((s, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">{s.replace(/^[-•*]\s*/, '')}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Benefits & Perks</h2>
                <ul className="space-y-2">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 shrink-0">★</span>
                      {b.replace(/^[-•*]\s*/, '')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-red-600 text-white rounded-2xl p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Ready to Apply?</h3>
              <p className="text-red-100 text-sm mb-4">Submit your application and CV now.</p>
              <Link href={`/careers/apply/${job.slug}`}
                className="block bg-white text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors">
                Apply Now
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Job Details</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['Department', job.department],
                  ['Location', job.location],
                  ['Job Type', job.jobType],
                  ['Experience', job.experienceRequired],
                  ...(job.salaryRange ? [['Salary', job.salaryRange]] : []),
                  ['Posted', new Date(job.createdAt).toLocaleDateString('en-AE')],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-medium text-gray-800 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp HR */}
            <a href={`https://wa.me/971506725808?text=Hello%2C%20I%20am%20interested%20in%20the%20${encodeURIComponent(job.title)}%20position.`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp HR
            </a>

            {/* Related jobs */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3">Related Positions</h3>
                <div className="space-y-2">
                  {related.map(r => (
                    <Link key={r.id} href={`/careers/${r.slug}`}
                      className="block p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50">
                      <div className="font-medium text-sm text-gray-900">{r.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{r.location} · {r.jobType}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link href="/careers" className="block text-center text-sm text-red-600 hover:underline">
              ← All Open Positions
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
