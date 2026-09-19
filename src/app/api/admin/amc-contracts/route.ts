import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function nextAmcId() {
  const last = await prisma.aMCContract.findFirst({ orderBy: { amcId: 'desc' } });
  const num = last ? parseInt(last.amcId.replace('AMC-', '')) + 1 : 1;
  return `AMC-${String(num).padStart(4, '0')}`;
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
    { amcId: { contains: search } },
    { location: { contains: search } },
  ];

  const contracts = await prisma.aMCContract.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(contracts.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    startDate: c.startDate.toISOString(),
    endDate: c.endDate.toISOString(),
  })));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const amcId = await nextAmcId();

  const contract = await prisma.aMCContract.create({
    data: {
      amcId,
      customerName: body.customerName,
      phone: body.phone,
      location: body.location,
      propertyType: body.propertyType ?? null,
      plan: body.plan ?? 'Standard',
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      numberOfVisits: parseInt(body.numberOfVisits ?? 4),
      visitFrequency: body.visitFrequency ?? 'Quarterly',
      equipment: body.equipment ?? null,
      contractValue: body.contractValue ? parseFloat(body.contractValue) : null,
      paymentStatus: body.paymentStatus ?? 'Pending',
      notes: body.notes ?? null,
      status: body.status ?? 'Active',
    },
  });

  return NextResponse.json({
    ...contract,
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString(),
    startDate: contract.startDate.toISOString(),
    endDate: contract.endDate.toISOString(),
  });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const contract = await prisma.aMCContract.update({
    where: { id: body.id },
    data: {
      customerName: body.customerName,
      phone: body.phone,
      location: body.location,
      propertyType: body.propertyType ?? null,
      plan: body.plan ?? 'Standard',
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      numberOfVisits: parseInt(body.numberOfVisits ?? 4),
      visitFrequency: body.visitFrequency ?? 'Quarterly',
      equipment: body.equipment ?? null,
      contractValue: body.contractValue ? parseFloat(body.contractValue) : null,
      paymentStatus: body.paymentStatus ?? 'Pending',
      status: body.status ?? 'Active',
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json({
    ...contract,
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString(),
    startDate: contract.startDate.toISOString(),
    endDate: contract.endDate.toISOString(),
  });
}
