import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function nextCustomerId() {
  const last = await prisma.customer.findFirst({ orderBy: { customerId: 'desc' } });
  const num = last ? parseInt(last.customerId.replace('CUST-', '')) + 1 : 1;
  return `CUST-${String(num).padStart(4, '0')}`;
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
      { customerId: { contains: search } },
      { location: { contains: search } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { invoices: true, amcContracts: true } } },
  });

  return NextResponse.json(customers.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    lastService: c.lastService?.toISOString() ?? null,
    invoiceCount: c._count.invoices,
    amcCount: c._count.amcContracts,
  })));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const customerId = await nextCustomerId();

  const customer = await prisma.customer.create({
    data: {
      customerId,
      name: body.name,
      phone: body.phone,
      email: body.email ?? null,
      location: body.location ?? null,
      area: body.area ?? null,
      propertyType: body.propertyType ?? null,
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json({ ...customer, createdAt: customer.createdAt.toISOString(), updatedAt: customer.updatedAt.toISOString() });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const customer = await prisma.customer.update({
    where: { id: body.id },
    data: {
      name: body.name,
      phone: body.phone,
      email: body.email ?? null,
      location: body.location ?? null,
      area: body.area ?? null,
      propertyType: body.propertyType ?? null,
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json({ ...customer, createdAt: customer.createdAt.toISOString(), updatedAt: customer.updatedAt.toISOString() });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
