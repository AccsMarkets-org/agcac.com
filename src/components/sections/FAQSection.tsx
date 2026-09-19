'use client';
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Do you provide AC maintenance in Abu Dhabi?',
    a: 'Yes, we provide comprehensive AC maintenance services across Abu Dhabi — including split AC units, ducted systems, package units, VRF systems, and chillers. We offer one-time service visits and annual maintenance contracts (AMC).',
  },
  {
    q: 'Do you handle villa AC installation?',
    a: 'Absolutely. We specialize in villa HVAC installations including split ACs, ducted split systems, VRF multi-zone systems, ventilation, and full plumbing works. We cover all Abu Dhabi areas including Khalifa City, Yas Island, Baniyas, MBZ City, Shamkha, and more.',
  },
  {
    q: 'Do you provide commercial HVAC services?',
    a: 'Yes. We handle complete commercial HVAC projects including AHU/FCU installation, chilled water systems, VRF systems, package units, ducting, ventilation, and full mechanical works for offices, malls, schools, hotels, and buildings.',
  },
  {
    q: 'Do you install VRF systems?',
    a: 'Yes, we are experienced in VRF (Variable Refrigerant Flow) system design, installation, commissioning, and maintenance. We have completed VRF projects across various Abu Dhabi locations including luxury villas and commercial buildings.',
  },
  {
    q: 'Do you provide chilled water pipe works?',
    a: 'Yes. We design, supply, and install chilled water pipework systems — including insulated piping, valve sets, expansion tanks, pumps, and connections to AHU/FCU units for large commercial and industrial buildings.',
  },
  {
    q: 'Do you fabricate and install ducts?',
    a: 'Yes. We operate our own GI duct fabrication facility. We handle full ductwork design, fabrication, and installation for commercial, industrial, and residential projects, following SMACNA and ASHRAE standards.',
  },
  {
    q: 'Do you provide emergency AC repair?',
    a: 'Yes. We provide urgent AC repair and breakdown support for residential and commercial clients in Abu Dhabi. Call us directly at +971-50-672-5808 or send us a WhatsApp message for fastest response.',
  },
  {
    q: 'Do you offer Annual Maintenance Contracts (AMC)?',
    a: 'Yes. We offer Basic, Standard, and Premium AMC packages tailored to your property size and HVAC equipment. AMC plans include scheduled preventive visits, priority support, and maintenance reports.',
  },
  {
    q: 'Do you work for buildings, schools, hotels, and factories?',
    a: 'Yes. We have completed projects for commercial buildings, government offices, schools, hotels, steel factories, and large industrial facilities across Abu Dhabi. We handle projects of all sizes from small apartments to large-scale industrial complexes.',
  },
  {
    q: 'How can I request a quote?',
    a: 'You can request a free quote in three ways: (1) Fill our online quote form on this page, (2) WhatsApp us at +971-50-672-5808, or (3) Call us directly. We respond quickly to all inquiries.',
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-navy-900/5 border border-navy-900/10 text-navy-900 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="section-heading">Common HVAC Questions</h2>
          <p className="section-subheading mx-auto mt-3">
            Find answers to the most common questions about our HVAC services in Abu Dhabi.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`card border transition-all duration-300 ${
                openIdx === idx ? 'border-brand-red/30 shadow-md' : 'border-gray-100'
              }`}
            >
              <button
                className="w-full flex items-center justify-between gap-4 p-6 text-left"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                aria-expanded={openIdx === idx}
              >
                <span className={`font-semibold text-sm transition-colors ${openIdx === idx ? 'text-brand-red' : 'text-navy-900'}`}>
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                    openIdx === idx ? 'rotate-180 text-brand-red' : 'text-gray-400'
                  }`}
                />
              </button>
              {openIdx === idx && (
                <div className="px-6 pb-6 animate-fade-in">
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Schema JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            }),
          }}
        />

        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">Don&apos;t see your question? Contact us directly.</p>
          <a
            href="https://wa.me/971506725808?text=Hello%20Al%20Ghawas%2C%20I%20have%20a%20question%20about%20your%20HVAC%20services."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            Ask on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
