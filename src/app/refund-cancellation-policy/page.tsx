import type { Metadata } from 'next';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Al Ghawas A/C Refrigeration Contracting LLC',
  description: 'Understand the cancellation, refund, and rescheduling terms for Al Ghawas A/C HVAC services, maintenance visits, installations, AMC contracts, and project work in Abu Dhabi, UAE.',
};

const TOC = [
  { id: 'overview', title: '1. Overview' },
  { id: 'general', title: '2. General Cancellation Terms' },
  { id: 'service-visits', title: '3. Service Visits & Maintenance Calls' },
  { id: 'emergency', title: '4. Emergency Call-Outs' },
  { id: 'installations', title: '5. Installation Projects' },
  { id: 'amc', title: '6. AMC Contracts' },
  { id: 'refunds', title: '7. Refunds' },
  { id: 'deposits', title: '8. Deposits & Advance Payments' },
  { id: 'materials', title: '9. Ordered Materials & Parts' },
  { id: 'rescheduling', title: '10. Rescheduling' },
  { id: 'no-show', title: '11. No-Show & Access Denial' },
  { id: 'quality', title: '12. Service Quality Issues' },
  { id: 'changes', title: '13. Changes to This Policy' },
  { id: 'contact', title: '14. Contact' },
];

export default function RefundCancellationPage() {
  return (
    <LegalPageLayout title="Refund & Cancellation Policy" lastUpdated="24 June 2026" version="1.0" toc={TOC}>
      <section id="overview">
        <h2>1. Overview</h2>
        <p>
          This Refund &amp; Cancellation Policy outlines the terms that apply when you wish to cancel, reschedule, or request a refund for services provided by Al Ghawas A/C Refrigeration Contracting LLC.
        </p>
        <p>
          Please read this policy carefully before booking any service. By confirming a booking or paying any deposit, you agree to these terms. Specific project contracts may have their own cancellation terms which will take precedence over this general policy.
        </p>
      </section>

      <section id="general" className="mt-8">
        <h2>2. General Cancellation Terms</h2>
        <p>
          All cancellation requests must be communicated to us directly by:
        </p>
        <ul>
          <li><strong>Phone / WhatsApp:</strong> +971-50-672-5808</li>
          <li><strong>Email:</strong> <a href="mailto:info@alghawasac.com">info@alghawasac.com</a></li>
        </ul>
        <p>
          Verbal cancellations made over the phone should be confirmed in writing via WhatsApp or email for record purposes.
        </p>
        <p>
          The cancellation terms depend on the type of service, the timing of the cancellation, and whether preparatory work, materials procurement, or scheduling commitments have already been made.
        </p>
      </section>

      <section id="service-visits" className="mt-8">
        <h2>3. Service Visits &amp; Maintenance Calls</h2>
        <p>
          For single service visits, diagnostic calls, AC cleaning, repair, or maintenance calls that are not part of an AMC:
        </p>
        <ul>
          <li>
            <strong>Cancellations with more than 24 hours&apos; notice:</strong> No charge. The booking will be cancelled without penalty, and any prepaid amounts (if applicable) will be refunded.
          </li>
          <li>
            <strong>Cancellations with less than 24 hours&apos; notice:</strong> A cancellation fee may apply to cover the cost of scheduling and technician allocation. We will advise the applicable fee when confirming your appointment.
          </li>
          <li>
            <strong>Cancellations on the same day (within 4 hours of the appointment):</strong> A same-day cancellation fee may apply. This reflects the cost of the technician&apos;s allocated time and any travel arrangements made.
          </li>
        </ul>
      </section>

      <section id="emergency" className="mt-8">
        <h2>4. Emergency Call-Outs</h2>
        <p>
          Emergency call-out services are mobilised immediately upon confirmation. Cancellations after a technician has been dispatched will incur a call-out fee to cover the cost of mobilisation and travel time.
        </p>
        <p>
          Emergency fees are confirmed and agreed prior to dispatch.
        </p>
      </section>

      <section id="installations" className="mt-8">
        <h2>5. Installation Projects</h2>
        <p>
          For HVAC installation, ductwork, VRF, chilled water, or mechanical contracting projects:
        </p>
        <ul>
          <li>
            <strong>Cancellation before project commencement:</strong> Any preparatory costs already incurred (site survey, design, permit fees, materials ordered) may be deducted from any refund of advance payments.
          </li>
          <li>
            <strong>Cancellation after project commencement:</strong> You will be liable for all costs incurred to date including labour, materials, subcontractor costs, and a reasonable administrative fee. Cancellation after commencement may result in a partial or no refund of any advance payments, depending on the stage of work completed.
          </li>
          <li>
            <strong>Scope change vs. cancellation:</strong> If you wish to reduce the scope of work rather than cancel entirely, we will assess costs and prepare a revised quotation.
          </li>
        </ul>
        <p>
          Installation project cancellation terms are subject to the specific contract signed between Al Ghawas and the customer.
        </p>
      </section>

      <section id="amc" className="mt-8">
        <h2>6. Annual Maintenance Contracts (AMC)</h2>
        <p>
          AMC contracts are entered into for a defined period. Please refer to your signed AMC agreement for specific cancellation terms. In general:
        </p>
        <ul>
          <li>
            <strong>Cancellation within 7 days of signing:</strong> Full refund if no scheduled visits have taken place.
          </li>
          <li>
            <strong>Cancellation within the first month:</strong> Refund of the remaining contract value, minus a setup and administration fee and the value of any visits already completed.
          </li>
          <li>
            <strong>Cancellation mid-contract:</strong> The remaining contract value may be refunded on a pro-rata basis, minus any visits and services already provided, any materials or parts used, and an early cancellation administration fee.
          </li>
          <li>
            <strong>Non-renewal:</strong> AMC contracts may be allowed to expire at the end of the contract period without penalty. Please notify us at least 30 days before expiry if you do not intend to renew.
          </li>
        </ul>
        <p>
          AMC cancellations must be submitted in writing and are subject to review by our contracts team.
        </p>
      </section>

      <section id="refunds" className="mt-8">
        <h2>7. Refunds</h2>
        <p>
          Where a refund is applicable and approved:
        </p>
        <ul>
          <li>Refunds will be processed within 7–14 working days of the approved cancellation.</li>
          <li>Refunds will be issued using the same payment method as the original payment, where possible.</li>
          <li>We do not issue refunds in cash unless the original payment was made in cash.</li>
          <li>Processing times may vary depending on your bank or financial institution.</li>
        </ul>
        <p>
          Refunds are not issued for services that have been fully delivered and completed to the agreed standard.
        </p>
      </section>

      <section id="deposits" className="mt-8">
        <h2>8. Deposits &amp; Advance Payments</h2>
        <p>
          For larger projects, we may require a deposit or advance payment before commencing work. Deposit terms are stated in the quotation or contract document. In general:
        </p>
        <ul>
          <li>Deposits are non-refundable if the project is cancelled after site visit, design work, or material ordering has commenced.</li>
          <li>If Al Ghawas is unable to fulfil the agreed project scope for reasons within our control, the deposit will be refunded in full.</li>
          <li>Deposits for materials and equipment that have already been purchased, ordered, or committed to by Al Ghawas are non-refundable.</li>
        </ul>
      </section>

      <section id="materials" className="mt-8">
        <h2>9. Ordered Materials &amp; Parts</h2>
        <p>
          If materials, spare parts, or equipment have been specifically ordered or purchased for your project:
        </p>
        <ul>
          <li>These costs are non-refundable once the order has been placed with the supplier.</li>
          <li>If the materials can be returned to the supplier, any restocking or return fees will be deducted from any refund.</li>
          <li>Custom fabricated or special-order items (e.g., ductwork, custom panels) are non-refundable in all cases.</li>
        </ul>
      </section>

      <section id="rescheduling" className="mt-8">
        <h2>10. Rescheduling</h2>
        <p>
          We understand that plans may change. Rescheduling a service appointment is generally possible provided you notify us at least 12 hours in advance. To reschedule, contact us by phone or WhatsApp at +971-50-672-5808.
        </p>
        <p>
          Rescheduled appointments are subject to technician availability and may result in a different appointment slot.
        </p>
      </section>

      <section id="no-show" className="mt-8">
        <h2>11. No-Show &amp; Access Denial</h2>
        <p>
          If a technician arrives at the agreed appointment time and is unable to gain access to the property, or is turned away without prior notice:
        </p>
        <ul>
          <li>A no-show or aborted visit fee may apply to cover the technician&apos;s time and travel.</li>
          <li>The appointment will be recorded as a missed visit.</li>
          <li>For AMC customers, a missed visit due to customer non-access may be counted against the contracted visit quota.</li>
        </ul>
      </section>

      <section id="quality" className="mt-8">
        <h2>12. Service Quality Issues</h2>
        <p>
          If you are not satisfied with the quality of service delivered, please contact us within 48 hours of the service visit or project completion. Al Ghawas takes all quality concerns seriously and will investigate and arrange a revisit or corrective action where appropriate.
        </p>
        <p>
          Refunds for completed work are at the discretion of management and are only issued in exceptional circumstances where a service has not been delivered as agreed and cannot be remedied.
        </p>
        <p>
          Al Ghawas does not issue refunds for:
        </p>
        <ul>
          <li>Services that were correctly delivered but did not meet subjective customer expectations not documented in the agreed scope</li>
          <li>Equipment faults or failures arising from pre-existing conditions not disclosed at the time of service</li>
          <li>Failures in third-party equipment or manufacturer parts</li>
        </ul>
      </section>

      <section id="changes" className="mt-8">
        <h2>13. Changes to This Policy</h2>
        <p>
          Al Ghawas reserves the right to update this Refund &amp; Cancellation Policy at any time. Changes will be published on this page with an updated &quot;Last Updated&quot; date. The policy applicable at the time of your booking will govern your transaction.
        </p>
      </section>

      <section id="contact" className="mt-8">
        <h2>14. Contact</h2>
        <p>
          For any questions or cancellation requests:
        </p>
        <ul>
          <li><strong>Company:</strong> Al Ghawas A/C Refrigeration Contracting LLC</li>
          <li><strong>Phone / WhatsApp:</strong> <a href="tel:+971506725808">+971-50-672-5808</a></li>
          <li><strong>Email:</strong> <a href="mailto:info@alghawasac.com">info@alghawasac.com</a></li>
          <li><strong>Address:</strong> Building No.238, Mohamed Bin Zayed City, ME-11, Abu Dhabi, UAE</li>
        </ul>
      </section>
    </LegalPageLayout>
  );
}
