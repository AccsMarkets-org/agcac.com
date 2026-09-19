import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

const DEFAULTS: Record<string, string> = {
  hr_email: 'hr@alghawasac.com',
  hr_whatsapp: '971506725808',
  default_status: 'New',
  max_upload_mb: '10',
  consent_text: 'By submitting this application, I agree that Al Ghawas A/C Refrigeration Contracting LLC may contact me by phone, WhatsApp, or email regarding my job application. I confirm the information provided is accurate.',
  careers_hero_title: 'Build Your Career with Al Ghawas A/C Refrigeration Contracting LLC',
  careers_hero_subtitle: 'Join a professional HVAC and mechanical contracting team serving residential, commercial, and industrial projects across Abu Dhabi and the UAE.',
  careers_seo_title: 'Careers & Jobs | Al Ghawas A/C Refrigeration Contracting LLC',
  careers_seo_desc: 'Join our HVAC team in Abu Dhabi. We are hiring AC technicians, duct fabricators, pipe fitters, supervisors, and more. Apply now.',
};

export async function GET(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await prisma.careerSetting.findMany();
  const settings: Record<string, string> = { ...DEFAULTS };
  rows.forEach(r => { settings[r.key] = r.value; });

  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updates = await Promise.all(
    Object.entries(body).map(([key, value]) =>
      prisma.careerSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );

  return NextResponse.json({ saved: updates.length });
}
