import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { filename } = await params;
  if (filename.includes('..') || filename.includes('/'))
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  try {
    const filePath = path.join(process.cwd(), 'private', 'careers', filename);
    const buf = await readFile(filePath);
    const ext = filename.split('.').pop()?.toLowerCase();
    const ct = ext === 'pdf' ? 'application/pdf'
      : ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : ext === 'doc' ? 'application/msword'
      : 'application/octet-stream';
    return new NextResponse(buf, {
      headers: {
        'Content-Type': ct,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
