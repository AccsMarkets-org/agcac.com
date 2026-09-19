import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const action = searchParams.get('action') || '';
  const module = searchParams.get('module') || '';
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (action) where.action = { contains: action };
  if (module) where.module = module;

  const [logs, total] = await Promise.all([
    prisma.aIAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.aIAuditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
}
