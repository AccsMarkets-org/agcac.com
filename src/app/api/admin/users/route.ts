import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, name: true, role: true, active: true, phone: true, createdAt: true, lastLogin: true },
  });

  return NextResponse.json(users.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    lastLogin: u.lastLogin?.toISOString() ?? null,
  })));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.email || !body.password || !body.name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

  const hashed = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: hashed,
      name: body.name,
      role: body.role ?? 'Staff',
      phone: body.phone ?? null,
      active: body.active !== false,
    },
    select: { id: true, email: true, name: true, role: true, active: true, phone: true, createdAt: true, lastLogin: true },
  });

  return NextResponse.json({ ...user, createdAt: user.createdAt.toISOString(), lastLogin: null });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {
    name: body.name,
    email: body.email,
    role: body.role ?? 'Staff',
    phone: body.phone ?? null,
    active: body.active !== false,
  };

  if (body.password) {
    data.password = await bcrypt.hash(body.password, 12);
  }

  const user = await prisma.user.update({
    where: { id: body.id },
    data,
    select: { id: true, email: true, name: true, role: true, active: true, phone: true, createdAt: true, lastLogin: true },
  });

  return NextResponse.json({ ...user, createdAt: user.createdAt.toISOString(), lastLogin: user.lastLogin?.toISOString() ?? null });
}
