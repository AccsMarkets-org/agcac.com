import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import AMCClient from './AMCClient';

export default async function AMCContractsPage() {
  await requireAdminAuth();
  const raw = await prisma.aMCContract.findMany({ orderBy: { createdAt: 'desc' } });
  const contracts = raw.map(c => ({
    id: c.id, amcId: c.amcId, customerName: c.customerName, phone: c.phone,
    location: c.location, propertyType: c.propertyType ?? '',
    plan: c.plan, startDate: c.startDate.toISOString().split('T')[0],
    endDate: c.endDate.toISOString().split('T')[0],
    numberOfVisits: c.numberOfVisits, visitFrequency: c.visitFrequency,
    equipment: c.equipment ?? '', contractValue: c.contractValue ?? 0,
    paymentStatus: c.paymentStatus, notes: c.notes ?? '',
    status: c.status, createdAt: c.createdAt.toISOString(),
  }));
  return <AMCClient initial={contracts} />;
}
