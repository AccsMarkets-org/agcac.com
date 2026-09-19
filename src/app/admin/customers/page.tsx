import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import CustomersClient from './CustomersClient';

export default async function CustomersPage() {
  await requireAdminAuth();
  const raw = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { invoices: true, amcContracts: true } } },
  });
  const customers = raw.map(c => ({
    id: c.id, customerId: c.customerId, name: c.name, phone: c.phone,
    email: c.email ?? '', location: c.location ?? '', area: c.area ?? '',
    propertyType: c.propertyType ?? '', notes: c.notes ?? '',
    totalValue: c.totalValue, invoiceCount: c._count.invoices, amcCount: c._count.amcContracts,
    lastService: c.lastService?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));
  return <CustomersClient initial={customers} />;
}
