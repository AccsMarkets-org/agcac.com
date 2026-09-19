import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function nextVisitId() {
  const last = await prisma.siteVisit.findFirst({ orderBy: { visitId: 'desc' } });
  const num = last ? parseInt(last.visitId.replace('SV-', '')) + 1 : 1;
  return `SV-${String(num).padStart(4, '0')}`;
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status) where.status = status;
  if (search) where.OR = [
    { customerName: { contains: search } },
    { phone: { contains: search } },
    { visitId: { contains: search } },
    { location: { contains: search } },
    { service: { contains: search } },
  ];

  const visits = await prisma.siteVisit.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(visits.map(v => ({
    ...v,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    visitDate: v.visitDate?.toISOString() ?? null,
  })));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const visitId = await nextVisitId();

  const visit = await prisma.siteVisit.create({
    data: {
      visitId,
      customerName: body.customerName,
      phone: body.phone,
      location: body.location,
      mapsLink: body.mapsLink ?? null,
      service: body.service ?? null,
      visitDate: body.visitDate ? new Date(body.visitDate) : null,
      visitTime: body.visitTime ?? null,
      status: body.status ?? 'Scheduled',
      notes: body.notes ?? null,
      recommendation: body.recommendation ?? null,
      estimatedCost: body.estimatedCost ?? null,
      customerDecision: body.customerDecision ?? null,
    },
  });

  return NextResponse.json({
    ...visit,
    createdAt: visit.createdAt.toISOString(),
    updatedAt: visit.updatedAt.toISOString(),
    visitDate: visit.visitDate?.toISOString() ?? null,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const visit = await prisma.siteVisit.update({
    where: { id: body.id },
    data: {
      customerName: body.customerName,
      phone: body.phone,
      location: body.location,
      mapsLink: body.mapsLink ?? null,
      service: body.service ?? null,
      visitDate: body.visitDate ? new Date(body.visitDate) : null,
      visitTime: body.visitTime ?? null,
      status: body.status ?? 'Scheduled',
      notes: body.notes ?? null,
      recommendation: body.recommendation ?? null,
      estimatedCost: body.estimatedCost ?? null,
      customerDecision: body.customerDecision ?? null,
    },
  });

  return NextResponse.json({
    ...visit,
    createdAt: visit.createdAt.toISOString(),
    updatedAt: visit.updatedAt.toISOString(),
    visitDate: visit.visitDate?.toISOString() ?? null,
  });
}
