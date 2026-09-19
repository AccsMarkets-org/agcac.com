import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'Open';
  const refresh = searchParams.get('refresh') === '1';

  if (refresh) {
    await generateSuggestions();
  }

  const suggestions = await prisma.aISuggestion.findMany({
    where: { status },
    orderBy: [
      { riskLevel: 'desc' },
      { createdAt: 'desc' },
    ],
    take: 50,
  });

  return NextResponse.json({ suggestions });
}

async function generateSuggestions() {
  const now = new Date();

  // Check for unpaid invoices older than 30 days
  const overdueInvoices = await prisma.invoice.findMany({
    where: { status: 'Unpaid', dueDate: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    take: 10,
    select: { id: true, invoiceId: true, customerName: true, dueDate: true },
  });
  for (const inv of overdueInvoices) {
    const exists = await prisma.aISuggestion.findFirst({
      where: { type: 'UnpaidInvoice', relatedId: inv.id, status: 'Open' },
    });
    if (!exists) {
      await prisma.aISuggestion.create({
        data: {
          suggestionId: `SUG-${uuidv4().substring(0, 8).toUpperCase()}`,
          type: 'UnpaidInvoice',
          title: `Overdue invoice: ${inv.customerName}`,
          description: `Invoice ${inv.invoiceId} for ${inv.customerName} is overdue since ${inv.dueDate?.toLocaleDateString('en-GB') || 'N/A'}`,
          riskLevel: 'High',
          relatedId: inv.id,
          relatedType: 'Invoice',
          actionType: 'SendPaymentReminder',
          status: 'Open',
        },
      });
    }
  }

  // Accepted quotations not yet invoiced
  const acceptedQuotes = await prisma.quotation.findMany({
    where: { status: 'Accepted' },
    take: 10,
    select: { id: true, quoteId: true, customerName: true, createdAt: true },
  });
  for (const q of acceptedQuotes) {
    const linkedInvoice = await prisma.invoice.findFirst({ where: { quoteId: q.id } });
    if (!linkedInvoice) {
      const exists = await prisma.aISuggestion.findFirst({
        where: { type: 'AcceptedQuote', relatedId: q.id, status: 'Open' },
      });
      if (!exists) {
        await prisma.aISuggestion.create({
          data: {
            suggestionId: `SUG-${uuidv4().substring(0, 8).toUpperCase()}`,
            type: 'AcceptedQuote',
            title: `Accepted quote not yet invoiced: ${q.customerName}`,
            description: `Quotation ${q.quoteId} accepted by ${q.customerName} on ${q.createdAt.toLocaleDateString('en-GB')}. No invoice created yet.`,
            riskLevel: 'Medium',
            relatedId: q.id,
            relatedType: 'Quotation',
            actionType: 'CreateInvoice',
            status: 'Open',
          },
        });
      }
    }
  }

  // AMC contracts expiring within 30 days
  const expiringAMC = await prisma.aMCContract.findMany({
    where: {
      status: 'Active',
      endDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), gte: now },
    },
    take: 10,
    select: { id: true, amcId: true, customerName: true, endDate: true },
  });
  for (const amc of expiringAMC) {
    const exists = await prisma.aISuggestion.findFirst({
      where: { type: 'ExpiringAMC', relatedId: amc.id, status: 'Open' },
    });
    if (!exists) {
      await prisma.aISuggestion.create({
        data: {
          suggestionId: `SUG-${uuidv4().substring(0, 8).toUpperCase()}`,
          type: 'ExpiringAMC',
          title: `AMC contract expiring: ${amc.customerName}`,
          description: `AMC contract ${amc.amcId} for ${amc.customerName} expires on ${amc.endDate.toLocaleDateString('en-GB')}`,
          riskLevel: 'Medium',
          relatedId: amc.id,
          relatedType: 'AMCContract',
          actionType: 'RenewAMC',
          status: 'Open',
        },
      });
    }
  }

  // Documents needing review (pending for more than 1 hour)
  const pendingDocs = await prisma.aIDocument.findMany({
    where: {
      processingStatus: { in: ['Extracted', 'NeedsReview'] },
      reviewStatus: 'Pending',
      deletedAt: null,
      createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) },
    },
    take: 5,
    select: { id: true, docId: true, originalName: true },
  });
  for (const doc of pendingDocs) {
    const exists = await prisma.aISuggestion.findFirst({
      where: { type: 'NeedsReview', relatedId: doc.id, status: 'Open' },
    });
    if (!exists) {
      await prisma.aISuggestion.create({
        data: {
          suggestionId: `SUG-${uuidv4().substring(0, 8).toUpperCase()}`,
          type: 'NeedsReview',
          title: `Document waiting review: ${doc.originalName}`,
          description: `Document ${doc.docId} has been waiting for accountant review for more than 1 hour.`,
          riskLevel: 'Medium',
          relatedId: doc.id,
          relatedType: 'AIDocument',
          actionType: 'ReviewDocument',
          status: 'Open',
        },
      });
    }
  }
}
