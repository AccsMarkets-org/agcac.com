import type { Metadata } from 'next';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy | Al Ghawas A/C Refrigeration Contracting LLC',
  description: 'Read how Al Ghawas A/C Refrigeration Contracting LLC collects, uses, protects, and manages customer information for HVAC, AC maintenance, quotations, WhatsApp inquiries, and service requests in Abu Dhabi, UAE.',
};

const TOC = [
  { id: 'about', title: '1. About This Policy' },
  { id: 'collect', title: '2. Information We Collect' },
  { id: 'how-collect', title: '3. How We Collect Information' },
  { id: 'use', title: '4. How We Use Your Information' },
  { id: 'whatsapp', title: '5. WhatsApp & Call Communication' },
  { id: 'tracking', title: '6. Advertising & Analytics Tracking' },
  { id: 'sharing', title: '7. Data Sharing' },
  { id: 'retention', title: '8. Data Retention' },
  { id: 'security', title: '9. Data Security' },
  { id: 'rights', title: '10. Your Rights' },
  { id: 'international', title: '11. International Transfers' },
  { id: 'children', title: '12. Children\'s Privacy' },
  { id: 'third-party', title: '13. Third-Party Links' },
  { id: 'changes', title: '14. Changes to This Policy' },
  { id: 'contact', title: '15. Contact Information' },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="24 June 2026" version="1.0" toc={TOC}>
      <section id="about">
        <h2>1. About This Policy</h2>
        <p>
          Al Ghawas A/C Refrigeration Contracting LLC (&quot;Al Ghawas&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a professional HVAC, air conditioning, refrigeration, and mechanical contracting company based in Abu Dhabi, United Arab Emirates.
        </p>
        <p>
          This Privacy Policy explains how we collect, use, store, protect, and share personal information when you visit our website at <strong>www.alghawasac.com</strong>, submit service requests, contact us by phone or WhatsApp, or engage with our services.
        </p>
        <p>
          By using our website or submitting any form, you acknowledge that you have read and understood this Privacy Policy. If you have any questions, please contact us using the details at the end of this page.
        </p>
      </section>

      <section id="collect" className="mt-8">
        <h2>2. Information We Collect</h2>
        <p>We may collect the following types of personal and business information:</p>

        <h3>Contact &amp; Identity Information</h3>
        <ul>
          <li>Full name</li>
          <li>Phone number and WhatsApp number</li>
          <li>Email address</li>
          <li>Location, area, and building address</li>
        </ul>

        <h3>Service Request Information</h3>
        <ul>
          <li>Type of HVAC or refrigeration service required</li>
          <li>Property type (villa, apartment, office, warehouse, cold store, etc.)</li>
          <li>Project type and scope</li>
          <li>Urgency level</li>
          <li>Message, problem description, or job details</li>
          <li>Number of rooms, AC units, or approximate property area</li>
          <li>Existing system details</li>
          <li>Budget range or project value estimates</li>
          <li>Quote calculator and BTU calculator inputs</li>
        </ul>

        <h3>AMC &amp; Contract Information</h3>
        <ul>
          <li>AMC plan type and details</li>
          <li>Equipment list and locations</li>
          <li>AMC service preferences</li>
        </ul>

        <h3>Documents &amp; Uploaded Files</h3>
        <ul>
          <li>Photos or images of AC equipment or installation areas</li>
          <li>Invoice documents submitted through the admin portal</li>
          <li>Any other files uploaded through website forms</li>
        </ul>

        <h3>Technical &amp; Device Information</h3>
        <ul>
          <li>Browser type and device information</li>
          <li>IP address (collected as a technical placeholder for spam prevention)</li>
          <li>Website pages visited and time spent</li>
          <li>Referral source and landing page URL</li>
          <li>UTM campaign parameters (source, medium, campaign, term, content)</li>
          <li>Google Ads click ID (gclid) placeholder</li>
          <li>Meta/Facebook click ID (fbclid) placeholder</li>
        </ul>

        <h3>Financial &amp; Tax Information (Admin Use Only)</h3>
        <ul>
          <li>Invoice details and payment information where submitted through our admin CRM</li>
          <li>Tax and VAT registration information relevant to service contracts</li>
        </ul>
      </section>

      <section id="how-collect" className="mt-8">
        <h2>3. How We Collect Information</h2>
        <p>We collect information in the following ways:</p>
        <ul>
          <li><strong>Website forms</strong> — quote request forms, contact forms, AMC request forms, emergency service forms, and project inquiry forms</li>
          <li><strong>Phone calls</strong> — when you call us directly at +971-50-672-5808</li>
          <li><strong>WhatsApp messages</strong> — when you contact us via WhatsApp or when a website form redirects to WhatsApp with a pre-filled message</li>
          <li><strong>Email</strong> — when you email us at info@alghawasac.com</li>
          <li><strong>Site visits and service delivery</strong> — information collected during technical site visits or ongoing service provision</li>
          <li><strong>Automated technologies</strong> — cookies, analytics tools, and advertising pixels (see Section 6)</li>
          <li><strong>Admin CRM</strong> — information entered by our internal staff during service management, invoice processing, and customer relationship management</li>
        </ul>
      </section>

      <section id="use" className="mt-8">
        <h2>4. How We Use Your Information</h2>
        <p>We use the information we collect for the following purposes:</p>
        <ul>
          <li>To respond to HVAC, AC, refrigeration, and mechanical service requests</li>
          <li>To prepare and deliver quotations for services and projects</li>
          <li>To contact you by phone, WhatsApp, or email regarding your service request</li>
          <li>To schedule site visits and assign qualified technicians</li>
          <li>To manage Annual Maintenance Contracts (AMC)</li>
          <li>To prepare, send, and manage invoices and payment records</li>
          <li>To process and track project work and service delivery</li>
          <li>To improve our website, forms, and services based on usage patterns</li>
          <li>To measure and optimise advertising campaign performance</li>
          <li>To track lead sources and understand how customers find us</li>
          <li>To prevent spam, misuse of forms, and fraudulent submissions</li>
          <li>To maintain business records and customer service history</li>
          <li>To comply with legal, accounting, tax, and regulatory obligations in the UAE</li>
        </ul>
      </section>

      <section id="whatsapp" className="mt-8">
        <h2>5. WhatsApp &amp; Call Communication</h2>
        <p>
          When you submit a service request or quote form on our website, you may be redirected to WhatsApp with a pre-filled message containing the details of your submitted request. This is to enable fast communication with our team.
        </p>
        <p>
          Communication conducted through WhatsApp is subject to WhatsApp&apos;s and Meta&apos;s own terms of service and privacy practices. We recommend reviewing{' '}
          <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">WhatsApp&apos;s Privacy Policy</a> for information about how that platform handles your data.
        </p>
        <p>
          Phone calls and WhatsApp messages are used solely for service communication. We do not record calls without consent.
        </p>
      </section>

      <section id="tracking" className="mt-8">
        <h2>6. Advertising &amp; Analytics Tracking</h2>
        <p>
          Our website may use the following third-party analytics and advertising tools to understand visitor behaviour and measure the effectiveness of our advertising:
        </p>
        <ul>
          <li><strong>Google Tag Manager</strong> (ID: GTM-XXXXXXX) — manages and deploys tracking scripts</li>
          <li><strong>Google Analytics 4</strong> (ID: G-XXXXXXXXXX) — measures website visits, user behaviour, and traffic sources</li>
          <li><strong>Google Ads Conversion Tracking</strong> (ID: AW-XXXXXXXXX) — tracks leads and conversions from Google Ads campaigns</li>
          <li><strong>Meta (Facebook) Pixel</strong> (ID: META-PIXEL-ID) — measures website actions from Meta advertising and enables retargeting</li>
        </ul>
        <p>
          These tools may collect information about your device, browser, pages visited, clicks, and how you arrived at our website. This data is collected through cookies and similar technologies (see our{' '}
          <a href="/cookie-policy">Cookie Policy</a> for details).
        </p>
        <p>
          Analytics and advertising cookies are only loaded with your consent. You can manage your preferences via our cookie banner or by visiting your browser settings.
        </p>
      </section>

      <section id="sharing" className="mt-8">
        <h2>7. Data Sharing</h2>
        <p>
          We do not sell your personal information to third parties. We may share your information only when necessary and with the following categories of recipients:
        </p>
        <ul>
          <li><strong>Internal staff</strong> — our sales team, technical staff, and management, to deliver and manage services</li>
          <li><strong>Technicians</strong> — assigned service engineers who carry out site visits or HVAC work</li>
          <li><strong>Accounting and admin team</strong> — for invoice, payment, VAT, and financial record management</li>
          <li><strong>IT and technology service providers</strong> — website hosting, CRM, and system maintenance providers who process data on our behalf under confidentiality agreements</li>
          <li><strong>Analytics and advertising platforms</strong> — Google Analytics, Google Ads, Meta Pixel (only with your consent)</li>
          <li><strong>Legal, accounting, and tax advisors</strong> — when required for professional advice or compliance</li>
          <li><strong>Government or regulatory authorities</strong> — when required by UAE law, court order, or lawful authority</li>
        </ul>
      </section>

      <section id="retention" className="mt-8">
        <h2>8. Data Retention</h2>
        <p>
          We retain your personal and business information only for as long as reasonably necessary for the purposes described in this policy, including:
        </p>
        <ul>
          <li>Service delivery, follow-up, and customer support</li>
          <li>Legal, accounting, tax, and VAT record-keeping obligations under UAE law</li>
          <li>Resolution of disputes or warranty/service claims</li>
          <li>Business record and audit requirements</li>
        </ul>
        <p>
          Lead and contact data collected through forms is retained as part of our customer relationship management system. You may request deletion of your data by contacting us (see Section 15).
        </p>
      </section>

      <section id="security" className="mt-8">
        <h2>9. Data Security</h2>
        <p>
          We take reasonable technical and organisational measures to protect your personal information from unauthorised access, loss, misuse, or disclosure. Our admin CRM system uses role-based access controls, authentication, and access logging.
        </p>
        <p>
          While we implement appropriate safeguards, no internet transmission or electronic storage system is 100% secure. We cannot guarantee absolute security of your data.
        </p>
        <p>
          Uploaded documents and files are stored on our secure server infrastructure and are only accessible to authorised internal staff.
        </p>
      </section>

      <section id="rights" className="mt-8">
        <h2>10. Your Rights</h2>
        <p>
          Depending on applicable law, you may have the following rights regarding your personal data held by Al Ghawas:
        </p>
        <ul>
          <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
          <li><strong>Correction</strong> — request correction of inaccurate or incomplete data</li>
          <li><strong>Deletion</strong> — request deletion of your personal data, subject to our legal retention obligations</li>
          <li><strong>Withdrawal of consent</strong> — withdraw consent for marketing or non-essential data use</li>
          <li><strong>Restriction</strong> — request restriction of processing in certain circumstances</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us using the details in Section 15, or submit a formal data request via our{' '}
          <a href="/data-request">Data Request page</a>. We will aim to respond within a reasonable timeframe.
        </p>
      </section>

      <section id="international" className="mt-8">
        <h2>11. International Data Transfers</h2>
        <p>
          Our primary operations and data storage are based in the United Arab Emirates. Some third-party service providers we use (such as analytics and cloud services) may process data outside the UAE. Where this occurs, we rely on those providers&apos; own data protection commitments and standard contractual measures.
        </p>
      </section>

      <section id="children" className="mt-8">
        <h2>12. Children&apos;s Privacy</h2>
        <p>
          Our website and services are intended for business and adult use. We do not knowingly collect personal information from children under the age of 18. If you believe a child has submitted personal data to us, please contact us and we will take steps to remove it.
        </p>
      </section>

      <section id="third-party" className="mt-8">
        <h2>13. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites, including supplier portals, government services, or partner websites. We are not responsible for the privacy practices of those external sites. We encourage you to review their privacy policies before providing any personal information.
        </p>
      </section>

      <section id="changes" className="mt-8">
        <h2>14. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices, services, or legal requirements. The &quot;Last Updated&quot; date at the top of this page will be updated accordingly. We encourage you to review this policy periodically.
        </p>
        <p>
          Continued use of our website or services after any changes constitutes your acceptance of the updated policy.
        </p>
      </section>

      <section id="contact" className="mt-8">
        <h2>15. Contact Information</h2>
        <p>
          For any questions, concerns, or requests relating to this Privacy Policy or your personal data, please contact us:
        </p>
        <ul>
          <li><strong>Company:</strong> Al Ghawas A/C Refrigeration Contracting LLC</li>
          <li><strong>Email:</strong> <a href="mailto:info@alghawasac.com">info@alghawasac.com</a></li>
          <li><strong>Phone / WhatsApp:</strong> <a href="tel:+971506725808">+971-50-672-5808</a></li>
          <li><strong>Address:</strong> Building No.238, Mohamed Bin Zayed City, ME-11, Abu Dhabi, UAE</li>
          <li><strong>Website:</strong> <a href="https://www.alghawasac.com" target="_blank" rel="noopener noreferrer">www.alghawasac.com</a></li>
        </ul>
      </section>
    </LegalPageLayout>
  );
}
