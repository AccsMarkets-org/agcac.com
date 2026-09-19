import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const members = await prisma.teamMember.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  return NextResponse.json(members.map(m => ({ ...m, createdAt: m.createdAt.toISOString(), updatedAt: m.updatedAt.toISOString() })));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const member = await prisma.teamMember.create({
    data: {
      name: body.name,
      role: body.role,
      department: body.department ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      active: body.active !== false,
      sortOrder: parseInt(body.sortOrder ?? 0),
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json({ ...member, createdAt: member.createdAt.toISOString(), updatedAt: member.updatedAt.toISOString() });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const member = await prisma.teamMember.update({
    where: { id: body.id },
    data: {
      name: body.name,
      role: body.role,
      department: body.department ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      active: body.active !== false,
      sortOrder: parseInt(body.sortOrder ?? 0),
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json({ ...member, createdAt: member.createdAt.toISOString(), updatedAt: member.updatedAt.toISOString() });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.teamMember.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
