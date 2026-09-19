import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import ApplicationsAdminClient from './ApplicationsAdminClient';

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

export default async function ApplicationsAdminPage() {
  const admin = await verifyAuth();
  if (!admin) redirect('/admin/login');

  const [apps, jobs] = await Promise.all([
    prisma.jobApplication.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        job: { select: { title: true, department: true } },
        documents: { select: { id: true, documentType: true, fileName: true, fileUrl: true, fileType: true } },
      },
    }),
    prisma.careerJob.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  const serialized = apps.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    submittedAt: a.submittedAt.toISOString(),
    deletedAt: null,
    job: a.job,
    documents: a.documents,
  }));

  return <ApplicationsAdminClient applications={serialized} jobs={jobs} />;
}
