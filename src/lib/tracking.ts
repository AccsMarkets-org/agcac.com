'use client';

export interface UTMParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
}

export function captureUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const stored = sessionStorage.getItem('utm_params');

  const fresh: UTMParams = {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
    utmTerm: params.get('utm_term') || undefined,
    utmContent: params.get('utm_content') || undefined,
    gclid: params.get('gclid') || undefined,
    fbclid: params.get('fbclid') || undefined,
  };

  // Store fresh UTMs if we have any, else restore stored ones
  const hasNew = Object.values(fresh).some(Boolean);
  if (hasNew) {
    sessionStorage.setItem('utm_params', JSON.stringify(fresh));
    return fresh;
  }

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }

  return {};
}

export function fireEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  // Google Tag Manager dataLayer push
  if ((window as any).dataLayer) {
    (window as any).dataLayer.push({ event: eventName, ...params });
  }

  // Google Analytics 4
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }

  // Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq('track', 'Lead', params);
  }
}

export function fireLeadEvent(leadData: {
  leadId: string;
  service: string;
  source: string;
  value?: number;
}) {
  fireEvent('generate_lead', {
    lead_id: leadData.leadId,
    service: leadData.service,
    source: leadData.source,
    value: leadData.value || 0,
    currency: 'AED',
  });

  fireEvent('form_submit', {
    form_type: leadData.source,
    service: leadData.service,
  });
}

export function fireWhatsAppClick(source: string) {
  fireEvent('whatsapp_click', { source });
}

export function fireCallClick(source: string) {
  fireEvent('call_click', { source });
}
