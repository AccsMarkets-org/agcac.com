import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

async function nextPIRef(): Promise<string> {
  const last = await prisma.purchaseInvoice.findFirst({ orderBy: { createdAt: 'desc' } });
  if (!last) return 'PI-0001';
  const n = parseInt(last.invoiceRef.replace('PI-', '') || '0', 10);
  return `PI-${String(n + 1).padStart(4, '0')}`;
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const invoices = await prisma.purchaseInvoice.findMany({ include: { items: true }, orderBy: { invoiceDate: 'desc' } });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { items = [], ...data } = body;
    const ref = await nextPIRef();
    const inv = await prisma.purchaseInvoice.create({
      data: {
        invoiceRef: ref,
        supplierName: data.supplierName || '',
        supplierTRN: data.supplierTRN || null,
        invoiceDate: new Date(data.invoiceDate || Date.now()),
        invoiceNumber: data.invoiceNumber || null,
        netAmount: parseFloat(data.netAmount) || 0,
        vatAmount: parseFloat(data.vatAmount) || 0,
        totalAmount: parseFloat(data.totalAmount) || 0,
        vatRate: parseFloat(data.vatRate) || 5,
        documentId: data.documentId || null,
        approvalStatus: data.approvalStatus || 'Pending',
        category: data.category || 'General',
        notes: data.notes || null,
        fileUrl: data.fileUrl || null,
        status: data.status || 'Pending',
        items: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: items.map((it: any) => ({
            description: String(it.description || ''),
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            vatRate: Number(it.vatRate) || 5,
            vatAmount: Number(it.vatAmount) || 0,
            total: Number(it.total) || 0,
          })),
        },
      },
      include: { items: true },
    });
    return NextResponse.json(inv, { status: 201 });
  } catch (err) {
    console.error('Purchase invoice create error:', err);
    return NextResponse.json({ error: `Failed to save invoice: ${String(err)}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
  const body = await req.json();
  const { id, items = [], ...data } = body;
  await prisma.purchaseInvoiceItem.deleteMany({ where: { purchaseId: id } });
  const inv = await prisma.purchaseInvoice.update({
    where: { id },
    data: {
      supplierName: data.supplierName || '',
      supplierTRN: data.supplierTRN || null,
      invoiceDate: new Date(data.invoiceDate || Date.now()),
      invoiceNumber: data.invoiceNumber || null,
      netAmount: parseFloat(data.netAmount) || 0,
      vatAmount: parseFloat(data.vatAmount) || 0,
      totalAmount: parseFloat(data.totalAmount) || 0,
      category: data.category || 'General',
      notes: data.notes || null,
      fileUrl: data.fileUrl || null,
      status: data.status || 'Pending',
      items: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        create: items.map((it: any) => ({
          description: String(it.description || ''),
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          vatRate: Number(it.vatRate) || 5,
          vatAmount: Number(it.vatAmount) || 0,
          total: Number(it.total) || 0,
        })),
      },
    },
    include: { items: true },
  });
  return NextResponse.json(inv);
  } catch (err) {
    return NextResponse.json({ error: `Failed to update invoice: ${String(err)}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.purchaseInvoice.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
