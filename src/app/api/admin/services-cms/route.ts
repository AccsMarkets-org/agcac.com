import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const services = await prisma.serviceCMS.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json(services.map(s => ({ ...s, createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString() })));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const service = await prisma.serviceCMS.create({
    data: {
      title: body.title,
      slug: body.slug.toLowerCase().replace(/\s+/g, '-'),
      description: body.description ?? null,
      icon: body.icon ?? null,
      imageUrl: body.imageUrl ?? null,
      priceRange: body.priceRange ?? null,
      seoTitle: body.seoTitle ?? null,
      seoDesc: body.seoDesc ?? null,
      showOnSite: body.showOnSite !== false,
      sortOrder: parseInt(body.sortOrder ?? 0),
      status: body.status ?? 'Active',
    },
  });
  return NextResponse.json({ ...service, createdAt: service.createdAt.toISOString(), updatedAt: service.updatedAt.toISOString() });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const service = await prisma.serviceCMS.update({
    where: { id: body.id },
    data: {
      title: body.title,
      slug: body.slug.toLowerCase().replace(/\s+/g, '-'),
      description: body.description ?? null,
      icon: body.icon ?? null,
      imageUrl: body.imageUrl ?? null,
      priceRange: body.priceRange ?? null,
      seoTitle: body.seoTitle ?? null,
      seoDesc: body.seoDesc ?? null,
      showOnSite: body.showOnSite !== false,
      sortOrder: parseInt(body.sortOrder ?? 0),
      status: body.status ?? 'Active',
    },
  });
  return NextResponse.json({ ...service, createdAt: service.createdAt.toISOString(), updatedAt: service.updatedAt.toISOString() });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.serviceCMS.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
