import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (search) where.OR = [
    { title: { contains: search } },
    { category: { contains: search } },
    { location: { contains: search } },
    { clientName: { contains: search } },
  ];

  const projects = await prisma.portfolioProject.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(projects.map(p => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const project = await prisma.portfolioProject.create({
    data: {
      title: body.title,
      category: body.category,
      location: body.location ?? null,
      systemType: body.systemType ?? null,
      scopeOfWork: body.scopeOfWork ?? null,
      description: body.description ?? null,
      featured: Boolean(body.featured),
      showOnSite: body.showOnSite !== false,
      imageUrl: body.imageUrl ?? null,
      year: body.year ? parseInt(body.year) : null,
      clientName: body.clientName ?? null,
      status: body.status ?? 'Active',
    },
  });
  return NextResponse.json({ ...project, createdAt: project.createdAt.toISOString(), updatedAt: project.updatedAt.toISOString() });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const project = await prisma.portfolioProject.update({
    where: { id: body.id },
    data: {
      title: body.title,
      category: body.category,
      location: body.location ?? null,
      systemType: body.systemType ?? null,
      scopeOfWork: body.scopeOfWork ?? null,
      description: body.description ?? null,
      featured: Boolean(body.featured),
      showOnSite: body.showOnSite !== false,
      imageUrl: body.imageUrl ?? null,
      year: body.year ? parseInt(body.year) : null,
      clientName: body.clientName ?? null,
      status: body.status ?? 'Active',
    },
  });
  return NextResponse.json({ ...project, createdAt: project.createdAt.toISOString(), updatedAt: project.updatedAt.toISOString() });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.portfolioProject.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
