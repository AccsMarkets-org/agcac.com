import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      invoice: { select: { invoiceId: true, customerName: true, service: true, status: true } },
    },
  });

  return NextResponse.json(payments.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    invoiceRef: p.invoice.invoiceId,
    customerName: p.invoice.customerName,
    service: p.invoice.service,
    invoiceStatus: p.invoice.status,
  })));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.invoiceId || !body.amount) return NextResponse.json({ error: 'Missing invoiceId or amount' }, { status: 400 });

  const payment = await prisma.payment.create({
    data: {
      invoiceId: body.invoiceId,
      amount: parseFloat(body.amount),
      method: body.method ?? 'Cash',
      reference: body.reference ?? null,
      note: body.note ?? null,
    },
    include: {
      invoice: { select: { invoiceId: true, customerName: true, service: true, status: true } },
    },
  });

  // Auto-update invoice status based on payments
  const invoice = await prisma.invoice.findUnique({
    where: { id: body.invoiceId },
    include: { items: true, payments: true },
  });
  if (invoice) {
    const total = invoice.items.reduce((s, i) => s + i.total, 0) * (1 + invoice.vat / 100) * (1 - invoice.discount / 100);
    const paid = invoice.payments.reduce((s, p) => s + p.amount, 0);
    const newStatus = paid >= total ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';
    await prisma.invoice.update({ where: { id: body.invoiceId }, data: { status: newStatus } });
  }

  return NextResponse.json({
    ...payment,
    createdAt: payment.createdAt.toISOString(),
    invoiceRef: payment.invoice.invoiceId,
    customerName: payment.invoice.customerName,
    service: payment.invoice.service,
    invoiceStatus: payment.invoice.status,
  });
}
