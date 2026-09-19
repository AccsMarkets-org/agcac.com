export type LeadStatus = 'New' | 'Contacted' | 'Quoted' | 'Won' | 'Lost';

export type LeadSource =
  | 'hero-form'
  | 'quote-calculator'
  | 'btu-calculator'
  | 'emergency-form'
  | 'contact-form'
  | 'amc-section'
  | 'popup-timed'
  | 'popup-exit'
  | 'popup-mobile'
  | 'services-section'
  | 'footer-form'
  | 'unknown';

export interface Lead {
  id: string;
  createdAt: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  service: string;
  propertyType?: string;
  rooms?: string;
  area?: string;
  acUnits?: string;
  urgency?: string;
  existingSystem?: string;
  message?: string;
  sourcePage: LeadSource | string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  deviceType?: string;
  status: LeadStatus;
  whatsappMessage?: string;
  ipAddress?: string;
}

export interface LeadFormData {
  name: string;
  phone: string;
  email?: string;
  location: string;
  service: string;
  propertyType?: string;
  rooms?: string;
  area?: string;
  acUnits?: string;
  urgency?: string;
  existingSystem?: string;
  message?: string;
  sourcePage: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  honeypot?: string;
}
