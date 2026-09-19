import { Check, MessageCircle, FileText, Star } from 'lucide-react';

const plans = [
  {
    name: 'Basic AMC',
    badge: null,
    price: 'Get Quote',
    description: 'Essential annual maintenance for small residential units.',
    color: 'from-gray-50 to-white',
    border: 'border-gray-200',
    titleColor: 'text-gray-700',
    features: [
      'Air filter cleaning & replacement',
      'General visual inspection',
      'Drain line check',
      'Basic troubleshooting support',
      '1 visit per unit per quarter',
      'Report after each visit',
    ],
    notIncluded: ['Priority emergency support', 'Performance optimization', 'Refrigerant top-up'],
    service: 'Basic AMC',
  },
  {
    name: 'Standard AMC',
    badge: 'Popular',
    price: 'Get Quote',
    description: 'Comprehensive maintenance for offices, apartments, and small buildings.',
    color: 'from-navy-900 to-navy-800',
    border: 'border-navy-700',
    titleColor: 'text-white',
    textColor: 'text-white',
    dark: true,
    features: [
      'Full preventive maintenance',
      'Indoor & outdoor unit inspection',
      'Filter cleaning & coil wash',
      'Drain line cleaning',
      'Electrical component check',
      'Refrigerant level check',
      'Priority support response',
      '2 visits per unit per year',
      'Maintenance reports',
    ],
    notIncluded: ['Emergency on-call 24/7'],
    service: 'Standard AMC',
  },
  {
    name: 'Premium AMC',
    badge: 'Best Value',
    price: 'Get Quote',
    description: 'All-inclusive premium maintenance for villas, offices, and commercial buildings.',
    color: 'from-brand-gold/10 to-yellow-50',
    border: 'border-brand-gold/30',
    titleColor: 'text-navy-900',
    features: [
      'Priority emergency support (24/7)',
      'Comprehensive inspection (all components)',
      'Full coil cleaning & chemical wash',
      'Performance optimization & tuning',
      'Refrigerant top-up if needed',
      'Electrical safety audit',
      'Detailed performance reports',
      'Quarterly visits included',
      'Dedicated technician assigned',
      'Spare parts discount',
    ],
    service: 'Premium AMC',
  },
];

export default function AMCSection() {
  return (
    <section id="amc" className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
            <Star className="w-3.5 h-3.5" />
            Annual Maintenance Contracts
          </div>
          <h2 className="section-heading">AMC Maintenance Plans</h2>
          <p className="section-subheading mx-auto mt-3">
            Protect your HVAC investment with a structured annual maintenance contract.
            Prevent breakdowns, extend equipment life, and ensure peak performance year-round.
          </p>
          <div className="divider-gold mx-auto mt-5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border-2 ${plan.border} bg-gradient-to-br ${plan.color} p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className={`text-xs font-bold px-4 py-1.5 rounded-full shadow-lg ${
                    plan.badge === 'Popular' ? 'bg-brand-red text-white' : 'bg-brand-gold text-navy-900'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <h3 className={`font-black text-2xl mb-1 ${plan.titleColor}`}>{plan.name}</h3>
              <p className={`text-sm mb-6 ${plan.dark ? 'text-white/60' : 'text-gray-500'}`}>{plan.description}</p>

              <div className="flex-1 space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.dark ? 'text-green-400' : 'text-green-500'}`} />
                    <span className={`text-sm ${plan.dark ? 'text-white/80' : 'text-gray-600'}`}>{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href={`https://wa.me/971506725808?text=${encodeURIComponent(`Hello Al Ghawas, I'm interested in the ${plan.name} plan. Please provide a quote.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-whatsapp justify-center py-3"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp for Quote
                </a>
                <a
                  href={`#quote-calculator`}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.dark
                      ? 'border-2 border-white/30 text-white hover:bg-white/10'
                      : 'border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Request Quote
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm mb-4">
            All AMC plans are customized to your property size and number of AC units.
            Contact us for a tailored annual maintenance proposal.
          </p>
          <a
            href="https://wa.me/971506725808?text=Hello%20Al%20Ghawas%2C%20I%20want%20an%20Annual%20Maintenance%20Contract%20quote%20for%20my%20property."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <MessageCircle className="w-5 h-5" />
            Get Custom AMC Quote
          </a>
        </div>
      </div>
    </section>
  );
}
