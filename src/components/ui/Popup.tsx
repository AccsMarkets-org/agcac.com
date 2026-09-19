'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, MessageCircle, Phone } from 'lucide-react';
import { captureUTMParams, fireLeadEvent } from '@/lib/tracking';

interface PopupState {
  timed: boolean;
  exit: boolean;
}

export default function Popup() {
  const [state, setState] = useState<PopupState>({ timed: false, exit: false });
  const [dismissed, setDismissed] = useState<PopupState>({ timed: false, exit: false });
  const [form, setForm] = useState({ name: '', phone: '', honeypot: '' });
  const [loading, setLoading] = useState(false);
  const [utmParams, setUtmParams] = useState({});

  useEffect(() => {
    setUtmParams(captureUTMParams());
    const shown = sessionStorage.getItem('popup_shown');
    if (shown) return;

    // Timed popup after 10 seconds
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, timed: true }));
      sessionStorage.setItem('popup_shown', '1');
    }, 10000);

    // Exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !sessionStorage.getItem('exit_popup_shown')) {
        setState((s) => ({ ...s, exit: true }));
        sessionStorage.setItem('exit_popup_shown', '1');
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const dismiss = useCallback((type: keyof PopupState) => {
    setState((s) => ({ ...s, [type]: false }));
    setDismissed((d) => ({ ...d, [type]: true }));
  }, []);

  const handleSubmit = async (e: React.FormEvent, source: string) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    if (form.honeypot) return;
    setLoading(true);
    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          service: 'AC Service Inquiry',
          location: 'Abu Dhabi',
          sourcePage: source,
          ...utmParams,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fireLeadEvent({ leadId: data.leadId, service: 'Popup Inquiry', source });
        window.open(data.whatsappURL, '_blank');
        dismiss(source.includes('exit') ? 'exit' : 'timed');
      }
    } catch {
      window.open('https://wa.me/971506725808', '_blank');
    } finally {
      setLoading(false);
    }
  };

  const activePopup = state.timed && !dismissed.timed ? 'timed'
    : state.exit && !dismissed.exit ? 'exit'
    : null;

  if (!activePopup) return null;

  return (
    <div className="popup-overlay animate-fade-in" onClick={() => dismiss(activePopup)}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => dismiss(activePopup)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          aria-label="Close popup"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">{activePopup === 'exit' ? '👋' : '❄️'}</div>
          <h3 className="text-navy-900 font-black text-2xl mb-2">
            {activePopup === 'exit'
              ? "Before You Leave..."
              : "Need AC Service in Abu Dhabi?"}
          </h3>
          <p className="text-gray-500 text-sm">
            {activePopup === 'exit'
              ? 'Request a free HVAC consultation. Our team responds within minutes.'
              : 'Get a free quote on WhatsApp. Fast response guaranteed.'}
          </p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, activePopup === 'exit' ? 'popup-exit' : 'popup-timed')} className="space-y-4">
          <input type="text" value={form.honeypot} onChange={(e) => setForm({ ...form, honeypot: e.target.value })} className="hidden" tabIndex={-1} />
          <div>
            <input
              className="form-input"
              placeholder="Your Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <input
              className="form-input"
              type="tel"
              placeholder="Phone / WhatsApp *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-whatsapp justify-center py-4 text-base"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><MessageCircle className="w-5 h-5" /> Get Free Quote on WhatsApp</>
            )}
          </button>
          <a
            href="tel:+971506725808"
            className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 hover:border-navy-700 hover:text-navy-900 py-3 rounded-xl font-semibold text-sm transition-all"
          >
            <Phone className="w-4 h-4" />
            Or Call: +971-50-672-5808
          </a>
        </form>

        <p className="text-gray-400 text-xs text-center mt-4">
          No spam. We&apos;ll only contact you about your HVAC inquiry.
        </p>
      </div>
    </div>
  );
}
