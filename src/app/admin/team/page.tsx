import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import TeamClient from './TeamClient';

export default async function TeamPage() {
  await requireAdminAuth();
  const raw = await prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } });
  const members = raw.map(m => ({
    id: m.id, name: m.name, role: m.role, department: m.department ?? '',
    phone: m.phone ?? '', email: m.email ?? '', active: m.active,
    sortOrder: m.sortOrder, notes: m.notes ?? '', createdAt: m.createdAt.toISOString(),
  }));
  return <TeamClient initial={members} />;
}
