'use client';
import { useState } from 'react';
import type { ConsentState } from './CookieBanner';

interface Props {
  onSave: (consent: ConsentState) => void;
  onClose: () => void;
  initialConsent?: Partial<ConsentState>;
}

const CATEGORIES = [
  {
    key: 'essential' as keyof ConsentState,
    title: 'Essential Cookies',
    description: 'Required for the website to function properly. These cannot be disabled. They include session management, security, and form functionality.',
    always: true,
    examples: 'Session tokens, CSRF protection, form state',
  },
  {
    key: 'analytics' as keyof ConsentState,
    title: 'Analytics Cookies',
    description: 'Help us understand how visitors use our website. We use Google Analytics (GA4) and Google Tag Manager to measure page visits, traffic sources, and user behaviour.',
    always: false,
    examples: 'Google Analytics (G-XXXXXXXXXX), Google Tag Manager (GTM-XXXXXXX)',
  },
  {
    key: 'advertising' as keyof ConsentState,
    title: 'Advertising Cookies',
    description: 'Used to track visits from ads, measure campaign performance, and retarget visitors. Includes Google Ads and Meta (Facebook) Pixel.',
    always: false,
    examples: 'Google Ads (AW-XXXXXXXXX), Meta Pixel (META-PIXEL-ID)',
  },
  {
    key: 'functional' as keyof ConsentState,
    title: 'Functional Cookies',
    description: 'Enable enhanced functionality such as saving your preferences, chat widgets, or embedded third-party tools.',
    always: false,
    examples: 'Language preference, WhatsApp widget settings',
  },
];

export default function CookieSettingsModal({ onSave, onClose, initialConsent }: Props) {
  const [consent, setConsent] = useState<ConsentState>({
    essential: true,
    analytics: initialConsent?.analytics ?? false,
    advertising: initialConsent?.advertising ?? false,
    functional: initialConsent?.functional ?? false,
  });

  const toggle = (key: keyof ConsentState) => {
    if (key === 'essential') return;
    setConsent(c => ({ ...c, [key]: !c[key] }));
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Cookie Preferences</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-gray-600">
            Manage your cookie preferences. Essential cookies are always enabled as they are required for the site to function.
            Review our{' '}
            <a href="/cookie-policy" className="text-red-600 hover:underline">Cookie Policy</a>{' '}
            and{' '}
            <a href="/privacy-policy" className="text-red-600 hover:underline">Privacy Policy</a> for more details.
          </p>

          {CATEGORIES.map(cat => (
            <div key={cat.key} className={`rounded-xl border p-4 ${consent[cat.key] ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{cat.title}</span>
                    {cat.always && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Always On</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{cat.description}</p>
                  <p className="text-[10px] text-gray-400">e.g. {cat.examples}</p>
                </div>
                <button
                  onClick={() => toggle(cat.key)}
                  disabled={cat.always}
                  className={`w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 relative ${
                    consent[cat.key] ? 'bg-green-500' : 'bg-gray-300'
                  } ${cat.always ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-label={`Toggle ${cat.title}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${consent[cat.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
          <button
            onClick={() => onSave(consent)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            Save Preferences
          </button>
          <button
            onClick={() => { setConsent({ essential: true, analytics: true, advertising: true, functional: true }); onSave({ essential: true, analytics: true, advertising: true, functional: true }); }}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
