import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.processingStatus = status;

  const [docs, total] = await Promise.all([
    prisma.aIDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        warnings: { select: { type: true, severity: true, message: true } },
        reviewTasks: { select: { status: true, priority: true }, take: 1, orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.aIDocument.count({ where }),
  ]);

  const enriched = docs.map(d => {
    const ed = d.extractedData ? JSON.parse(d.extractedData) : {};
    return {
      ...d,
      ocrRawText: undefined, // don't send full OCR text in list
      extractedData: undefined,
      validationData: undefined,
      matchingData: undefined,
      invoiceNumber: ed.invoiceNumber || '',
      supplierName: ed.supplier?.name || '',
      customerName: ed.customer?.name || '',
      totalAmount: ed.totals?.grandTotal || 0,
      vatAmount: ed.totals?.vatAmount || 0,
      invoiceDate: ed.invoiceDate || '',
    };
  });

  return NextResponse.json({ documents: enriched, total, page, pages: Math.ceil(total / limit) });
}
