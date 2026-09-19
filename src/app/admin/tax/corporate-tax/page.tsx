import { requireTaxAuth } from '@/lib/tax-auth';
import { prisma } from '@/lib/prisma';
import CorporateTaxClient from './CorporateTaxClient';

export default async function CorporateTaxPage() {
  await requireTaxAuth();

  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);

  const [ctReturns, siTotals, piTotals] = await Promise.all([
    prisma.corporateTaxReturn.findMany({ orderBy: { financialYear: 'desc' } }),
    prisma.taxSalesInvoice.findMany({
      where: { deletedAt: null, approvalStatus: 'Approved', invoiceDate: { gte: yearStart, lte: yearEnd } },
      select: { netAmount: true, vatAmount: true, totalAmount: true },
    }),
    prisma.purchaseInvoice.findMany({
      where: { deletedAt: null, approvalStatus: 'Approved', invoiceDate: { gte: yearStart, lte: yearEnd } },
      select: { netAmount: true, vatAmount: true },
    }),
  ]);

  const revenue = siTotals.reduce((s, i) => s + i.netAmount, 0);
  const costOfSales = piTotals.reduce((s, i) => s + i.netAmount, 0);
  const grossProfit = revenue - costOfSales;

  const liveFigures = { revenue, costOfSales, grossProfit, year };

  const returns = ctReturns.map(r => ({
    ...r,
    yearStart: r.yearStart.toISOString(),
    yearEnd: r.yearEnd.toISOString(),
    createdAt: r.createdAt.toISOString(),
    accountantApprovedAt: r.accountantApprovedAt?.toISOString() ?? null,
    adminApprovedAt: r.adminApprovedAt?.toISOString() ?? null,
    submittedAt: r.submittedAt?.toISOString() ?? null,
    paidAt: r.paidAt?.toISOString() ?? null,
  }));

  return <CorporateTaxClient returns={returns} liveFigures={liveFigures} />;
}
