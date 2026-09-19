import { requireTaxAuth } from '@/lib/tax-auth';
import { prisma } from '@/lib/prisma';
import VATReturnsClient from './VATReturnsClient';

export default async function VATReturnsPage() {
  await requireTaxAuth();

  const [vatReturns, piTotals, siTotals] = await Promise.all([
    prisma.vATReturn.findMany({ orderBy: { endDate: 'desc' } }),
    prisma.purchaseInvoice.findMany({
      where: { deletedAt: null, approvalStatus: 'Approved' },
      select: { netAmount: true, vatAmount: true, vatTreatment: true, recoverableVAT: true },
    }),
    prisma.taxSalesInvoice.findMany({
      where: { deletedAt: null, approvalStatus: 'Approved' },
      select: { netAmount: true, vatAmount: true, vatTreatment: true },
    }),
  ]);

  const liveStandardSales = siTotals.filter(i => i.vatTreatment === 'Standard').reduce((s, i) => s + i.netAmount, 0);
  const liveZeroRated = siTotals.filter(i => i.vatTreatment === 'ZeroRated').reduce((s, i) => s + i.netAmount, 0);
  const liveExempt = siTotals.filter(i => i.vatTreatment === 'Exempt').reduce((s, i) => s + i.netAmount, 0);
  const liveOutputVAT = siTotals.reduce((s, i) => s + i.vatAmount, 0);
  const liveStdPurchases = piTotals.filter(i => i.vatTreatment === 'Standard').reduce((s, i) => s + i.netAmount, 0);
  const liveRecoverableInput = piTotals.reduce((s, i) => s + i.recoverableVAT, 0);

  const liveFigures = {
    standardSales: liveStandardSales, zeroRatedSales: liveZeroRated, exemptSales: liveExempt,
    outputVAT: liveOutputVAT, standardPurchases: liveStdPurchases, recoverableInput: liveRecoverableInput,
    netVAT: liveOutputVAT - liveRecoverableInput,
  };

  const returns = vatReturns.map(r => ({
    ...r,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
    accountantApprovedAt: r.accountantApprovedAt?.toISOString() ?? null,
    adminApprovedAt: r.adminApprovedAt?.toISOString() ?? null,
    submittedAt: r.submittedAt?.toISOString() ?? null,
    paidAt: r.paidAt?.toISOString() ?? null,
    closedAt: r.closedAt?.toISOString() ?? null,
  }));

  return <VATReturnsClient returns={returns} liveFigures={liveFigures} />;
}
