import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import QuotationsClient from './QuotationsClient';

export default async function QuotationsPage() {
  await requireAdminAuth();
  const raw = await prisma.quotation.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
  const quotations = raw.map(q => {
    const subtotal = q.items.reduce((s, i) => s + i.total, 0);
    const net = subtotal * (1 - q.discount / 100);
    const vatAmt = net * (q.vat / 100);
    return {
      id: q.id, quoteId: q.quoteId, customerName: q.customerName,
      phone: q.phone, email: q.email ?? '', address: q.address ?? '',
      service: q.service, discount: q.discount, vat: q.vat,
      notes: q.notes ?? '', terms: q.terms ?? '', status: q.status,
      quoteDate: q.quoteDate.toISOString().split('T')[0],
      validUntil: q.validUntil?.toISOString().split('T')[0] ?? '',
      items: q.items.map(i => ({ id: i.id, description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total })),
      total: net + vatAmt, createdAt: q.createdAt.toISOString(),
    };
  });
  return <QuotationsClient initial={quotations} />;
}
