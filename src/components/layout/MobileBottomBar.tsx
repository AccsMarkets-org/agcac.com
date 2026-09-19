'use client';
import { Phone, MessageCircle, FileText } from 'lucide-react';
import { fireCallClick, fireWhatsAppClick } from '@/lib/tracking';

const PHONE = '+971506725808';
const WA_URL = 'https://wa.me/971506725808?text=Hello%20Al%20Ghawas%2C%20I%20need%20HVAC%20service.';

export default function MobileBottomBar() {
  return (
    <div className="mobile-bottom-bar fixed bottom-0 left-0 right-0 z-50 bg-navy-900 border-t border-white/10 flex md:hidden">
      <a
        href={`tel:${PHONE}`}
        onClick={() => fireCallClick('mobile-bottom-bar')}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-white hover:bg-white/10 transition-colors"
      >
        <Phone className="w-5 h-5 text-brand-gold" />
        <span className="text-xs font-medium">Call</span>
      </a>
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => fireWhatsAppClick('mobile-bottom-bar')}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 bg-green-500 text-white hover:bg-green-600 transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-xs font-medium">WhatsApp</span>
      </a>
      <a
        href="#quote-calculator"
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-3 bg-brand-red text-white hover:bg-red-700 transition-colors"
      >
        <FileText className="w-5 h-5" />
        <span className="text-xs font-medium">Free Quote</span>
      </a>
    </div>
  );
}
