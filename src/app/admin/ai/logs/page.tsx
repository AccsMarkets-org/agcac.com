import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import AILogsClient from './AILogsClient';

export const dynamic = 'force-dynamic';

export default async function AILogsPage({ searchParams }: { searchParams: { page?: string; action?: string; module?: string } }) {
  await requireAdminAuth();

  const page = parseInt(searchParams.page || '1');
  const pageSize = 50;
  const where: Record<string, unknown> = {};
  if (searchParams.action) where.action = searchParams.action;
  if (searchParams.module) where.module = searchParams.module;

  const [logs, total] = await Promise.all([
    prisma.aIAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.aIAuditLog.count({ where }),
  ]);

  const actions = await prisma.aIAuditLog.findMany({ select: { action: true }, distinct: ['action'] });
  const modules = await prisma.aIAuditLog.findMany({ select: { module: true }, distinct: ['module'] });

  return (
    <AILogsClient
      logs={logs}
      total={total}
      page={page}
      pageSize={pageSize}
      allActions={actions.map(a => a.action)}
      allModules={modules.map(m => m.module)}
    />
  );
}
