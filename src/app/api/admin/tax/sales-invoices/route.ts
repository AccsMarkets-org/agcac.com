import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

async function nextSIRef(): Promise<string> {
  const last = await prisma.taxSalesInvoice.findFirst({ orderBy: { createdAt: 'desc' } });
  if (!last) return 'SAL-0001';
  const n = parseInt(last.invoiceRef.replace('SAL-', '') || '0', 10);
  return `SAL-${String(n + 1).padStart(4, '0')}`;
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const invoices = await prisma.taxSalesInvoice.findMany({
    where: { deletedAt: null },
    include: { items: true },
    orderBy: { invoiceDate: 'desc' },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { items = [], ...data } = body;
  const ref = await nextSIRef();

  const inv = await prisma.taxSalesInvoice.create({
    data: {
      invoiceRef: ref,
      invoiceNumber: data.invoiceNumber || ref,
      invoiceDate: new Date(data.invoiceDate || Date.now()),
      customerName: data.customerName || 'Unknown Customer',
      customerTRN: data.customerTRN || null,
      netAmount: parseFloat(data.netAmount) || 0,
      vatRate: parseFloat(data.vatRate) || 5,
      vatAmount: parseFloat(data.vatAmount) || 0,
      totalAmount: parseFloat(data.totalAmount) || 0,
      documentId: data.documentId || null,
      approvalStatus: data.approvalStatus || 'Pending',
      notes: data.notes || null,
      status: data.status || 'Draft',
      createdBy: auth.email,
      items: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: items.map((it: any) => ({
          description: String(it.description || ''),
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          netAmount: Number(it.netAmount) || 0,
          vatRate: Number(it.vatRate) || 5,
          vatAmount: Number(it.vatAmount) || 0,
          total: Number(it.total) || 0,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(inv, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, items = [], ...data } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.taxSalesInvoiceItem.deleteMany({ where: { invoiceId: id } });
  const inv = await prisma.taxSalesInvoice.update({
    where: { id },
    data: {
      invoiceNumber: data.invoiceNumber,
      invoiceDate: new Date(data.invoiceDate || Date.now()),
      customerName: data.customerName || 'Unknown Customer',
      customerTRN: data.customerTRN || null,
      netAmount: parseFloat(data.netAmount) || 0,
      vatRate: parseFloat(data.vatRate) || 5,
      vatAmount: parseFloat(data.vatAmount) || 0,
      totalAmount: parseFloat(data.totalAmount) || 0,
      notes: data.notes || null,
      status: data.status,
      approvalStatus: data.approvalStatus,
      items: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: items.map((it: any) => ({
          description: String(it.description || ''),
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          netAmount: Number(it.netAmount) || 0,
          vatRate: Number(it.vatRate) || 5,
          vatAmount: Number(it.vatAmount) || 0,
          total: Number(it.total) || 0,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(inv);
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.taxSalesInvoice.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
