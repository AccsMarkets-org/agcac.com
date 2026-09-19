import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import CandidatesAdminClient from './CandidatesAdminClient';

async function verifyAuth() {
  const c = await cookies();
  const token = c.get('admin_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'alghawas-default-secret-change-in-production');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch { return null; }
}

export default async function CandidatesAdminPage() {
  const admin = await verifyAuth();
  if (!admin) redirect('/admin/login');

  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { applications: true, interviews: true } } },
  });

  const serialized = candidates.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    _count: c._count,
  }));

  return <CandidatesAdminClient candidates={serialized} />;
}
