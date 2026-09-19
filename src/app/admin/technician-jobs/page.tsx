import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import TechJobsClient from './TechJobsClient';

export default async function TechnicianJobsPage() {
  await requireAdminAuth();
  const raw = await prisma.technicianJob.findMany({ orderBy: { createdAt: 'desc' } });
  const jobs = raw.map(j => ({
    id: j.id, jobId: j.jobId, customerName: j.customerName, phone: j.phone,
    location: j.location, service: j.service,
    jobDate: j.jobDate?.toISOString().split('T')[0] ?? '',
    jobTime: j.jobTime ?? '', technicianName: j.technicianName ?? '',
    materials: j.materials ?? '', notes: j.notes ?? '',
    workNotes: j.workNotes ?? '', completionReport: j.completionReport ?? '',
    status: j.status, createdAt: j.createdAt.toISOString(),
  }));
  return <TechJobsClient initial={jobs} />;
}
