/**
 * Al Ghawas OCR Processing Module
 * Handles text extraction from PDFs and images.
 * - PDFs: pdf-parse (text-based extraction)
 * - Images: Tesseract.js v7 (configurable via AI_PROVIDER env var)
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface OcrResult {
  success: boolean;
  rawText: string;
  confidence: number;
  provider: string;
  error?: string;
  pageCount?: number;
}

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'ai-docs');

export async function ensureUploadsDir(): Promise<void> {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

export async function saveUploadedFile(buffer: Buffer, originalName: string): Promise<{
  fileName: string;
  filePath: string;
  publicUrl: string;
  fileSize: number;
}> {
  await ensureUploadsDir();
  const ext = path.extname(originalName).toLowerCase();
  const fileName = `${uuidv4()}${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  await writeFile(filePath, buffer);
  return {
    fileName,
    filePath,
    publicUrl: `/uploads/ai-docs/${fileName}`,
    fileSize: buffer.length,
  };
}

export async function extractTextFromBuffer(buffer: Buffer, mimeType: string, originalName: string): Promise<OcrResult> {
  const isPDF = mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf');
  const isImage = mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|tiff|bmp)$/i.test(originalName);

  if (isPDF) {
    return extractFromPDF(buffer);
  } else if (isImage) {
    return extractFromImage(buffer, originalName);
  } else {
    return {
      success: false,
      rawText: '',
      confidence: 0,
      provider: 'none',
      error: `Unsupported file type: ${mimeType}`,
    };
  }
}

async function extractFromPDF(buffer: Buffer): Promise<OcrResult> {
  try {
    // pdf-parse v1 — must use require() to avoid ESM issues with Next.js
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    // Use lib path directly — require('pdf-parse') triggers its test runner in Next.js
    const pdfParse = require('pdf-parse/lib/pdf-parse');
    const data = await pdfParse(buffer);
    const text = (data.text || '').trim();
    if (!text) {
      return {
        success: false,
        rawText: '',
        confidence: 0,
        provider: 'pdf-parse',
        error: 'PDF appears to be scanned/image-only. Use image upload for OCR.',
        pageCount: data.numpages,
      };
    }
    return {
      success: true,
      rawText: text,
      confidence: text.length > 100 ? 92 : 70,
      provider: 'pdf-parse',
      pageCount: data.numpages,
    };
  } catch (err) {
    return {
      success: false,
      rawText: '',
      confidence: 0,
      provider: 'pdf-parse',
      error: String(err),
    };
  }
}

async function extractFromImage(buffer: Buffer, fileName: string): Promise<OcrResult> {
  // Try Tesseract.js if AI_PROVIDER is configured or as default
  const provider = process.env.AI_PROVIDER || 'tesseract';

  if (provider === 'google_vision' && process.env.GOOGLE_VISION_API_KEY) {
    return extractWithGoogleVision(buffer);
  }

  if (provider === 'aws_textract' && process.env.AWS_TEXTRACT_KEY) {
    return extractWithAWSTextract(buffer);
  }

  // Default: Tesseract.js
  return extractWithTesseract(buffer, fileName);
}

async function extractWithTesseract(buffer: Buffer, fileName: string): Promise<OcrResult> {
  try {
    await ensureUploadsDir();
    const tempPath = path.join(UPLOADS_DIR, `temp_ocr_${Date.now()}_${fileName}`);
    await writeFile(tempPath, buffer);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Tesseract = require('tesseract.js');
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: () => {},
      workerPath: undefined,
      corePath: undefined,
      langPath: undefined,
    });

    const { data } = await worker.recognize(tempPath);
    await worker.terminate();

    // Clean up temp file
    try {
      const { unlink } = await import('fs/promises');
      await unlink(tempPath);
    } catch {}

    const text = (data.text || '').trim();
    const confidence = data.confidence || 0;

    return {
      success: text.length > 10,
      rawText: text,
      confidence: confidence,
      provider: 'tesseract',
    };
  } catch (err) {
    return {
      success: false,
      rawText: '',
      confidence: 0,
      provider: 'tesseract',
      error: `Tesseract OCR failed: ${String(err)}. Try uploading a PDF or configure GOOGLE_VISION_API_KEY.`,
    };
  }
}

async function extractWithGoogleVision(buffer: Buffer): Promise<OcrResult> {
  // Placeholder for Google Vision API integration
  return {
    success: false,
    rawText: '',
    confidence: 0,
    provider: 'google_vision',
    error: 'Google Vision API integration: Set GOOGLE_VISION_API_KEY and enable the Vision API in your Google Cloud project.',
  };
}

async function extractWithAWSTextract(buffer: Buffer): Promise<OcrResult> {
  // Placeholder for AWS Textract integration
  return {
    success: false,
    rawText: '',
    confidence: 0,
    provider: 'aws_textract',
    error: 'AWS Textract integration: Set AWS_TEXTRACT_KEY, AWS_REGION, and configure IAM permissions.',
  };
}

export function computeFileHash(buffer: Buffer): string {
  // Simple hash using buffer length + first/last bytes
  const len = buffer.length;
  const sample = [
    len,
    buffer[0] || 0,
    buffer[Math.floor(len / 4)] || 0,
    buffer[Math.floor(len / 2)] || 0,
    buffer[len - 1] || 0,
  ];
  return sample.join('-');
}
