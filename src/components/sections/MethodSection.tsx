const steps = [
  { n: 1, title: 'Customer Inquiry Received', desc: 'We receive your request via phone, WhatsApp, or online form and acknowledge within minutes.' },
  { n: 2, title: 'Requirement Review', desc: 'Our technical team reviews your project requirements, scope, and initial information.' },
  { n: 3, title: 'Site Inspection / Consultation', desc: 'Our engineer visits your site to assess the space, existing systems, and specific needs.' },
  { n: 4, title: 'Technical Recommendation', desc: 'We prepare a detailed technical recommendation and system design suited to your project.' },
  { n: 5, title: 'Quotation Submission', desc: 'A clear, itemized quotation is submitted for your review and approval.' },
  { n: 6, title: 'Approval & Scheduling', desc: 'Once approved, we schedule the work with minimum disruption to your operations.' },
  { n: 7, title: 'Installation / Maintenance Works', desc: 'Our certified team carries out the work safely, professionally, and on schedule.' },
  { n: 8, title: 'Testing & Quality Inspection', desc: 'All systems are tested and inspected to ensure correct operation and performance targets.' },
  { n: 9, title: 'Handover', desc: 'Project is formally handed over with all documentation, warranties, and as-built drawings.' },
  { n: 10, title: 'After-Service Support', desc: 'We remain available for support, maintenance, and any post-completion requirements.' },
];

const ductSteps = [
  'Drawing review & approval',
  'Material tagging & QC check',
  'Sheet metal cutting (plasma/manual)',
  'GI sheet fabrication & forming',
  'Grooved profiling & flanging',
  'Assembly & sealing',
  'Installation & hanging',
  'Testing, balancing & inspection',
];

export default function MethodSection() {
  return (
    <section id="method" className="section-padding bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="container-custom relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            Our Process
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">How We Work</h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            A structured, professional process from first contact to project handover and beyond.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Project Process */}
          <div>
            <h3 className="text-brand-gold font-bold text-sm uppercase tracking-wider mb-8">Project Process</h3>
            <div className="space-y-0">
              {steps.map((step, idx) => (
                <div key={step.n} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-brand-red flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-glow-red">
                      {step.n}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="w-0.5 bg-white/10 flex-1 my-1" style={{ minHeight: '28px' }} />
                    )}
                  </div>
                  <div className="pb-6">
                    <h4 className="text-white font-semibold text-sm mb-1">{step.title}</h4>
                    <p className="text-white/50 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duct fabrication process */}
          <div>
            <h3 className="text-brand-gold font-bold text-sm uppercase tracking-wider mb-8">Duct Fabrication Process</h3>
            <div className="space-y-3 mb-10">
              {ductSteps.map((step, idx) => (
                <div key={step} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 hover:bg-white/10 transition-colors">
                  <span className="w-7 h-7 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-white/80 text-sm">{step}</span>
                </div>
              ))}
            </div>

            {/* Equipment we use */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h4 className="text-white font-bold mb-4">Equipment & Standards</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'GI Sheet (Galvanized Iron)',
                  'Plasma Cutting Software',
                  'Duct Fabrication Machines',
                  'TDC / TDF Flanging',
                  'SMACNA Standards',
                  'ASHRAE Guidelines',
                  'UAE Civil Defence Codes',
                  'ISO-compliant materials',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-white/60 text-xs">
                    <span className="text-brand-gold">›</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <a href="#quote-calculator" className="btn-primary w-full justify-center py-4">
                Start Your HVAC Project
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
