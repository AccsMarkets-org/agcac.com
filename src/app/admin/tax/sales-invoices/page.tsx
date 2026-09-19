import { requireTaxAuth } from '@/lib/tax-auth';
import { prisma } from '@/lib/prisma';
import SalesInvoicesClient from './SalesInvoicesClient';

export default async function SalesInvoicesPage() {
  await requireTaxAuth();
  const raw = await prisma.taxSalesInvoice.findMany({
    where: { deletedAt: null },
    include: { items: true },
    orderBy: { invoiceDate: 'desc' },
  });
  const invoices = raw.map(inv => ({
    ...inv,
    invoiceDate: inv.invoiceDate.toISOString(),
    dateOfSupply: inv.dateOfSupply?.toISOString() ?? null,
    approvedAt: inv.approvedAt?.toISOString() ?? null,
    deletedAt: null,
    items: inv.items,
  }));
  return <SalesInvoicesClient invoices={invoices} />;
}
