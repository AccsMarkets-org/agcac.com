import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import MobileBottomBar from '@/components/layout/MobileBottomBar';
import Link from 'next/link';
import { CheckCircle, Briefcase, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Application Submitted | Al Ghawas Careers',
  description: 'Your job application has been submitted successfully.',
  robots: 'noindex',
};

export default function CareersThankYouPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pb-16 md:pb-0" style={{ paddingTop: '100px' }}>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl shadow-xl p-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
            <p className="text-gray-500 mb-2">Thank you for applying to Al Ghawas A/C Refrigeration Contracting LLC.</p>
            <p className="text-gray-500 mb-8">Our HR team will review your application and contact you within <strong className="text-gray-800">3–5 business days</strong> if your profile matches our requirements.</p>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-700 mb-8 text-left">
              <p className="font-semibold mb-1">What happens next?</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-600">
                <li>HR reviews your CV and application</li>
                <li>Shortlisted candidates are contacted by phone or WhatsApp</li>
                <li>Interview scheduled (phone or in-person)</li>
                <li>Final decision communicated</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/careers" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                <Briefcase className="w-4 h-4" /> View More Jobs
              </Link>
              <Link href="/" className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors">
                Back to Home <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomBar />
    </>
  );
}
