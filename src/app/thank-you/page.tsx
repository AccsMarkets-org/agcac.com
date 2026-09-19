'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle, Phone, MessageCircle, ArrowLeft, Zap } from 'lucide-react';
import { fireLeadEvent } from '@/lib/tracking';
import { useEffect } from 'react';

function ThankYouContent() {
  const params = useSearchParams();
  const leadId = params.get('id') || 'AGC-XXXX';
  const name = params.get('name') || 'Valued Customer';
  const isEmergency = params.get('emergency') === '1';

  useEffect(() => {
    fireLeadEvent({ leadId, service: 'Thank You Page', source: 'thank-you' });
    // GA4 conversion event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        send_to: process.env.NEXT_PUBLIC_GADS_ID,
        value: 1.0,
        currency: 'AED',
        transaction_id: leadId,
      });
    }
    // Meta Pixel Lead event
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', { value: 1.0, currency: 'AED' });
    }
  }, [leadId]);

  const waMessage = encodeURIComponent(
    `Hello Al Ghawas, I submitted a quote request.\n\nLead ID: ${leadId}\nName: ${name}\n\nLooking forward to hearing from you.`
  );

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="mb-6 relative inline-flex">
          <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-green-400/20 animate-ping" />
        </div>

        {isEmergency && (
          <div className="inline-flex items-center gap-2 bg-brand-red text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Zap className="w-3.5 h-3.5" />
            EMERGENCY REQUEST RECEIVED
          </div>
        )}

        <h1 className="text-white font-black text-3xl md:text-4xl mb-3">
          Thank You, {name.split(' ')[0]}!
        </h1>
        <p className="text-white/70 text-lg mb-8">
          {isEmergency
            ? 'Your emergency request has been received. Our team will contact you immediately.'
            : 'Your HVAC service request has been received. Our team will contact you shortly.'}
        </p>

        {/* Lead ID card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-8">
          <p className="text-white/50 text-xs mb-1">Your Reference Number</p>
          <p className="text-brand-gold font-black text-3xl">{leadId}</p>
          <p className="text-white/40 text-xs mt-1">Save this for reference</p>
        </div>

        {/* What's next */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left">
          <h3 className="text-white font-bold text-sm mb-3">What happens next:</h3>
          <div className="space-y-2">
            {[
              { n: 1, text: 'Our team reviews your request immediately' },
              { n: 2, text: 'A team member will call or WhatsApp you' },
              { n: 3, text: isEmergency ? 'Emergency technician dispatched' : 'We schedule a site visit or provide a quote' },
              { n: 4, text: 'Project confirmed and works begin' },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold font-bold text-xs shrink-0">
                  {n}
                </div>
                <span className="text-white/70 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expected response */}
        <p className="text-green-400 font-semibold text-sm mb-8">
          ⚡ Expected response time: {isEmergency ? 'Within 30 minutes' : 'Within 1-2 hours during business hours'}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <a
            href={`https://wa.me/971506725808?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn-whatsapp justify-center py-4 text-base"
          >
            <MessageCircle className="w-5 h-5" />
            Open WhatsApp
          </a>
          <a
            href="tel:+971506725808"
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-4 rounded-xl transition-all text-base"
          >
            <Phone className="w-5 h-5" />
            Call Us Now
          </a>
        </div>

        <a href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </a>

        {/* Google Ads conversion placeholder */}
        {/* Meta Pixel fires via useEffect above */}
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
