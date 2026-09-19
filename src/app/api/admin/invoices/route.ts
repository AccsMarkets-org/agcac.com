import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function nextInvoiceId() {
  const last = await prisma.invoice.findFirst({ orderBy: { invoiceId: 'desc' } });
  const num = last ? parseInt(last.invoiceId.replace('INV-', '')) + 1 : 1;
  return `INV-${String(num).padStart(4, '0')}`;
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
    { invoiceId: { contains: search } },
    { service: { contains: search } },
  ];

  const invoices = await prisma.invoice.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: { items: true, payments: true },
  });

  return NextResponse.json(invoices.map(inv => {
    const { total, vatAmt } = calcTotals(inv.items, inv.discount, inv.vat);
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    return {
      ...inv,
      total,
      vatAmt,
      paid,
      balance: total - paid,
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
      invoiceDate: inv.invoiceDate.toISOString(),
      dueDate: inv.dueDate?.toISOString() ?? null,
    };
  }));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const invoiceId = await nextInvoiceId();
  const items = (body.items ?? []) as { description: string; quantity: number; unitPrice: number }[];

  const invoice = await prisma.invoice.create({
    data: {
      invoiceId,
      customerName: body.customerName ?? '',
      phone: body.phone ?? '',
      address: body.address ?? null,
      service: body.service ?? '',
      discount: parseFloat(body.discount ?? 0),
      vat: parseFloat(body.vat ?? 5),
      notes: body.notes ?? null,
      status: body.status ?? 'Unpaid',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      items: {
        create: items.map(i => ({
          description: i.description,
          quantity: parseFloat(String(i.quantity)),
          unitPrice: parseFloat(String(i.unitPrice)),
          total: parseFloat(String(i.quantity)) * parseFloat(String(i.unitPrice)),
        })),
      },
    },
    include: { items: true, payments: true },
  });

  const { total, vatAmt } = calcTotals(invoice.items, invoice.discount, invoice.vat);
  const paid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  return NextResponse.json({
    ...invoice, total, vatAmt, paid, balance: total - paid,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    invoiceDate: invoice.invoiceDate.toISOString(),
    dueDate: invoice.dueDate?.toISOString() ?? null,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const items = (body.items ?? []) as { description: string; quantity: number; unitPrice: number }[];

  await prisma.invoiceItem.deleteMany({ where: { invoiceId: body.id } });

  const invoice = await prisma.invoice.update({
    where: { id: body.id },
    data: {
      customerName: body.customerName ?? '',
      phone: body.phone ?? '',
      address: body.address ?? null,
      service: body.service ?? '',
      discount: parseFloat(body.discount ?? 0),
      vat: parseFloat(body.vat ?? 5),
      notes: body.notes ?? null,
      status: body.status ?? 'Unpaid',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      items: {
        create: items.map(i => ({
          description: i.description,
          quantity: parseFloat(String(i.quantity)),
          unitPrice: parseFloat(String(i.unitPrice)),
          total: parseFloat(String(i.quantity)) * parseFloat(String(i.unitPrice)),
        })),
      },
    },
    include: { items: true, payments: true },
  });

  const { total, vatAmt } = calcTotals(invoice.items, invoice.discount, invoice.vat);
  const paid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  return NextResponse.json({
    ...invoice, total, vatAmt, paid, balance: total - paid,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    invoiceDate: invoice.invoiceDate.toISOString(),
    dueDate: invoice.dueDate?.toISOString() ?? null,
  });
}
