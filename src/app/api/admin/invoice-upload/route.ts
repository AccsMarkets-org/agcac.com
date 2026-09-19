import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_MB = 20;

export async function POST(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type not supported. Use PDF, JPG, or PNG.` }, { status: 400 });
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_MB) {
      return NextResponse.json({ error: `File too large (${sizeMB.toFixed(1)}MB). Max ${MAX_MB}MB.` }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'invoices');

    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/invoices/${fileName}`, fileName, mimeType: file.type });
  } catch (err) {
    console.error('Invoice upload error:', err);
    return NextResponse.json({ error: `Upload failed: ${String(err)}` }, { status: 500 });
  }
}
