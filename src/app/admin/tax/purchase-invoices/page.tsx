import { requireTaxAuth } from '@/lib/tax-auth';
import { prisma } from '@/lib/prisma';
import PurchaseInvoicesClient from './PurchaseInvoicesClient';

export default async function PurchaseInvoicesPage() {
  await requireTaxAuth();
  const raw = await prisma.purchaseInvoice.findMany({
    where: { deletedAt: null },
    include: { items: true },
    orderBy: { invoiceDate: 'desc' },
  });
  const invoices = raw.map(inv => ({
    ...inv,
    invoiceDate: inv.invoiceDate.toISOString(),
    approvedAt: inv.approvedAt?.toISOString() ?? null,
    deletedAt: inv.deletedAt?.toISOString() ?? null,
    items: inv.items,
  }));
  return <PurchaseInvoicesClient invoices={invoices} />;
}
