import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const leads = await prisma.lead.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: 'desc' },
    select: { id: true, leadId: true, name: true, phone: true, service: true, status: true, deletedAt: true },
  });
  return NextResponse.json(leads.map(l => ({ ...l, deletedAt: l.deletedAt!.toISOString() })));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, action } = await request.json();
  if (!id || !action) return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });

  if (action === 'restore') {
    await prisma.lead.update({ where: { id }, data: { deletedAt: null } });
    return NextResponse.json({ success: true });
  }

  if (action === 'delete') {
    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
