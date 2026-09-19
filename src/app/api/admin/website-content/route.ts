import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const content = await prisma.websiteContent.findMany({ orderBy: [{ section: 'asc' }, { title: 'asc' }] });
  return NextResponse.json(content.map(c => ({ ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() })));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const item = await prisma.websiteContent.create({
    data: {
      key: body.key.toLowerCase().replace(/\s+/g, '_'),
      section: body.section ?? 'General',
      title: body.title,
      content: body.content,
      status: body.status ?? 'Active',
    },
  });
  return NextResponse.json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const item = await prisma.websiteContent.update({
    where: { id: body.id },
    data: {
      section: body.section ?? 'General',
      title: body.title,
      content: body.content,
      status: body.status ?? 'Active',
      updatedBy: body.updatedBy ?? null,
    },
  });
  return NextResponse.json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.websiteContent.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
