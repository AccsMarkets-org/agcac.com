import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTaxToken } from '@/lib/tax-auth';
import { logTaxAction } from '@/lib/tax-audit';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  const fileType = file.type || '';
  const fileName = file.name || '';
  const extLower = path.extname(fileName).toLowerCase();

  const isAllowed =
    allowedTypes.includes(fileType) ||
    ['.jpg', '.jpeg', '.png', '.webp', '.pdf'].includes(extLower);

  if (!isAllowed) {
    return NextResponse.json(
      { error: `Unsupported file type: ${fileType || extLower}. Use JPG, PNG, WebP, or PDF.` },
      { status: 400 }
    );
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large — maximum 20 MB' }, { status: 400 });
  }

  // Save to public/uploads/tax so the file can be previewed in the browser
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tax');
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch {
    // ignore if already exists
  }

  const ext = extLower || (fileType === 'application/pdf' ? '.pdf' : '.jpg');
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadDir, safeName);
  const fileUrl = `/uploads/tax/${safeName}`;

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
  } catch (e) {
    return NextResponse.json({ error: `Failed to save file: ${String(e)}` }, { status: 500 });
  }

  let doc;
  try {
    doc = await prisma.taxDocument.create({
      data: {
        fileName: safeName,
        originalName: fileName,
        fileType: fileType || (extLower === '.pdf' ? 'application/pdf' : 'image/jpeg'),
        fileSize: file.size,
        filePath,
        category: 'PurchaseInvoice',
        uploadedBy: auth.email,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: `Database error: ${String(e)}` }, { status: 500 });
  }

  await logTaxAction({
    userId: auth.userId,
    userEmail: auth.email,
    userRole: auth.role,
    action: 'UPLOAD_DOCUMENT',
    module: 'Upload',
    recordId: doc.id,
    description: `Uploaded: ${fileName} (${(file.size / 1024).toFixed(0)} KB)`,
  });

  return NextResponse.json({
    success: true,
    id: doc.id,
    fileName: safeName,
    originalName: fileName,
    fileUrl,
    fileType: doc.fileType,
    fileSize: file.size,
    message: 'File uploaded successfully',
  });
}
