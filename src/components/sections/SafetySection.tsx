import { Shield, HardHat, Zap, AlertTriangle, BookOpen, Eye, Wrench, CheckCircle } from 'lucide-react';

const safetyItems = [
  { icon: HardHat, title: 'Personal Protective Equipment', desc: 'All technicians are equipped with full PPE including helmets, safety boots, gloves, and reflective vests on every site.' },
  { icon: Shield, title: 'UAE Safety Code Compliance', desc: 'Full compliance with Abu Dhabi Civil Defence regulations, OSHAD safety framework, and local municipality requirements.' },
  { icon: Eye, title: 'Site Safety Protocols', desc: 'Pre-work safety briefings, site risk assessments, and ongoing safety monitoring throughout all project activities.' },
  { icon: Zap, title: 'Electrical Safety', desc: 'All electrical works follow UAE standards with proper isolation, testing, and commissioning before energization.' },
  { icon: Wrench, title: 'Tool & Equipment Safety', desc: 'Regular inspection and certification of all tools, lifting equipment, and machinery used on site.' },
  { icon: AlertTriangle, title: 'Preventive Safety Measures', desc: 'Proactive identification and mitigation of hazards before work commences on any site or project.' },
  { icon: BookOpen, title: 'Continuous Safety Training', desc: 'Regular safety training sessions keep our team updated on the latest UAE safety regulations and best practices.' },
  { icon: CheckCircle, title: 'Safety Audits', desc: 'Periodic internal and external safety audits to maintain the highest safety standards across all operations.' },
];

export default function SafetySection() {
  return (
    <section id="safety" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image placeholder */}
          <div>
            <div className="bg-navy-900 rounded-3xl p-10 relative overflow-hidden h-96 flex items-center justify-center">
              <div className="absolute inset-0 bg-hero-pattern opacity-50" />
              <div className="relative z-10 text-center">
                <div className="text-7xl mb-4">🦺</div>
                <h3 className="text-white font-bold text-2xl mb-2">Safety First</h3>
                <p className="text-white/60">Our team follows strict UAE safety protocols on every project</p>
              </div>
              {/* Safety badges */}
              <div className="absolute bottom-5 left-5 right-5 flex justify-around">
                {['PPE', 'ISO', 'OSHAD', 'UAE Code'].map((b) => (
                  <div key={b} className="bg-white/10 border border-white/20 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                    {b}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-6 bg-brand-red/5 border border-brand-red/20 rounded-2xl">
              <h4 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-red" />
                Our Safety Commitment
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Safety is not a box-ticking exercise at Al Ghawas. We believe every worker and client
                deserves a safe working environment. Our safety management system covers planning,
                execution, monitoring, and continuous improvement — protecting our people and your property.
              </p>
            </div>
          </div>

          {/* Right: Safety items */}
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-red/5 border border-brand-red/20 text-brand-red rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
              <Shield className="w-3.5 h-3.5" />
              Safety Policy
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-3">
              Safety is Our<br />
              Top Priority
            </h2>
            <div className="divider-gold mb-8" />

            <div className="space-y-4">
              {safetyItems.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-brand-red/20 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand-red" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-navy-900 text-sm mb-1">{title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
