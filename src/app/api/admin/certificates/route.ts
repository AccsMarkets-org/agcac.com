import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const certs = await prisma.certificate.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(certs.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    issueDate: c.issueDate?.toISOString() ?? null,
    expiryDate: c.expiryDate?.toISOString() ?? null,
  })));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const cert = await prisma.certificate.create({
    data: {
      name: body.name,
      category: body.category ?? 'General',
      issueDate: body.issueDate ? new Date(body.issueDate) : null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      status: body.status ?? 'Active',
      showOnSite: body.showOnSite !== false,
      fileUrl: body.fileUrl ?? null,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json({
    ...cert,
    createdAt: cert.createdAt.toISOString(), updatedAt: cert.updatedAt.toISOString(),
    issueDate: cert.issueDate?.toISOString() ?? null, expiryDate: cert.expiryDate?.toISOString() ?? null,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const cert = await prisma.certificate.update({
    where: { id: body.id },
    data: {
      name: body.name,
      category: body.category ?? 'General',
      issueDate: body.issueDate ? new Date(body.issueDate) : null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      status: body.status ?? 'Active',
      showOnSite: body.showOnSite !== false,
      fileUrl: body.fileUrl ?? null,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json({
    ...cert,
    createdAt: cert.createdAt.toISOString(), updatedAt: cert.updatedAt.toISOString(),
    issueDate: cert.issueDate?.toISOString() ?? null, expiryDate: cert.expiryDate?.toISOString() ?? null,
  });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.certificate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
