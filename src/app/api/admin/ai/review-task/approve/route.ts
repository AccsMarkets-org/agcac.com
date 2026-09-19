import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

const TAX_ROLES = ['SuperAdmin', 'Admin', 'Accountant', 'TaxManager'];

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!TAX_ROLES.includes(auth.role)) {
    return NextResponse.json({ error: 'Only Accountant, Tax Manager, or Admin can approve documents' }, { status: 403 });
  }

  const body = await request.json() as {
    taskId: string;
    reviewerNotes?: string;
    vatTreatment?: string;
    taxPeriodId?: string;
    createTaxRecord?: boolean;
    correctedData?: Record<string, unknown>;
  };

  const { taskId, reviewerNotes, vatTreatment, createTaxRecord = true, correctedData } = body;
  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });

  const task = await prisma.aIReviewTask.findFirst({
    where: { OR: [{ id: taskId }, { taskId }] },
    include: { document: { include: { warnings: true } } },
  });
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  if (task.status === 'Approved' || task.status === 'Posted') {
    return NextResponse.json({ error: 'Task already approved' }, { status: 409 });
  }

  const extractedData = task.document.extractedData
    ? { ...JSON.parse(task.document.extractedData), ...(correctedData || {}) }
    : correctedData || {};

  const docType = extractedData.documentType || task.document.documentType || 'Unknown';
  const treatment = vatTreatment || extractedData.vatTreatment || 'Standard';
  const netAmount = extractedData.totals?.subtotal || 0;
  const vatAmount = extractedData.totals?.vatAmount || 0;
  const totalAmount = extractedData.totals?.grandTotal || 0;

  const created: string[] = [];

  // Create tax record based on document type
  if (createTaxRecord && (docType === 'PurchaseInvoice' || docType === 'SalesInvoice')) {
    try {
      if (docType === 'PurchaseInvoice') {
        const ref = `PUR-AI-${uuidv4().substring(0, 8).toUpperCase()}`;
        await prisma.purchaseInvoice.create({
          data: {
            invoiceRef: ref,
            supplierName: extractedData.supplier?.name || 'Unknown',
            supplierTRN: extractedData.supplier?.trn || undefined,
            supplierAddress: extractedData.supplier?.address || undefined,
            invoiceDate: extractedData.invoiceDate ? new Date(extractedData.invoiceDate) : new Date(),
            invoiceNumber: extractedData.invoiceNumber || undefined,
            netAmount,
            vatAmount,
            totalAmount,
            vatRate: 5,
            vatTreatment: treatment,
            recoverableVAT: treatment === 'Standard' ? vatAmount : 0,
            nonRecoverableVAT: treatment === 'NonRecoverable' ? vatAmount : 0,
            category: extractedData.accountingCategory || 'General',
            approvalStatus: 'Approved',
            approvedBy: auth.email,
            approvedAt: new Date(),
            documentId: task.document.id,
            notes: reviewerNotes || undefined,
            status: 'Active',
          },
        });
        created.push(`Purchase invoice ${ref}`);
      } else if (docType === 'SalesInvoice') {
        const ref = `SAL-AI-${uuidv4().substring(0, 8).toUpperCase()}`;
        await prisma.taxSalesInvoice.create({
          data: {
            invoiceRef: ref,
            createdBy: auth.email,
            invoiceNumber: extractedData.invoiceNumber || ref,
            invoiceDate: extractedData.invoiceDate ? new Date(extractedData.invoiceDate) : new Date(),
            customerName: extractedData.customer?.name || 'Unknown',
            customerTRN: extractedData.customer?.trn || undefined,
            customerAddress: extractedData.customer?.address || undefined,
            netAmount,
            vatRate: 5,
            vatAmount,
            totalAmount,
            vatTreatment: treatment,
            approvalStatus: 'Approved',
            approvedBy: auth.email,
            approvedAt: new Date(),
            documentId: task.document.id,
            notes: reviewerNotes || undefined,
            status: 'Active',
          },
        });
        created.push(`Sales invoice ${ref}`);
      }
    } catch (e) {
      console.error('Tax record creation error:', e);
    }
  }

  // Update task + document
  await prisma.aIReviewTask.update({
    where: { id: task.id },
    data: {
      status: 'Approved',
      reviewerNotes: reviewerNotes || undefined,
      resolvedAt: new Date(),
      resolvedBy: auth.email,
      actionTaken: `Approved. Created: ${created.join(', ') || 'No records created'}`,
      postingDetails: JSON.stringify({ created, vatTreatment: treatment }),
      extractionEdits: correctedData ? JSON.stringify(correctedData) : undefined,
    },
  });

  await prisma.aIDocument.update({
    where: { id: task.document.id },
    data: {
      processingStatus: 'Approved',
      reviewStatus: 'Approved',
      approvedBy: auth.email,
      approvedAt: new Date(),
      taxEntryCreated: created.length > 0,
      extractedData: JSON.stringify(extractedData),
    },
  });

  // Resolve open suggestions for this doc
  await prisma.aISuggestion.updateMany({
    where: { relatedId: task.document.id, status: 'Open' },
    data: { status: 'Resolved', acceptedAt: new Date(), acceptedBy: auth.email },
  });

  await prisma.aIAuditLog.create({
    data: {
      userId: auth.userId,
      userEmail: auth.email,
      userRole: auth.role,
      action: 'DocumentApproved',
      module: 'AI',
      recordId: task.document.id,
      recordType: 'AIDocument',
      details: `Approved by ${auth.email}. Records created: ${created.join(', ') || 'none'}. VAT treatment: ${treatment}`,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Document approved. ${created.length > 0 ? `Created: ${created.join(', ')}` : 'No tax records created (manual entry required).'}`,
    created,
  });
}
