import type { Metadata } from 'next';
import LegalPageLayout from '@/components/layout/LegalPageLayout';
import DataRequestForm from './DataRequestForm';

export const metadata: Metadata = {
  title: 'Data Request | Al Ghawas A/C Refrigeration Contracting LLC',
  description: 'Submit a data access, correction, deletion, or consent withdrawal request. We will respond to your privacy request within a reasonable timeframe.',
};

const TOC = [
  { id: 'about', title: 'About Data Requests' },
  { id: 'what-you-can-request', title: 'What You Can Request' },
  { id: 'form', title: 'Submit a Request' },
  { id: 'process', title: 'What Happens Next?' },
];

export default function DataRequestPage() {
  return (
    <LegalPageLayout title="Data Request" lastUpdated="24 June 2026" version="1.0" toc={TOC}>
      <section id="about">
        <h2>About Data Requests</h2>
        <p>
          Al Ghawas A/C Refrigeration Contracting LLC is committed to respecting your privacy. You may submit a formal request relating to any personal data we hold about you, including data collected from our website forms, service bookings, or direct communications.
        </p>
        <p>
          Please note that some data may be retained to comply with our legal, accounting, tax, and contractual obligations under UAE law, even if a deletion request is submitted.
        </p>
      </section>

      <section id="what-you-can-request" className="mt-8">
        <h2>What You Can Request</h2>
        <ul>
          <li>
            <strong>Access</strong> — Request a copy of the personal data we hold about you and how it is used.
          </li>
          <li>
            <strong>Correction</strong> — Request that we correct inaccurate or incomplete data we hold.
          </li>
          <li>
            <strong>Deletion</strong> — Request that we delete your personal data. Subject to legal retention obligations.
          </li>
          <li>
            <strong>Consent Withdrawal</strong> — Withdraw consent for analytics, advertising cookies, or marketing communications.
          </li>
          <li>
            <strong>Other</strong> — Any other privacy-related request or question about your data.
          </li>
        </ul>
      </section>

      <section id="form" className="mt-8">
        <h2>Submit a Request</h2>
        <DataRequestForm />
      </section>

      <section id="process" className="mt-8">
        <h2>What Happens Next?</h2>
        <p>
          Once we receive your request:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Our team will review your submission and may contact you to verify your identity.</li>
          <li>We will aim to respond to your request within a reasonable timeframe (typically within 30 days).</li>
          <li>For complex requests or those requiring significant investigation, we will keep you informed of progress.</li>
          <li>If we are unable to fulfil the request (e.g., due to legal retention obligations), we will explain the reason.</li>
        </ol>
        <p className="mt-4">
          If you have an urgent matter, please contact us directly by phone or WhatsApp at{' '}
          <a href="tel:+971506725808" className="text-red-600 hover:underline">+971-50-672-5808</a> or by email at{' '}
          <a href="mailto:info@alghawasac.com" className="text-red-600 hover:underline">info@alghawasac.com</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
