import { Phone, MessageCircle, FileText, Calendar } from 'lucide-react';

interface CTASectionProps {
  variant?: 'dark' | 'light' | 'red';
  title?: string;
  subtitle?: string;
}

export default function CTASection({
  variant = 'dark',
  title = 'Ready for Professional HVAC Service in Abu Dhabi?',
  subtitle = 'Get a free quote today. Our team responds within minutes.',
}: CTASectionProps) {
  const bgClass = variant === 'red'
    ? 'bg-brand-red'
    : variant === 'light'
    ? 'bg-gray-50 border-t border-gray-100'
    : 'bg-navy-900';

  const textClass = variant === 'light' ? 'text-navy-900' : 'text-white';
  const subClass = variant === 'light' ? 'text-gray-500' : 'text-white/60';

  return (
    <section className={`py-16 relative overflow-hidden ${bgClass}`}>
      {variant !== 'light' && <div className="absolute inset-0 bg-hero-pattern opacity-40" />}
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${textClass}`}>{title}</h2>
          <p className={`text-lg mb-10 ${subClass}`}>{subtitle}</p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#quote-calculator" className="btn-primary px-8 py-4 text-base">
              <FileText className="w-5 h-5" />
              Get Free HVAC Quote
            </a>
            <a
              href="https://wa.me/971506725808?text=Hello%20Al%20Ghawas%2C%20I%20need%20HVAC%20service.%20Please%20contact%20me."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp px-8 py-4 text-base"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Our Team
            </a>
            <a
              href="tel:+971506725808"
              className={`inline-flex items-center gap-2 border-2 font-semibold px-8 py-4 rounded-xl transition-all text-base ${
                variant === 'light'
                  ? 'border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white'
                  : 'border-white/30 text-white hover:bg-white/10'
              }`}
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
            <a
              href="#amc"
              className={`inline-flex items-center gap-2 border-2 font-semibold px-8 py-4 rounded-xl transition-all text-base ${
                variant === 'light'
                  ? 'border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-navy-900'
                  : 'border-brand-gold/50 text-brand-gold hover:border-brand-gold hover:bg-brand-gold/10'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Book Inspection
            </a>
          </div>

          <div className={`mt-10 flex flex-wrap justify-center gap-6 text-sm ${subClass}`}>
            {['✓ Free Quote', '✓ Fast Response', '✓ No Commitment', '✓ UAE Based Team', '✓ 20+ Years Experience'].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
