import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTaxToken } from '@/lib/tax-auth';
import { parseInvoiceText } from '@/lib/invoice-ocr';
import { logTaxAction } from '@/lib/tax-audit';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let documentId: string;
  try {
    const body = await req.json() as { documentId?: string };
    documentId = body.documentId ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!documentId) return NextResponse.json({ error: 'documentId required' }, { status: 400 });

  const doc = await prisma.taxDocument.findUnique({ where: { id: documentId } });
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  // Support both old (uploads/tax/) and new (public/uploads/tax/) paths
  let resolvedPath = doc.filePath;
  if (!existsSync(resolvedPath)) {
    // Try the new public path
    const newPath = path.join(
      process.cwd(), 'public', 'uploads', 'tax', path.basename(doc.filePath)
    );
    if (existsSync(newPath)) {
      resolvedPath = newPath;
    } else {
      return NextResponse.json(
        { error: `File not found on disk: ${doc.originalName}. Please re-upload.` },
        { status: 404 }
      );
    }
  }

  let rawText = '';
  let confidence = 0;
  let ocrProvider = 'none';
  let ocrError: string | null = null;

  const isPDF =
    doc.fileType === 'application/pdf' ||
    doc.fileName.toLowerCase().endsWith('.pdf');

  if (isPDF) {
    // ── PDF: use pdf-parse (v1 API) ──────────────────────────────────────────
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      // Use lib path directly — require('pdf-parse') triggers its test runner in Next.js
      const pdfParse = require('pdf-parse/lib/pdf-parse');
      const buffer = await readFile(resolvedPath);
      const data = await pdfParse(buffer);
      rawText = (data.text || '').trim();
      ocrProvider = 'pdf-parse';

      if (!rawText) {
        ocrError =
          'This PDF appears to be a scanned image (no embedded text). ' +
          'For scanned PDFs, please export a page as a JPG/PNG and upload that image instead.';
        confidence = 0;
      } else {
        confidence = rawText.length > 200 ? 88 : rawText.length > 50 ? 70 : 45;
      }
    } catch (e) {
      ocrError = `PDF text extraction failed: ${String(e)}`;
      ocrProvider = 'pdf-parse';
    }
  } else {
    // ── Image: use Tesseract.js ───────────────────────────────────────────────
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Tesseract = require('tesseract.js');
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: () => {},
      });
      const result = await worker.recognize(resolvedPath);
      await worker.terminate();

      rawText = (result.data.text || '').trim();
      confidence = result.data.confidence || 0;
      ocrProvider = 'tesseract';

      if (!rawText || rawText.length < 10) {
        ocrError =
          'Tesseract returned very little text. The image may be low-resolution or ' +
          'poorly lit. Try a higher-quality scan.';
      }
    } catch (e) {
      ocrError = `Image OCR failed: ${String(e)}. Ensure the image is a clear JPG, PNG, or WebP.`;
      ocrProvider = 'tesseract';
    }
  }

  // Parse even partial text — always run the parser
  const extracted = parseInvoiceText(rawText);

  // Save OCR result to database
  const ocrRecord = await prisma.oCRResult.upsert({
    where: { documentId },
    update: {
      rawText: rawText.substring(0, 50000),
      confidence,
      invoiceNumber: extracted.invoiceNumber ?? null,
      invoiceDate: extracted.invoiceDate ?? null,
      dateOfSupply: extracted.dateOfSupply ?? null,
      supplierName: extracted.supplierName ?? null,
      supplierTRN: extracted.supplierTRN ?? null,
      customerName: extracted.customerName ?? null,
      customerTRN: extracted.customerTRN ?? null,
      subtotal: extracted.subtotal ?? null,
      vatRate: extracted.vatRate ?? null,
      vatAmount: extracted.vatAmount ?? null,
      totalAmount: extracted.totalAmount ?? null,
      currency: extracted.currency ?? 'AED',
      paymentTerms: extracted.paymentTerms ?? null,
      poNumber: extracted.poNumber ?? null,
      status: ocrError ? 'Error' : 'Pending',
    },
    create: {
      documentId,
      rawText: rawText.substring(0, 50000),
      confidence,
      invoiceNumber: extracted.invoiceNumber ?? null,
      invoiceDate: extracted.invoiceDate ?? null,
      dateOfSupply: extracted.dateOfSupply ?? null,
      supplierName: extracted.supplierName ?? null,
      supplierTRN: extracted.supplierTRN ?? null,
      customerName: extracted.customerName ?? null,
      customerTRN: extracted.customerTRN ?? null,
      subtotal: extracted.subtotal ?? null,
      vatRate: extracted.vatRate ?? null,
      vatAmount: extracted.vatAmount ?? null,
      totalAmount: extracted.totalAmount ?? null,
      currency: extracted.currency ?? 'AED',
      paymentTerms: extracted.paymentTerms ?? null,
      poNumber: extracted.poNumber ?? null,
      status: ocrError ? 'Error' : 'Pending',
    },
  });

  await prisma.taxDocument.update({
    where: { id: documentId },
    data: {
      ocrProcessed: !ocrError,
      ocrResultId: ocrRecord.id,
    },
  });

  await logTaxAction({
    userId: auth.userId,
    userEmail: auth.email,
    userRole: auth.role,
    action: 'OCR_SCAN',
    module: 'Upload',
    recordId: documentId,
    description: ocrError
      ? `OCR failed for ${doc.originalName}: ${ocrError.substring(0, 200)}`
      : `OCR completed for ${doc.originalName} via ${ocrProvider} (confidence: ${confidence.toFixed(0)}%, text: ${rawText.length} chars)`,
  });

  // Always return 200 so the client can show partial results
  return NextResponse.json({
    success: !ocrError,
    ocrError: ocrError ?? null,
    ocrProvider,
    confidence,
    rawText: rawText.substring(0, 2000),
    ocrResultId: ocrRecord.id,
    // Extracted invoice fields
    invoiceNumber: extracted.invoiceNumber ?? null,
    invoiceDate: extracted.invoiceDate ?? null,
    dateOfSupply: extracted.dateOfSupply ?? null,
    supplierName: extracted.supplierName ?? null,
    supplierTRN: extracted.supplierTRN ?? null,
    customerName: extracted.customerName ?? null,
    customerTRN: extracted.customerTRN ?? null,
    subtotal: extracted.subtotal ?? null,
    vatRate: extracted.vatRate ?? null,
    vatAmount: extracted.vatAmount ?? null,
    totalAmount: extracted.totalAmount ?? null,
    currency: extracted.currency ?? 'AED',
    paymentTerms: extracted.paymentTerms ?? null,
    poNumber: extracted.poNumber ?? null,
    bankDetails: extracted.bankDetails ?? null,
  });
}
