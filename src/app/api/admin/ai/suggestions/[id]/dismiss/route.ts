import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const s = await prisma.aISuggestion.findFirst({ where: { OR: [{ id: params.id }, { suggestionId: params.id }] } });
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.aISuggestion.update({
    where: { id: s.id },
    data: { status: 'Dismissed', dismissedBy: auth.email, dismissedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
