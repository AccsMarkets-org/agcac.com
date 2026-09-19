import { requireTaxAuth } from '@/lib/tax-auth';
import { prisma } from '@/lib/prisma';
import SubmissionClient from './SubmissionClient';

export default async function SubmissionPage() {
  await requireTaxAuth();

  const [vatReturns, ctReturns, piCount, siCount, piPending, taxSettings] = await Promise.all([
    prisma.vATReturn.findMany({ orderBy: { endDate: 'desc' } }),
    prisma.corporateTaxReturn.findMany({ orderBy: { financialYear: 'desc' } }),
    prisma.purchaseInvoice.count({ where: { deletedAt: null } }),
    prisma.taxSalesInvoice.count({ where: { deletedAt: null } }),
    prisma.purchaseInvoice.count({ where: { deletedAt: null, approvalStatus: 'Pending' } }),
    prisma.taxSetting.findMany(),
  ]);

  const settingsMap = Object.fromEntries(taxSettings.map(s => [s.key, s.value]));
  const approvedVAT = vatReturns.filter(r => r.status === 'Approved');
  const approvedCT = ctReturns.filter(r => r.status === 'Approved');

  const vr = vatReturns.map(r => ({
    ...r,
    startDate: r.startDate.toISOString(), endDate: r.endDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
    accountantApprovedAt: r.accountantApprovedAt?.toISOString() ?? null,
    adminApprovedAt: r.adminApprovedAt?.toISOString() ?? null,
    submittedAt: r.submittedAt?.toISOString() ?? null,
    paidAt: r.paidAt?.toISOString() ?? null,
    closedAt: r.closedAt?.toISOString() ?? null,
  }));

  const cr = ctReturns.map(r => ({
    ...r,
    yearStart: r.yearStart.toISOString(), yearEnd: r.yearEnd.toISOString(),
    createdAt: r.createdAt.toISOString(),
    accountantApprovedAt: r.accountantApprovedAt?.toISOString() ?? null,
    adminApprovedAt: r.adminApprovedAt?.toISOString() ?? null,
    submittedAt: r.submittedAt?.toISOString() ?? null,
    paidAt: r.paidAt?.toISOString() ?? null,
  }));

  return (
    <SubmissionClient
      vatReturns={vr}
      ctReturns={cr}
      piCount={piCount}
      siCount={siCount}
      piPending={piPending}
      companyTRN={settingsMap.company_trn ?? ''}
      companyName={settingsMap.company_name ?? 'Al Ghawas A/C Refrigeration Contracting LLC'}
      approvedVATCount={approvedVAT.length}
      approvedCTCount={approvedCT.length}
    />
  );
}
