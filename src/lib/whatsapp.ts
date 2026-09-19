import type { Lead } from '@/types/lead';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971506725808';

export function buildWhatsAppMessage(lead: Lead): string {
  const lines = [
    `Hello Al Ghawas, I need HVAC service.`,
    ``,
    `📋 Lead ID: ${lead.id}`,
    `👤 Name: ${lead.name}`,
    `📞 Phone: ${lead.phone}`,
    `📍 Location: ${lead.location}`,
    `🔧 Service: ${lead.service}`,
  ];

  if (lead.propertyType) lines.push(`🏠 Property Type: ${lead.propertyType}`);
  if (lead.rooms) lines.push(`🛏️ Rooms: ${lead.rooms}`);
  if (lead.area) lines.push(`📐 Area: ${lead.area} sq.ft`);
  if (lead.acUnits) lines.push(`❄️ AC Units: ${lead.acUnits}`);
  if (lead.urgency) lines.push(`⚡ Urgency: ${lead.urgency}`);
  if (lead.existingSystem) lines.push(`⚙️ Existing System: ${lead.existingSystem}`);
  if (lead.message) lines.push(`💬 Message: ${lead.message}`);

  lines.push(``, `Please contact me with a quote. Thank you.`);

  return lines.join('\n');
}

export function buildWhatsAppURL(lead: Lead): string {
  const message = buildWhatsAppMessage(lead);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

export function buildQuickWhatsAppURL(name: string, phone: string, service: string, location: string): string {
  const message = [
    `Hello Al Ghawas, I need HVAC service.`,
    ``,
    `👤 Name: ${name}`,
    `📞 Phone: ${phone}`,
    `📍 Location: ${location}`,
    `🔧 Service: ${service}`,
    ``,
    `Please contact me. Thank you.`,
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppBaseURL(): string {
  return `https://wa.me/${WHATSAPP_NUMBER}`;
}
