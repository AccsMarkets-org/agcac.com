import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  const admin = await requireAdminAuth();
  const raw = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  const users = raw.map(u => ({
    id: u.id, email: u.email, name: u.name ?? '', role: u.role,
    createdAt: u.createdAt.toISOString(),
    lastLogin: u.lastLogin?.toISOString() ?? null,
  }));
  return <UsersClient initial={users} currentUserId={admin.userId} />;
}
