import { Award, FileText, Shield, CheckCircle } from 'lucide-react';

const certs = [
  { icon: '📋', title: 'Trade License', desc: 'Abu Dhabi Department of Economic Development', placeholder: 'Upload Trade License Image' },
  { icon: '🏛️', title: 'Chamber of Commerce', desc: 'Abu Dhabi Chamber of Commerce & Industry Membership', placeholder: 'Upload Chamber Certificate' },
  { icon: '🛡️', title: 'Safety Policy Certificate', desc: 'Occupational Health & Safety Management', placeholder: 'Upload Safety Certificate' },
  { icon: '⭐', title: 'Quality Management', desc: 'Quality Assurance & Management Standards', placeholder: 'Upload QM Certificate' },
  { icon: '❄️', title: 'HVAC Certification', desc: 'HVAC Technical Competency Certification', placeholder: 'Upload HVAC Certificate' },
  { icon: '🔧', title: 'Technical Registration', desc: 'Abu Dhabi Municipality — Contractor Registration', placeholder: 'Upload Registration Document' },
];

export default function CertificatesSection() {
  return (
    <section id="certificates" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/30 text-yellow-700 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            <Award className="w-3.5 h-3.5" />
            Credentials & Certifications
          </div>
          <h2 className="section-heading">Licensed, Certified & Trusted</h2>
          <p className="section-subheading mx-auto mt-3">
            Al Ghawas A/C Refrigeration Contracting LLC is a fully licensed and registered contractor
            in Abu Dhabi, operating under all required UAE certifications and approvals.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-12">
          {certs.map((cert) => (
            <div
              key={cert.title}
              className="card p-5 text-center hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="text-4xl mb-3">{cert.icon}</div>
              <h3 className="font-bold text-navy-900 text-xs mb-1 group-hover:text-brand-red transition-colors">{cert.title}</h3>
              <p className="text-gray-400 text-xs leading-tight">{cert.desc}</p>
              {/* Upload placeholder */}
              <div className="mt-3 border-2 border-dashed border-gray-200 rounded-xl h-16 flex items-center justify-center">
                <span className="text-gray-300 text-xs text-center px-1">📷 Add Image</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust statement */}
        <div className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100">
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            {[
              { icon: CheckCircle, text: 'DED Licensed' },
              { icon: Shield, text: 'Civil Defence Approved' },
              { icon: Award, text: 'ADM Registered' },
              { icon: FileText, text: 'All Permits in Order' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-navy-900">
                <Icon className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-sm">{text}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            All our certifications are maintained current and renewed annually.
            We provide copies of licenses and certifications upon request for commercial and government tenders.
          </p>
        </div>
      </div>
    </section>
  );
}
