'use client';
import { useState, useEffect } from 'react';
import CookieSettingsModal from './CookieSettingsModal';

export interface ConsentState {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
}

const CONSENT_KEY = 'ag_cookie_consent';
const CONSENT_VERSION = '1.0';

export function getStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed.consent;
  } catch { return null; }
}

export function saveConsent(consent: ConsentState) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ consent, version: CONSENT_VERSION, timestamp: new Date().toISOString() }));
  // Persist to server
  const anonymousId = localStorage.getItem('ag_anon_id') || crypto.randomUUID();
  localStorage.setItem('ag_anon_id', anonymousId);
  fetch('/api/legal/cookie-consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ anonymousId, ...consent, userAgent: navigator.userAgent }),
  }).catch(() => {});
}

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) setShow(true);
  }, []);

  if (!show) return null;

  const acceptAll = () => {
    saveConsent({ essential: true, analytics: true, advertising: true, functional: true });
    setShow(false);
  };

  const rejectNonEssential = () => {
    saveConsent({ essential: true, analytics: false, advertising: false, functional: false });
    setShow(false);
  };

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-[9999] pb-safe">
        {/* Mobile bottom bar pushes this up */}
        <div className="bg-gray-900 border-t border-gray-700 shadow-2xl">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm mb-1">We use cookies on our website</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Al Ghawas A/C uses essential, analytics, and advertising cookies to improve your experience and understand how visitors use our site.
                By continuing, you agree to our{' '}
                <a href="/cookie-policy" className="text-amber-400 hover:text-amber-300 underline">Cookie Policy</a>{' '}
                and{' '}
                <a href="/privacy-policy" className="text-amber-400 hover:text-amber-300 underline">Privacy Policy</a>.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setShowSettings(true)}
                className="text-xs text-gray-400 hover:text-white underline transition-colors"
              >
                Customize
              </button>
              <button
                onClick={rejectNonEssential}
                className="text-xs border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 px-3 py-2 rounded-lg transition-colors"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={acceptAll}
                className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <CookieSettingsModal
          onSave={(consent) => { saveConsent(consent); setShow(false); setShowSettings(false); }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
