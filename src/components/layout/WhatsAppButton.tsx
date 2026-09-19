'use client';
import { MessageCircle } from 'lucide-react';
import { fireWhatsAppClick } from '@/lib/tracking';

const WA_URL = 'https://wa.me/971506725808?text=Hello%20Al%20Ghawas%2C%20I%20need%20HVAC%20service.';

export default function WhatsAppButton() {
  return (
    <div className="whatsapp-float hidden md:block">
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => fireWhatsAppClick('floating-button')}
        className="relative flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="WhatsApp Chat"
      >
        <div className="pulse-ring" />
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
    </div>
  );
}
