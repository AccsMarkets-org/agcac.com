import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveUploadedFile, extractTextFromBuffer, computeFileHash } from '@/lib/ai-ocr';
import { extractInvoiceData, detectDuplicates } from '@/lib/ai-engine';
import { v4 as uuidv4 } from 'uuid';

const MAX_SIZE_MB = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '20');
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff'];

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allowedRolesLC = ['superadmin', 'admin', 'accountant', 'taxmanager', 'tax manager', 'manager'];
  if (!allowedRolesLC.includes(auth.role.toLowerCase())) {
    return NextResponse.json({ error: 'Insufficient permissions for AI document upload' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const notes = formData.get('notes') as string || '';
    const uploadSource = formData.get('source') as string || 'Manual';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type not allowed: ${file.type}. Supported: PDF, JPG, PNG, WebP` }, { status: 400 });
    }

    // Validate size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      return NextResponse.json({ error: `File too large: ${sizeMB.toFixed(1)}MB. Max: ${MAX_SIZE_MB}MB` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = computeFileHash(buffer);

    // Save file to disk
    const saved = await saveUploadedFile(buffer, file.name);

    // Create AIDocument record
    const docId = `DOC-${Date.now().toString(36).toUpperCase()}`;
    const doc = await prisma.aIDocument.create({
      data: {
        docId,
        fileName: saved.fileName,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: saved.publicUrl,
        fileHash,
        uploadSource,
        uploadedById: auth.userId,
        uploadedByEmail: auth.email,
        processingStatus: 'Queued',
        notes,
      },
    });

    // Audit log
    await prisma.aIAuditLog.create({
      data: {
        userId: auth.userId,
        userEmail: auth.email,
        userRole: auth.role,
        action: 'DocumentUploaded',
        module: 'AI',
        recordId: doc.id,
        recordType: 'AIDocument',
        details: `File: ${file.name}, Size: ${sizeMB.toFixed(2)}MB, Type: ${file.type}`,
      },
    });

    // Run OCR immediately (async-style: mark as processing, then process)
    // For immediate response, run OCR inline
    const docRecord = doc;

    // Process OCR
    const ocrResult = await extractTextFromBuffer(buffer, file.type, file.name);

    let processingStatus = 'OCRCompleted';
    let extraction = null;
    let warnings: Array<{ type: string; severity: string; message: string; field?: string }> = [];
    let confidenceScore = ocrResult.confidence;

    if (ocrResult.success && (ocrResult.rawText || '').trim()) {
      // Run AI extraction
      extraction = extractInvoiceData(ocrResult.rawText);
      confidenceScore = extraction.confidence.overall;
      warnings = extraction.warnings;
      processingStatus = 'Extracted';

      // Duplicate check
      const existingDocs = await prisma.aIDocument.findMany({
        where: { deletedAt: null, id: { not: docRecord.id } },
        select: {
          id: true, docId: true, extractedData: true, originalName: true,
        },
        take: 200,
      });

      const prevDocs = existingDocs.map(d => {
        const ed = d.extractedData ? JSON.parse(d.extractedData) : {};
        return {
          id: d.id,
          docId: d.docId,
          invoiceNumber: ed.invoiceNumber || '',
          supplierName: ed.supplier?.name || '',
          totalAmount: ed.totals?.grandTotal || 0,
          invoiceDate: ed.invoiceDate || '',
          fileName: d.originalName,
        };
      });

      const dupResult = detectDuplicates({
        invoiceNumber: extraction.invoiceNumber,
        supplierName: extraction.supplier.name,
        totalAmount: extraction.totals.grandTotal,
        invoiceDate: extraction.invoiceDate,
        existingDocs: prevDocs,
      });

      if (dupResult.isDuplicate) {
        warnings.push({
          type: 'DuplicateInvoice',
          severity: 'Critical',
          message: dupResult.message,
        });
        // Create anomaly
        await prisma.aIAnomaly.create({
          data: {
            anomalyId: `ANO-${uuidv4().substring(0, 8).toUpperCase()}`,
            type: 'DuplicateInvoice',
            title: 'Duplicate invoice detected',
            description: dupResult.message,
            riskLevel: 'Critical',
            relatedId: docRecord.id,
            relatedType: 'AIDocument',
            data: JSON.stringify(dupResult),
            status: 'Open',
          },
        });
      }

      // Update document with extraction results
      await prisma.aIDocument.update({
        where: { id: docRecord.id },
        data: {
          ocrRawText: ocrResult.rawText,
          extractedData: JSON.stringify(extraction),
          documentType: extraction.documentType,
          confidenceScore,
          processingStatus: confidenceScore < 50 ? 'NeedsReview' : 'Extracted',
          reviewStatus: 'Pending',
        },
      });

      // Create validation warnings
      for (const w of warnings) {
        await prisma.aIValidationWarning.create({
          data: {
            documentId: docRecord.id,
            type: w.type,
            severity: w.severity,
            message: w.message,
            field: w.field,
          },
        });
      }

      // Create review task
      const hasErrors = warnings.some(w => w.severity === 'Error' || w.severity === 'Critical');
      await prisma.aIReviewTask.create({
        data: {
          taskId: `TASK-${uuidv4().substring(0, 8).toUpperCase()}`,
          documentId: docRecord.id,
          status: 'NeedsReview',
          priority: hasErrors ? 'High' : 'Normal',
          reviewType: 'InvoiceExtraction',
          notes: hasErrors ? `Has ${warnings.filter(w => w.severity === 'Error' || w.severity === 'Critical').length} critical issue(s)` : undefined,
        },
      });

      // Create suggestions for critical warnings
      for (const w of warnings) {
        if (w.type === 'MissingTRN' || w.type === 'DuplicateInvoice' || w.type === 'VATMismatch') {
          await prisma.aISuggestion.create({
            data: {
              suggestionId: `SUG-${uuidv4().substring(0, 8).toUpperCase()}`,
              type: w.type,
              title: w.message.substring(0, 100),
              description: `Document ${docId}: ${w.message}`,
              riskLevel: w.severity === 'Critical' ? 'Critical' : w.severity === 'Error' ? 'High' : 'Medium',
              relatedId: docRecord.id,
              relatedType: 'AIDocument',
              actionType: 'ReviewDocument',
              status: 'Open',
            },
          });
        }
      }

      processingStatus = 'Extracted';
    } else {
      // OCR failed — still create review task
      await prisma.aIDocument.update({
        where: { id: docRecord.id },
        data: {
          ocrRawText: ocrResult.error || 'OCR failed',
          processingStatus: 'NeedsReview',
        },
      });
      await prisma.aIReviewTask.create({
        data: {
          taskId: `TASK-${uuidv4().substring(0, 8).toUpperCase()}`,
          documentId: docRecord.id,
          status: 'NeedsReview',
          priority: 'Normal',
          reviewType: 'InvoiceExtraction',
          notes: `OCR ${ocrResult.success ? 'returned low quality' : 'failed'}: ${ocrResult.error || 'No text extracted'}`,
        },
      });
      processingStatus = 'NeedsReview';
    }

    // Final audit log
    await prisma.aIAuditLog.create({
      data: {
        userId: auth.userId,
        userEmail: auth.email,
        userRole: auth.role,
        action: 'OCRCompleted',
        module: 'AI',
        recordId: docRecord.id,
        recordType: 'AIDocument',
        confidence: confidenceScore,
        details: `OCR provider: ${ocrResult.provider}, Status: ${processingStatus}, Warnings: ${warnings.length}`,
      },
    });

    return NextResponse.json({
      success: true,
      docId,
      documentId: docRecord.id,
      processingStatus,
      confidence: confidenceScore,
      documentType: extraction?.documentType || 'Unknown',
      warningCount: warnings.length,
      ocrProvider: ocrResult.provider,
      message: `Document uploaded and processed. ${warnings.length > 0 ? `${warnings.length} validation issue(s) found.` : 'Ready for review.'}`,
    });
  } catch (err) {
    console.error('AI upload error:', err);
    return NextResponse.json({ error: `Upload failed: ${String(err)}` }, { status: 500 });
  }
}
