import type { Metadata } from 'next';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Al Ghawas A/C Refrigeration Contracting LLC',
  description: 'Review the terms for using Al Ghawas A/C Refrigeration Contracting LLC website, quote forms, WhatsApp inquiries, HVAC services, AMC requests, invoices, and project consultations.',
};

const TOC = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'company', title: '2. About the Company' },
  { id: 'website-use', title: '3. Website Use' },
  { id: 'quotes', title: '4. Quote Requests' },
  { id: 'calculator', title: '5. HVAC Calculator Disclaimer' },
  { id: 'availability', title: '6. Service Availability' },
  { id: 'site-visits', title: '7. Site Visits' },
  { id: 'pricing', title: '8. Pricing & Quotations' },
  { id: 'payments', title: '9. Payments & VAT' },
  { id: 'cancellations', title: '10. Cancellations' },
  { id: 'emergency', title: '11. Emergency Services' },
  { id: 'amc', title: '12. AMC Contracts' },
  { id: 'projects', title: '13. Project Works' },
  { id: 'customer', title: '14. Customer Responsibilities' },
  { id: 'uploads', title: '15. Uploaded Files' },
  { id: 'liability', title: '16. Limitation of Liability' },
  { id: 'warranties', title: '17. Warranties & Workmanship' },
  { id: 'ip', title: '18. Intellectual Property' },
  { id: 'third-party', title: '19. Third-Party Links' },
  { id: 'changes', title: '20. Changes to Terms' },
  { id: 'law', title: '21. Governing Law' },
  { id: 'contact', title: '22. Contact' },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" lastUpdated="24 June 2026" version="1.0" toc={TOC}>
      <section id="acceptance">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using the website at <strong>www.alghawasac.com</strong>, submitting any form, requesting a quote, or engaging with any service offered by Al Ghawas A/C Refrigeration Contracting LLC, you agree to be bound by these Terms &amp; Conditions.
        </p>
        <p>
          If you do not agree to these terms, please discontinue use of the website and refrain from submitting any requests.
        </p>
      </section>

      <section id="company" className="mt-8">
        <h2>2. About the Company</h2>
        <p>
          <strong>Al Ghawas A/C Refrigeration Contracting LLC</strong> is a licensed HVAC and mechanical contracting company operating in Abu Dhabi and the UAE, providing air conditioning installation, maintenance, repair, refrigeration, ducting, ventilation, chilled water works, VRF systems, plumbing, and annual maintenance contracts. The company has been operating since 2005.
        </p>
        <p>
          Registered address: Building No.238, Mohamed Bin Zayed City, ME-11, Abu Dhabi, UAE
        </p>
      </section>

      <section id="website-use" className="mt-8">
        <h2>3. Website Use</h2>
        <p>
          You agree to use our website only for lawful purposes. You must not:
        </p>
        <ul>
          <li>Submit false, misleading, or fraudulent information through any form</li>
          <li>Upload harmful, illegal, or malicious files or content</li>
          <li>Attempt to gain unauthorised access to any part of the website or its systems</li>
          <li>Use any automated tool, scraper, or bot to collect information from the website</li>
          <li>Use the website in any manner that could damage, disable, or impair its functionality</li>
          <li>Misuse contact forms or quote forms for any purpose other than genuine HVAC or service enquiries</li>
        </ul>
      </section>

      <section id="quotes" className="mt-8">
        <h2>4. Quote Requests</h2>
        <p>
          Quote requests submitted through our website forms, WhatsApp, phone calls, or email are not binding quotations. They represent a request for us to prepare an estimate.
        </p>
        <p>
          Any estimate, quote, or price indication provided online, by phone, or by WhatsApp is <strong>not final</strong> unless confirmed by Al Ghawas in writing (email, signed quotation, or written agreement).
        </p>
        <p>
          Final pricing depends on:
        </p>
        <ul>
          <li>Physical site inspection and actual conditions</li>
          <li>Equipment type, condition, and brand</li>
          <li>Confirmed project scope and specifications</li>
          <li>Materials, components, and parts required</li>
          <li>Labour, access conditions, and working hours</li>
          <li>Urgency level and scheduling requirements</li>
          <li>Required approvals, permits, or HOA/building management clearances</li>
          <li>Applicable VAT and taxes as required by UAE law</li>
        </ul>
      </section>

      <section id="calculator" className="mt-8">
        <h2>5. HVAC Calculator Disclaimer</h2>
        <p>
          Our website may provide BTU calculators, tonnage estimators, and quote calculators for informational purposes only. These tools provide rough estimates based on general inputs.
        </p>
        <p>
          <strong>These calculator results are not professional engineering assessments.</strong> Actual HVAC sizing, equipment selection, and installation requirements depend on many factors including insulation, climate, building orientation, occupancy, and local conditions, which can only be properly assessed by a qualified HVAC engineer during a site visit.
        </p>
        <p>
          Al Ghawas is not liable for decisions made solely on the basis of calculator outputs without professional confirmation.
        </p>
      </section>

      <section id="availability" className="mt-8">
        <h2>6. Service Availability</h2>
        <p>
          Our services are primarily provided in Abu Dhabi and other areas of the UAE that we serve. Service availability is subject to:
        </p>
        <ul>
          <li>Technician availability and scheduling</li>
          <li>Distance and project location</li>
          <li>Emergency priority and job queue</li>
          <li>Project type and required expertise</li>
          <li>Availability of materials and equipment</li>
        </ul>
        <p>
          Al Ghawas reserves the right to decline service requests that fall outside our operational area, technical capacity, or that do not align with our service standards.
        </p>
      </section>

      <section id="site-visits" className="mt-8">
        <h2>7. Site Visits</h2>
        <p>
          For most HVAC projects, installations, and complex maintenance work, a site visit will be required before a final quotation can be issued. During a site visit, our team will assess the technical requirements.
        </p>
        <p>
          You agree to:
        </p>
        <ul>
          <li>Provide accurate location and access information</li>
          <li>Ensure safe and clear access to the work area</li>
          <li>Disclose any known hazards, system faults, or access restrictions</li>
          <li>Obtain any required building or community approvals prior to the visit</li>
        </ul>
      </section>

      <section id="pricing" className="mt-8">
        <h2>8. Pricing &amp; Quotations</h2>
        <p>
          All formal quotations issued by Al Ghawas are valid for the period stated in the quotation document. After expiry, prices may be subject to change based on material costs, labour rates, and market conditions.
        </p>
        <p>
          Prices quoted are subject to change if the scope of work changes from what was originally agreed.
        </p>
      </section>

      <section id="payments" className="mt-8">
        <h2>9. Payments &amp; VAT</h2>
        <p>
          Payment terms are as agreed in the formal quotation, invoice, or service agreement provided by Al Ghawas. Standard payment terms will be stated on the invoice.
        </p>
        <p>
          Unpaid invoices may result in:
        </p>
        <ul>
          <li>Delay or suspension of ongoing service delivery</li>
          <li>Withholding of handover documents or completion certificates</li>
          <li>Suspension of AMC services until payment is received</li>
          <li>Referral to legal or debt recovery processes as permitted under UAE law</li>
        </ul>
        <p>
          Prices may be subject to Value Added Tax (VAT) at the applicable UAE rate (currently 5%), as required by Federal Law. VAT will be shown separately on all formal invoices.
        </p>
      </section>

      <section id="cancellations" className="mt-8">
        <h2>10. Cancellations</h2>
        <p>
          Cancellations of scheduled site visits, service bookings, or project work should be communicated to us as early as possible by phone or WhatsApp at +971-50-672-5808.
        </p>
        <p>
          Cancellation terms depend on whether materials have been purchased, work has commenced, or significant scheduling has been made. Please refer to our{' '}
          <a href="/refund-cancellation-policy">Refund &amp; Cancellation Policy</a> for full details.
        </p>
      </section>

      <section id="emergency" className="mt-8">
        <h2>11. Emergency Services</h2>
        <p>
          Al Ghawas offers emergency HVAC repair services subject to technician availability. Emergency response times are not guaranteed and depend on:
        </p>
        <ul>
          <li>Current technician schedule and job priority</li>
          <li>Location and distance to the site</li>
          <li>Traffic and road conditions</li>
          <li>Nature and severity of the fault</li>
        </ul>
        <p>
          Emergency call-out charges may apply in addition to standard repair rates. These will be communicated before or upon confirmation of attendance.
        </p>
      </section>

      <section id="amc" className="mt-8">
        <h2>12. Annual Maintenance Contracts (AMC)</h2>
        <p>
          Annual Maintenance Contracts are subject to the specific terms, scope, pricing, and conditions outlined in the signed AMC agreement. Key considerations include:
        </p>
        <ul>
          <li>Plan type (Basic, Standard, Comprehensive) and covered equipment</li>
          <li>Number of scheduled visits and response time commitments</li>
          <li>Parts and materials inclusion or exclusion as specified in the plan</li>
          <li>Payment schedule and renewal terms</li>
          <li>Exclusions for damage caused by misuse, flooding, pest infestation, or external factors</li>
          <li>AMC service is conditional on payment being up to date</li>
        </ul>
        <p>
          Please refer to your individual AMC agreement for specific terms. Contact us for a copy of your contract.
        </p>
      </section>

      <section id="projects" className="mt-8">
        <h2>13. Project Works</h2>
        <p>
          Larger HVAC installation, ductwork, VRF, chilled water, or mechanical contracting projects are governed by the signed project contract, scope of work document, and agreed schedule. In the absence of a signed contract, these general terms apply.
        </p>
        <p>
          Delays caused by factors outside our control (material supply, approvals, access restrictions, extreme weather, or third-party delays) are not the liability of Al Ghawas.
        </p>
      </section>

      <section id="customer" className="mt-8">
        <h2>14. Customer Responsibilities</h2>
        <p>
          As a customer or website user, you are responsible for:
        </p>
        <ul>
          <li>Providing accurate and complete information in all forms and communications</li>
          <li>Ensuring safe access for our technicians to the work site</li>
          <li>Disclosing any known equipment faults, system history, or access restrictions</li>
          <li>Obtaining all required building, community, or HOA approvals before work commences</li>
          <li>Paying agreed amounts according to the stated payment schedule</li>
          <li>Informing us promptly of any changes to the project scope or requirements</li>
        </ul>
      </section>

      <section id="uploads" className="mt-8">
        <h2>15. Uploaded Files &amp; Photos</h2>
        <p>
          If you upload photos, documents, or other files through our website or WhatsApp, you confirm that:
        </p>
        <ul>
          <li>You have the right to share those files</li>
          <li>The files do not contain illegal, harmful, defamatory, or malicious content</li>
          <li>The files are relevant to your HVAC service enquiry or request</li>
        </ul>
        <p>
          Uploaded files are used solely to understand your service requirements and prepare quotations. We do not use uploaded photos for marketing or third-party purposes without consent.
        </p>
      </section>

      <section id="liability" className="mt-8">
        <h2>16. Limitation of Liability</h2>
        <p>
          Al Ghawas A/C Refrigeration Contracting LLC strives to deliver professional and high-quality HVAC services. However, to the extent permitted by applicable law, we shall not be liable for:
        </p>
        <ul>
          <li>Indirect, consequential, or incidental losses arising from service disruptions</li>
          <li>Delays caused by factors outside our reasonable control (weather, supply chains, third-party contractors, approvals)</li>
          <li>Pre-existing faults, defects, or deterioration in customer equipment not disclosed to us</li>
          <li>Defects in third-party equipment or manufacturer components</li>
          <li>Losses arising from inaccurate information provided by the customer</li>
          <li>Business losses, lost revenue, or consequential economic loss</li>
        </ul>
        <p>
          Our liability in any case shall not exceed the value of the relevant service or project as invoiced.
        </p>
      </section>

      <section id="warranties" className="mt-8">
        <h2>17. Warranties &amp; Workmanship</h2>
        <p>
          Al Ghawas provides a workmanship warranty on completed installations and service work as specified in the relevant invoice or project agreement. Warranty terms vary by service type. Equipment and materials are subject to manufacturer warranties only.
        </p>
        <p>
          Warranties are void if equipment is tampered with, modified, or serviced by unauthorised parties after our work is completed.
        </p>
      </section>

      <section id="ip" className="mt-8">
        <h2>18. Intellectual Property</h2>
        <p>
          All content on this website — including text, images, logos, branding, service descriptions, design, layout, and company materials — is the property of Al Ghawas A/C Refrigeration Contracting LLC or its licensed providers.
        </p>
        <p>
          You may not reproduce, copy, distribute, or use any content from this website for commercial purposes without our written permission.
        </p>
      </section>

      <section id="third-party" className="mt-8">
        <h2>19. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. These links are provided for convenience only. We have no control over the content, privacy practices, or terms of those websites and are not responsible for them.
        </p>
      </section>

      <section id="changes" className="mt-8">
        <h2>20. Changes to These Terms</h2>
        <p>
          We reserve the right to update or modify these Terms &amp; Conditions at any time. The &quot;Last Updated&quot; date at the top of this page will reflect changes. Continued use of the website after changes are made constitutes your acceptance of the updated terms.
        </p>
      </section>

      <section id="law" className="mt-8">
        <h2>21. Governing Law</h2>
        <p>
          These Terms &amp; Conditions are governed by and construed in accordance with the applicable laws of the United Arab Emirates. Any disputes arising from these terms or the use of our services shall be subject to the jurisdiction of the competent courts of Abu Dhabi, UAE.
        </p>
      </section>

      <section id="contact" className="mt-8">
        <h2>22. Contact</h2>
        <p>
          For any questions regarding these Terms &amp; Conditions:
        </p>
        <ul>
          <li><strong>Company:</strong> Al Ghawas A/C Refrigeration Contracting LLC</li>
          <li><strong>Email:</strong> <a href="mailto:info@alghawasac.com">info@alghawasac.com</a></li>
          <li><strong>Phone / WhatsApp:</strong> <a href="tel:+971506725808">+971-50-672-5808</a></li>
          <li><strong>Address:</strong> Building No.238, Mohamed Bin Zayed City, ME-11, Abu Dhabi, UAE</li>
        </ul>
      </section>
    </LegalPageLayout>
  );
}
