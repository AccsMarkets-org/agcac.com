import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await prisma.taxSetting.findMany({ where: { category: 'AI' } });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  // Merge with env vars (env takes precedence, but don't expose keys)
  return NextResponse.json({
    settings: map,
    env: {
      AI_PROVIDER: process.env.AI_PROVIDER || 'tesseract',
      OCR_PROVIDER: process.env.OCR_PROVIDER || 'tesseract',
      MAX_UPLOAD_SIZE_MB: process.env.MAX_UPLOAD_SIZE_MB || '20',
      AI_AUTOMATION_ENABLED: process.env.AI_AUTOMATION_ENABLED || 'true',
      GOOGLE_VISION_CONFIGURED: !!process.env.GOOGLE_VISION_API_KEY,
      AWS_TEXTRACT_CONFIGURED: !!process.env.AWS_TEXTRACT_KEY,
      AZURE_CONFIGURED: !!process.env.AZURE_FORM_RECOGNIZER_KEY,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ALLOWED = ['SuperAdmin', 'Admin'];
  if (!ALLOWED.includes(auth.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json() as Record<string, string>;

  for (const [key, value] of Object.entries(body)) {
    const existing = await prisma.taxSetting.findFirst({ where: { key, category: 'AI' } });
    if (existing) {
      await prisma.taxSetting.update({ where: { id: existing.id }, data: { value } });
    } else {
      await prisma.taxSetting.create({ data: { key, value, category: 'AI', description: `AI setting: ${key}` } });
    }
  }

  return NextResponse.json({ success: true });
}
