import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import TaxAssistantClient from './TaxAssistantClient';

export const dynamic = 'force-dynamic';

const TAX_ROLES = ['SuperAdmin', 'Admin', 'Accountant', 'TaxManager'];

export default async function TaxAssistantPage() {
  const auth = await requireAdminAuth();
  if (!TAX_ROLES.includes(auth.role)) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        Access denied. Accountant, Tax Manager, Admin, or Super Admin required.
      </div>
    );
  }

  const [purchaseInvoices, salesInvoices, taxSettings] = await Promise.all([
    prisma.purchaseInvoice.findMany({
      where: { status: { in: ['Approved', 'Posted'] } },
      select: {
        id: true, supplierName: true, invoiceNumber: true, invoiceDate: true,
        totalAmount: true, vatAmount: true, supplierTRN: true, status: true,
      },
      orderBy: { invoiceDate: 'desc' },
      take: 200,
    }),
    prisma.taxSalesInvoice.findMany({
      where: { status: { in: ['Approved', 'Posted'] } },
      select: {
        id: true, customerName: true, invoiceNumber: true, invoiceDate: true,
        totalAmount: true, vatAmount: true, status: true,
      },
      orderBy: { invoiceDate: 'desc' },
      take: 200,
    }),
    prisma.taxSetting.findMany(),
  ]);

  const totalInputVAT = purchaseInvoices.reduce((sum, inv) => sum + (inv.vatAmount || 0), 0);
  const totalOutputVAT = salesInvoices.reduce((sum, inv) => sum + (inv.vatAmount || 0), 0);
  const netVAT = totalOutputVAT - totalInputVAT;

  const missingTRN = purchaseInvoices.filter(inv => !inv.supplierTRN || inv.supplierTRN.length !== 15).length;

  return (
    <TaxAssistantClient
      totalInputVAT={totalInputVAT}
      totalOutputVAT={totalOutputVAT}
      netVAT={netVAT}
      purchaseCount={purchaseInvoices.length}
      salesCount={salesInvoices.length}
      missingTRN={missingTRN}
      userRole={auth.role}
    />
  );
}
