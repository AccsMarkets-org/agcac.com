import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/jpg', 'image/png'];
const MAX_MB = 10;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (!ALLOWED.includes(file.type))
      return NextResponse.json({ error: 'Invalid file type. Use PDF, DOC, DOCX, JPG, or PNG.' }, { status: 400 });
    if (file.size / 1024 / 1024 > MAX_MB)
      return NextResponse.json({ error: `File too large. Max ${MAX_MB}MB.` }, { status: 400 });

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `cv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const dir = path.join(process.cwd(), 'private', 'careers');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({
      url: `/api/careers/file/${fileName}`,
      fileName: file.name,
      storedName: fileName,
      fileType: file.type,
      fileSize: file.size,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
