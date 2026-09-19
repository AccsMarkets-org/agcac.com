import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTaxToken } from '@/lib/tax-auth';
import { logTaxAction } from '@/lib/tax-audit';

export async function GET(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const settings = await prisma.taxSetting.findMany({ orderBy: { category: 'asc' } });
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { settings } = await req.json() as { settings: { key: string; value: string }[] };

  const results = await Promise.all(
    settings.map(s =>
      prisma.taxSetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value, category: 'company', description: s.key },
      })
    )
  );

  await logTaxAction({
    userId: auth.userId, userEmail: auth.email, userRole: auth.role,
    action: 'UPDATE_SETTINGS', module: 'Settings',
    description: `Updated ${settings.length} tax settings`,
  });

  return NextResponse.json(results);
}
