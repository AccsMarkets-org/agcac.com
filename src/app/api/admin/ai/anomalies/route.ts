import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const refresh = searchParams.get('refresh') === '1';

  if (refresh) await detectAnomalies();

  const anomalies = await prisma.aIAnomaly.findMany({
    where: status ? { status } : {},
    orderBy: [{ riskLevel: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  });

  return NextResponse.json({ anomalies });
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as { id: string; status: string };
  const anomaly = await prisma.aIAnomaly.findFirst({
    where: { OR: [{ id: body.id }, { anomalyId: body.id }] },
  });
  if (!anomaly) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.aIAnomaly.update({
    where: { id: anomaly.id },
    data: {
      status: body.status,
      resolvedBy: ['Resolved', 'Dismissed'].includes(body.status) ? auth.email : undefined,
      resolvedAt: ['Resolved', 'Dismissed'].includes(body.status) ? new Date() : undefined,
    },
  });

  return NextResponse.json({ success: true });
}

async function detectAnomalies() {
  // Check for purchase invoices without TRN
  const missingTRN = await prisma.purchaseInvoice.findMany({
    where: { OR: [{ supplierTRN: null }, { supplierTRN: '' }], deletedAt: null },
    take: 20,
    select: { id: true, invoiceRef: true, supplierName: true },
  });
  for (const inv of missingTRN) {
    const exists = await prisma.aIAnomaly.findFirst({
      where: { type: 'MissingTRN', relatedId: inv.id, status: { in: ['Open', 'UnderReview'] } },
    });
    if (!exists) {
      await prisma.aIAnomaly.create({
        data: {
          anomalyId: `ANO-${uuidv4().substring(0, 8).toUpperCase()}`,
          type: 'MissingTRN',
          title: `Supplier TRN missing: ${inv.supplierName}`,
          description: `Purchase invoice ${inv.invoiceRef} from ${inv.supplierName} has no TRN. Input VAT cannot be claimed.`,
          riskLevel: 'High',
          relatedId: inv.id,
          relatedType: 'PurchaseInvoice',
          status: 'Open',
        },
      });
    }
  }

  // Check for VAT mismatch in purchase invoices
  const vatMismatch = await prisma.purchaseInvoice.findMany({
    where: { deletedAt: null, netAmount: { gt: 0 }, vatAmount: { gt: 0 } },
    take: 50,
    select: { id: true, invoiceRef: true, supplierName: true, netAmount: true, vatAmount: true, vatRate: true },
  });
  for (const inv of vatMismatch) {
    const expectedVAT = parseFloat((inv.netAmount * (inv.vatRate / 100)).toFixed(2));
    const diff = Math.abs(inv.vatAmount - expectedVAT);
    if (diff > 0.50 && diff / inv.netAmount > 0.01) {
      const exists = await prisma.aIAnomaly.findFirst({
        where: { type: 'VATMismatch', relatedId: inv.id, status: { in: ['Open', 'UnderReview'] } },
      });
      if (!exists) {
        await prisma.aIAnomaly.create({
          data: {
            anomalyId: `ANO-${uuidv4().substring(0, 8).toUpperCase()}`,
            type: 'VATMismatch',
            title: `VAT mismatch in invoice: ${inv.invoiceRef}`,
            description: `Expected VAT: ${expectedVAT} AED (${inv.vatRate}% of ${inv.netAmount}). Found: ${inv.vatAmount} AED. Difference: ${diff.toFixed(2)} AED.`,
            riskLevel: 'High',
            relatedId: inv.id,
            relatedType: 'PurchaseInvoice',
            data: JSON.stringify({ expected: expectedVAT, found: inv.vatAmount, diff }),
            status: 'Open',
          },
        });
      }
    }
  }

  // Large invoices (> AED 50,000) needing review
  const largeInvoices = await prisma.purchaseInvoice.findMany({
    where: { totalAmount: { gt: 50000 }, approvalStatus: 'Pending', deletedAt: null },
    take: 10,
    select: { id: true, invoiceRef: true, supplierName: true, totalAmount: true },
  });
  for (const inv of largeInvoices) {
    const exists = await prisma.aIAnomaly.findFirst({
      where: { type: 'LargeInvoice', relatedId: inv.id, status: { in: ['Open', 'UnderReview'] } },
    });
    if (!exists) {
      await prisma.aIAnomaly.create({
        data: {
          anomalyId: `ANO-${uuidv4().substring(0, 8).toUpperCase()}`,
          type: 'LargeInvoice',
          title: `Large invoice pending approval: ${inv.invoiceRef}`,
          description: `Invoice ${inv.invoiceRef} from ${inv.supplierName} for AED ${inv.totalAmount.toLocaleString()} is pending approval. Amounts > AED 50,000 require Super Admin approval.`,
          riskLevel: 'Medium',
          relatedId: inv.id,
          relatedType: 'PurchaseInvoice',
          status: 'Open',
        },
      });
    }
  }
}
