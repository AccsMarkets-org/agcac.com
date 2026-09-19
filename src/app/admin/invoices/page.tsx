import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import InvoicesClient from './InvoicesClient';

export default async function InvoicesPage() {
  await requireAdminAuth();
  const raw = await prisma.invoice.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true, payments: true },
  });
  const invoices = raw.map(inv => {
    const subtotal = inv.items.reduce((s, i) => s + i.total, 0);
    const net = subtotal * (1 - inv.discount / 100);
    const vatAmt = net * (inv.vat / 100);
    const total = net + vatAmt;
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    return {
      id: inv.id, invoiceId: inv.invoiceId, customerName: inv.customerName,
      phone: inv.phone, address: inv.address ?? '', service: inv.service,
      discount: inv.discount, vat: inv.vat, notes: inv.notes ?? '', status: inv.status,
      invoiceDate: inv.invoiceDate.toISOString().split('T')[0],
      dueDate: inv.dueDate?.toISOString().split('T')[0] ?? '',
      items: inv.items.map(i => ({ id: i.id, description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total })),
      total, paid, balance: total - paid, createdAt: inv.createdAt.toISOString(),
    };
  });
  return <InvoicesClient initial={invoices} />;
}
