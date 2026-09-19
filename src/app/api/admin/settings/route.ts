import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await prisma.settings.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  // Support both array format { settings: [{key, value}] } and object format { key: value }
  const pairs: { key: string; value: string }[] = Array.isArray(body.settings)
    ? body.settings
    : Object.entries(body as Record<string, string>).map(([key, value]) => ({ key, value }));

  await Promise.all(
    pairs.map(({ key, value }) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );

  return NextResponse.json({ success: true });
}
