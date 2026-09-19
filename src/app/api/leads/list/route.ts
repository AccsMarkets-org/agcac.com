import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search   = searchParams.get('search')?.toLowerCase() || '';
  const status   = searchParams.get('status') || '';
  const service  = searchParams.get('service') || '';
  const source   = searchParams.get('source') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo   = searchParams.get('dateTo') || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    deletedAt: null,
    ...(status && { status }),
    ...(service && { service: { contains: service } }),
    ...(source && { sourcePage: source }),
    ...(dateFrom || dateTo ? {
      createdAt: {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) }),
      },
    } : {}),
    ...(search ? {
      OR: [
        { name:     { contains: search } },
        { phone:    { contains: search } },
        { email:    { contains: search } },
        { leadId:   { contains: search } },
        { location: { contains: search } },
        { service:  { contains: search } },
      ],
    } : {}),
  };

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { assignedTo: { select: { name: true } } },
  });

  const [total, newCount, contacted, quoted, won, lost] = await Promise.all([
    prisma.lead.count({ where: { deletedAt: null } }),
    prisma.lead.count({ where: { deletedAt: null, status: 'New' } }),
    prisma.lead.count({ where: { deletedAt: null, status: 'Contacted' } }),
    prisma.lead.count({ where: { deletedAt: null, status: 'Quoted' } }),
    prisma.lead.count({ where: { deletedAt: null, status: 'Won' } }),
    prisma.lead.count({ where: { deletedAt: null, status: 'Lost' } }),
  ]);

  const serialized = leads.map((l) => ({
    id: l.id,
    leadId: l.leadId,
    date: l.createdAt.toLocaleDateString('en-GB', { timeZone: 'Asia/Dubai' }),
    time: l.createdAt.toLocaleTimeString('en-GB', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit' }),
    name: l.name,
    phone: l.phone,
    email: l.email,
    location: l.location,
    service: l.service,
    propertyType: l.propertyType,
    urgency: l.urgency,
    status: l.status,
    sourcePage: l.sourcePage,
    deviceType: l.deviceType,
    utmSource: l.utmSource,
    utmCampaign: l.utmCampaign,
    message: l.message,
    createdAt: l.createdAt.toISOString(),
    assignedTo: l.assignedTo?.name ?? null,
  }));

  return NextResponse.json({
    leads: serialized,
    stats: { total, new: newCount, contacted, quoted, won, lost },
    total: leads.length,
  });
}
