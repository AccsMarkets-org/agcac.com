'use client';
import { useState } from 'react';
import { FileText, ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';

const LEGAL_PAGES = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    route: '/privacy-policy',
    description: 'How we collect, use, and protect personal data from website visitors and service customers.',
    sections: ['About This Policy', 'Information We Collect', 'How We Use Your Information', 'Data Sharing', 'Your Rights'],
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    route: '/terms-and-conditions',
    description: 'Terms governing use of the website, quote requests, service bookings, AMC contracts, and project works.',
    sections: ['Acceptance of Terms', 'Quote Requests', 'HVAC Calculator Disclaimer', 'Payments & VAT', 'Limitation of Liability'],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    route: '/cookie-policy',
    description: 'Types of cookies used, third-party tracking tools (Google Analytics, Meta Pixel), and how to manage consent.',
    sections: ['What Are Cookies?', 'Analytics Cookies', 'Advertising Cookies', 'How to Control Cookies'],
  },
  {
    slug: 'refund-cancellation-policy',
    title: 'Refund & Cancellation Policy',
    route: '/refund-cancellation-policy',
    description: 'Cancellation terms for service visits, installations, AMC contracts, deposits, and ordered materials.',
    sections: ['Service Visits', 'Emergency Call-Outs', 'AMC Contracts', 'Refunds', 'No-Show Policy'],
  },
  {
    slug: 'data-request',
    title: 'Data Request Page',
    route: '/data-request',
    description: 'Public form allowing users to submit data access, correction, deletion, or consent withdrawal requests.',
    sections: ['About Data Requests', 'What You Can Request', 'Submit a Request Form'],
  },
];

export default function LegalPagesClient() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const active = LEGAL_PAGES.find(p => p.slug === activeSlug);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Legal Pages</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage and review the legal and compliance pages published on the public website.
        </p>
      </div>

      {/* Legal disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Legal Review Required:</strong> These pages are business templates and should be reviewed by a qualified UAE legal/privacy advisor before final publication. Any updates to content should also be reviewed before going live.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page list */}
        <div className="space-y-2">
          {LEGAL_PAGES.map(page => (
            <button
              key={page.slug}
              onClick={() => setActiveSlug(page.slug)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                activeSlug === page.slug
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900">{page.title}</div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">{page.route}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {!active ? (
            <div className="h-full flex items-center justify-center text-gray-400 rounded-xl border-2 border-dashed border-gray-200 min-h-[300px]">
              <div className="text-center">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select a page to view details</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{active.title}</h2>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Public URL:{' '}
                    <Link
                      href={active.route}
                      target="_blank"
                      className="text-red-600 hover:underline"
                    >
                      {active.route}
                    </Link>
                  </div>
                </div>
                <Link
                  href={active.route}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs bg-gray-900 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Live
                </Link>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</div>
                <p className="text-sm text-gray-700">{active.description}</p>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Sections</div>
                <ul className="space-y-1.5">
                  {active.sections.map(s => (
                    <li key={s} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                <strong>Version 1.0</strong> — Last Updated: 24 June 2026
                <p className="mt-1 text-xs text-blue-600">
                  To update the content of this page, edit the corresponding source file and redeploy. Future versions will support in-app editing.
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                <strong>Legal Review Note:</strong> Before publishing any changes to this page, ensure they are reviewed by a qualified UAE legal or privacy advisor. Changes to the Privacy Policy or Cookie Policy may require re-consent from existing users.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
