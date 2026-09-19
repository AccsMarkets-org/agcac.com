import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import InterviewsAdminClient from './InterviewsAdminClient';

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

export default async function InterviewsAdminPage() {
  const admin = await verifyAuth();
  if (!admin) redirect('/admin/login');

  const interviews = await prisma.interview.findMany({
    orderBy: { interviewDate: 'asc' },
    include: {
      application: { select: { applicationId: true, fullName: true, positionApplied: true, phone: true } },
      job: { select: { title: true, department: true } },
      interviewer: { select: { name: true } },
    },
  });

  const serialized = interviews.map(i => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
    interviewDate: i.interviewDate.toISOString(),
  }));

  return <InterviewsAdminClient interviews={serialized} />;
}
