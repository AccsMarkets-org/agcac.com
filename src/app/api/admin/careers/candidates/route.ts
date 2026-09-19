import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const candidates = await prisma.candidate.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { fullName: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
        ],
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { applications: true, interviews: true } },
    },
  });

  return NextResponse.json(candidates);
}
