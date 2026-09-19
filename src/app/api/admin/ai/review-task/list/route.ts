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

  const where = status ? { status } : {};

  const [tasks, total] = await Promise.all([
    prisma.aIReviewTask.findMany({
      where,
      include: {
        document: {
          select: {
            id: true,
            docId: true,
            originalName: true,
            documentType: true,
            confidenceScore: true,
            processingStatus: true,
            extractedData: true,
            createdAt: true,
            warnings: { select: { type: true, severity: true, message: true } },
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.aIReviewTask.count({ where }),
  ]);

  const enriched = tasks.map(t => {
    const ed = t.document.extractedData ? JSON.parse(t.document.extractedData) : {};
    return {
      ...t,
      document: {
        ...t.document,
        invoiceNumber: ed.invoiceNumber || '',
        supplierName: ed.supplier?.name || '',
        totalAmount: ed.totals?.grandTotal || 0,
        vatAmount: ed.totals?.vatAmount || 0,
        extractedData: undefined, // don't send full JSON in list
      },
    };
  });

  return NextResponse.json({ tasks: enriched, total, page, limit, pages: Math.ceil(total / limit) });
}
