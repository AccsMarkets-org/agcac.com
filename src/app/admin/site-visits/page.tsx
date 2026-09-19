import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import SiteVisitsClient from './SiteVisitsClient';

export default async function SiteVisitsPage() {
  await requireAdminAuth();
  const raw = await prisma.siteVisit.findMany({ orderBy: { createdAt: 'desc' } });
  const visits = raw.map(v => ({
    id: v.id, visitId: v.visitId, customerName: v.customerName, phone: v.phone,
    location: v.location, mapsLink: v.mapsLink ?? '', service: v.service ?? '',
    visitDate: v.visitDate?.toISOString().split('T')[0] ?? '',
    visitTime: v.visitTime ?? '', status: v.status,
    notes: v.notes ?? '', recommendation: v.recommendation ?? '',
    estimatedCost: v.estimatedCost ?? '', customerDecision: v.customerDecision ?? '',
    createdAt: v.createdAt.toISOString(),
  }));
  return <SiteVisitsClient initial={visits} />;
}
