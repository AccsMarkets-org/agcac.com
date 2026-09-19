import { CheckCircle, Shield, Star, Award, Cpu, Users } from 'lucide-react';

const pillars = [
  { icon: CheckCircle, title: 'Rigorous Testing', desc: 'Every installation and repair is followed by comprehensive performance testing and system verification before handover.' },
  { icon: Users, title: 'Customer-Centric Approach', desc: 'We prioritize client satisfaction at every stage — from initial consultation to post-completion support.' },
  { icon: Cpu, title: 'Skilled & Trained Workforce', desc: 'Our technicians undergo regular training on the latest HVAC technologies and UAE safety standards.' },
  { icon: Star, title: 'Continuous Improvement', desc: 'We continuously improve our methods, tools, and processes to deliver better results on every project.' },
  { icon: Shield, title: 'Final Inspection Protocol', desc: 'Each project undergoes a formal final inspection by our QA engineer before client handover.' },
  { icon: Award, title: 'Industry-Standard Compliance', desc: 'All works comply with ASHRAE, SMACNA, UAE Civil Defence, and local municipality codes.' },
];

export default function QualitySection() {
  return (
    <section id="quality" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            Quality Assurance
          </div>
          <h2 className="section-heading">Our Quality Assurance Process</h2>
          <p className="section-subheading mx-auto mt-3">
            Every HVAC and refrigeration project is completed with strict attention to safety,
            durability, energy efficiency, and long-term performance.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-7 hover:-translate-y-1 transition-all duration-300 border border-gray-100">
              <div className="service-icon bg-green-50">
                <Icon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-navy-900 text-lg mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Quality statement */}
        <div className="mt-14 bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-50" />
          <div className="relative z-10">
            <div className="text-5xl mb-4">⚙️</div>
            <h3 className="text-white font-bold text-2xl mb-4">Committed to Excellence in Every Project</h3>
            <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed mb-8">
              Our quality assurance process ensures that every HVAC and refrigeration project is completed
              with attention to safety, durability, energy efficiency, and long-term performance —
              because your comfort and business continuity depend on it.
            </p>
            <a href="#quote-calculator" className="btn-secondary">
              Start a Quality HVAC Project
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
