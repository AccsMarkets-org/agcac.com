import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function nextQuoteId() {
  const last = await prisma.quotation.findFirst({ orderBy: { quoteId: 'desc' } });
  const num = last ? parseInt(last.quoteId.replace('QT-', '')) + 1 : 1;
  return `QT-${String(num).padStart(4, '0')}`;
}

function calcTotals(items: { quantity: number; unitPrice: number }[], discount = 0, vat = 5) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discountAmt = subtotal * (discount / 100);
  const net = subtotal - discountAmt;
  const vatAmt = net * (vat / 100);
  return { subtotal, net, vatAmt, total: net + vatAmt };
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
    { quoteId: { contains: search } },
    { service: { contains: search } },
  ];

  const quotations = await prisma.quotation.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return NextResponse.json(quotations.map(q => {
    const { total, vatAmt } = calcTotals(q.items, q.discount, q.vat);
    return {
      ...q,
      total,
      vatAmt,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
      quoteDate: q.quoteDate.toISOString(),
      validUntil: q.validUntil?.toISOString() ?? null,
    };
  }));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const quoteId = await nextQuoteId();
  const items = (body.items ?? []) as { description: string; quantity: number; unitPrice: number }[];

  const quotation = await prisma.quotation.create({
    data: {
      quoteId,
      customerName: body.customerName,
      phone: body.phone,
      email: body.email ?? null,
      address: body.address ?? null,
      service: body.service,
      discount: parseFloat(body.discount ?? 0),
      vat: parseFloat(body.vat ?? 5),
      notes: body.notes ?? null,
      terms: body.terms ?? null,
      status: body.status ?? 'Draft',
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      items: {
        create: items.map(i => ({
          description: i.description,
          quantity: parseFloat(String(i.quantity)),
          unitPrice: parseFloat(String(i.unitPrice)),
          total: parseFloat(String(i.quantity)) * parseFloat(String(i.unitPrice)),
        })),
      },
    },
    include: { items: true },
  });

  const { total, vatAmt } = calcTotals(quotation.items, quotation.discount, quotation.vat);
  return NextResponse.json({
    ...quotation, total, vatAmt,
    createdAt: quotation.createdAt.toISOString(),
    updatedAt: quotation.updatedAt.toISOString(),
    quoteDate: quotation.quoteDate.toISOString(),
    validUntil: quotation.validUntil?.toISOString() ?? null,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const items = (body.items ?? []) as { description: string; quantity: number; unitPrice: number }[];

  await prisma.quotationItem.deleteMany({ where: { quotationId: body.id } });

  const quotation = await prisma.quotation.update({
    where: { id: body.id },
    data: {
      customerName: body.customerName,
      phone: body.phone,
      email: body.email ?? null,
      address: body.address ?? null,
      service: body.service,
      discount: parseFloat(body.discount ?? 0),
      vat: parseFloat(body.vat ?? 5),
      notes: body.notes ?? null,
      terms: body.terms ?? null,
      status: body.status ?? 'Draft',
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      items: {
        create: items.map(i => ({
          description: i.description,
          quantity: parseFloat(String(i.quantity)),
          unitPrice: parseFloat(String(i.unitPrice)),
          total: parseFloat(String(i.quantity)) * parseFloat(String(i.unitPrice)),
        })),
      },
    },
    include: { items: true },
  });

  const { total, vatAmt } = calcTotals(quotation.items, quotation.discount, quotation.vat);
  return NextResponse.json({
    ...quotation, total, vatAmt,
    createdAt: quotation.createdAt.toISOString(),
    updatedAt: quotation.updatedAt.toISOString(),
    quoteDate: quotation.quoteDate.toISOString(),
    validUntil: quotation.validUntil?.toISOString() ?? null,
  });
}
