import { CheckCircle, Award, Users, Building2, Zap, Shield, Star, Wrench } from 'lucide-react';

const whyUs = [
  { icon: Award, title: '20+ Years Experience', desc: 'Established in 2005, serving Abu Dhabi for over two decades.' },
  { icon: Zap, title: 'Fast Response', desc: 'Quick mobilization for urgent HVAC requirements across Abu Dhabi.' },
  { icon: Shield, title: 'Quality Assured', desc: 'Rigorous quality checks and performance testing on every project.' },
  { icon: Users, title: 'Certified HVAC Team', desc: 'Trained and certified technicians with hands-on UAE market experience.' },
  { icon: Star, title: 'Energy-Efficient Solutions', desc: 'We recommend and install energy-efficient HVAC systems to reduce bills.' },
  { icon: Building2, title: 'Residential & Commercial', desc: 'Serving villas, apartments, offices, factories, schools, and hotels.' },
  { icon: Wrench, title: 'Customized Solutions', desc: 'Tailored HVAC designs based on your specific project requirements.' },
  { icon: CheckCircle, title: 'Safety-Focused', desc: 'Full compliance with UAE safety codes on every installation project.' },
];

export default function AboutSection() {
  return (
    <section id="about" className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Image + Stats */}
          <div>
            {/* Main image placeholder */}
            <div className="relative rounded-3xl overflow-hidden bg-navy-900 aspect-[4/3] mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🏗️</div>
                  <p className="text-white/60 text-sm">HVAC Installation<br />Abu Dhabi</p>
                </div>
              </div>
              {/* Badge */}
              <div className="absolute top-5 left-5 bg-brand-red text-white font-bold px-4 py-2 rounded-xl shadow-lg">
                Since 2005
              </div>
              {/* Bottom overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-950/80 to-transparent p-5">
                <p className="text-white font-bold">Al Ghawas A/C Refrigeration Contracting LLC</p>
                <p className="text-white/60 text-sm">Mohamed Bin Zayed City, Abu Dhabi, UAE</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: '20+', label: 'Years in UAE' },
                { value: '500+', label: 'Projects Done' },
                { value: '50+', label: 'Team Members' },
                { value: '100%', label: 'Client Focus' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                  <div className="text-brand-red font-black text-2xl">{value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-navy-900/5 border border-navy-900/10 text-navy-900 rounded-full px-4 py-1.5 text-xs font-semibold mb-5">
              About Our Company
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-5 leading-tight">
              Abu Dhabi&apos;s Trusted HVAC<br />
              & Refrigeration Partner
            </h2>
            <div className="divider-gold mb-6" />

            <p className="text-gray-600 leading-relaxed mb-5">
              <strong>Al Ghawas A/C Refrigeration Contracting LLC</strong> is a trusted HVAC and refrigeration contracting company based in Abu Dhabi.
              Since 2005, the company has served residential, commercial, and industrial clients with reliable climate control solutions —
              from simple AC maintenance to complex chilled water systems, VRF installations, and complete mechanical works.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              With a team of experienced HVAC engineers and technicians, we deliver professional service across
              Abu Dhabi&apos;s demanding climate conditions. Our projects span private villas, luxury hotels, government buildings,
              factories, schools, and large commercial developments.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {whyUs.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-navy-900/3 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-brand-red/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-brand-red" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy-900 text-sm">{title}</div>
                    <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#quote-calculator" className="btn-primary">Get Free Quote</a>
              <a href="#contact" className="btn-outline !border-navy-700 !text-navy-900 hover:!bg-navy-900 hover:!text-white">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
