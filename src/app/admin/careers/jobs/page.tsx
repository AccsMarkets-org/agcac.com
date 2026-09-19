import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import JobsAdminClient from './JobsAdminClient';

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

export default async function JobsAdminPage() {
  const admin = await verifyAuth();
  if (!admin) redirect('/admin/login');

  const jobs = await prisma.careerJob.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { applications: { where: { deletedAt: null } } } } },
  });

  const serialized = jobs.map(j => ({
    ...j,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
    closingDate: j.closingDate?.toISOString() ?? null,
    deletedAt: null,
    _count: j._count,
  }));

  return <JobsAdminClient jobs={serialized} />;
}
