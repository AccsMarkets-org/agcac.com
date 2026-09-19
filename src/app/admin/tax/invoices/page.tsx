import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import PurchaseInvoicesClient from './PurchaseInvoicesClient';

export default async function PurchaseInvoicesPage() {
  await requireAdminAuth();
  const raw = await prisma.purchaseInvoice.findMany({
    include: { items: true },
    orderBy: { invoiceDate: 'desc' },
  });
  const invoices = raw.map(inv => ({
    id: inv.id, invoiceRef: inv.invoiceRef, supplierName: inv.supplierName,
    supplierTRN: inv.supplierTRN ?? '', invoiceDate: inv.invoiceDate.toISOString().split('T')[0],
    invoiceNumber: inv.invoiceNumber ?? '', netAmount: inv.netAmount, vatAmount: inv.vatAmount,
    totalAmount: inv.totalAmount, category: inv.category ?? '', notes: inv.notes ?? '',
    fileUrl: inv.fileUrl ?? '', status: inv.status, createdAt: inv.createdAt.toISOString(),
    items: inv.items.map(it => ({
      id: it.id, description: it.description, quantity: it.quantity,
      unitPrice: it.unitPrice, vatRate: it.vatRate, vatAmount: it.vatAmount, total: it.total,
    })),
  }));
  return <PurchaseInvoicesClient initial={invoices} />;
}
