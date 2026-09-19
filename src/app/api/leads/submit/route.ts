import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildWhatsAppURL, buildWhatsAppMessage } from '@/lib/whatsapp';

function getDeviceType(ua: string): string {
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function getBrowser(ua: string): string {
  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/edge/i.test(ua)) return 'Edge';
  return 'Other';
}

async function generateLeadId(): Promise<string> {
  const count = await prisma.lead.count();
  return `AGC-${String(count + 1).padStart(4, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, string>;

    // Honeypot spam check
    if (body.honeypot) {
      return NextResponse.json({ success: true });
    }

    const { name, phone, location, service } = body;
    if (!name?.trim() || !phone?.trim() || !service?.trim()) {
      return NextResponse.json({ success: false, error: 'Name, phone, and service are required.' }, { status: 400 });
    }

    const phoneClean = phone.replace(/[\s\-\(\)]/g, '');
    if (phoneClean.length < 9) {
      return NextResponse.json({ success: false, error: 'Please enter a valid phone number.' }, { status: 400 });
    }

    const ua = request.headers.get('user-agent') || '';
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : 'Unknown';
    const referer = request.headers.get('referer') || '';

    const leadId = await generateLeadId();

    const lead = await prisma.lead.create({
      data: {
        leadId,
        name: name.trim(),
        phone: phoneClean,
        whatsapp: body.whatsapp?.trim() || null,
        email: body.email?.trim() || null,
        location: location?.trim() || null,
        area: body.area?.trim() || null,
        service: service.trim(),
        propertyType: body.propertyType || null,
        projectType: body.projectType || null,
        urgency: body.urgency || 'Normal',
        message: body.message?.trim() || null,
        numberOfRooms: body.rooms || body.numberOfRooms || null,
        approximateArea: body.approximateArea || null,
        numberOfACUnits: body.acUnits || body.numberOfACUnits || null,
        existingSystem: body.existingSystem || null,
        budgetRange: body.budgetRange || null,
        sourcePage: body.sourcePage || null,
        formName: body.formName || null,
        ctaClicked: body.ctaClicked || null,
        leadSource: body.leadSource || (body.utmSource ? 'Paid' : 'Organic'),
        utmSource: body.utmSource || null,
        utmMedium: body.utmMedium || null,
        utmCampaign: body.utmCampaign || null,
        utmTerm: body.utmTerm || null,
        utmContent: body.utmContent || null,
        gclid: body.gclid || null,
        fbclid: body.fbclid || null,
        deviceType: getDeviceType(ua),
        browser: getBrowser(ua),
        referrer: referer || null,
        landingPage: body.landingPage || body.sourcePage || null,
        ipAddress,
        status: 'New',
        priority: body.urgency === 'Emergency' ? 'High' : 'Normal',
      },
    });

    // Build WhatsApp redirect
    const legacyLead = {
      id: lead.leadId,
      name: lead.name,
      phone: lead.phone,
      service: lead.service,
      location: lead.location || '',
      propertyType: lead.propertyType || '',
      urgency: lead.urgency,
      message: lead.message || '',
      utmSource: lead.utmSource || '',
      utmCampaign: lead.utmCampaign || '',
      deviceType: lead.deviceType || '',
    };
    const whatsappMessage = buildWhatsAppMessage(legacyLead as Parameters<typeof buildWhatsAppMessage>[0]);
    const whatsappURL = buildWhatsAppURL(legacyLead as Parameters<typeof buildWhatsAppURL>[0]);

    // Store WA message
    await prisma.lead.update({
      where: { id: lead.id },
      data: { whatsappMessage },
    });

    await prisma.activityLog.create({
      data: { leadId: lead.id, action: 'Lead Created', detail: `New lead from ${lead.sourcePage || 'website'}` },
    });

    return NextResponse.json({
      success: true,
      leadId: lead.leadId,
      whatsappURL,
      message: 'Your request has been received. Redirecting to WhatsApp...',
    });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error. Please try again or call us directly.' },
      { status: 500 }
    );
  }
}
