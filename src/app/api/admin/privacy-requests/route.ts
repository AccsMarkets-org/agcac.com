import { NextRequest, NextResponse } from 'next/server';
import { verifyTaxToken } from '@/lib/tax-auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const admin = await verifyTaxToken(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const where = status ? { status } : {};

  const [requests, total] = await Promise.all([
    prisma.privacyRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.privacyRequest.count({ where }),
  ]);

  return NextResponse.json({ requests, total, page, pages: Math.ceil(total / limit) });
}
