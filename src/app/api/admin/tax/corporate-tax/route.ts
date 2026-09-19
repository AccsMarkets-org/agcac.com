import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTaxToken } from '@/lib/tax-auth';
import { logTaxAction } from '@/lib/tax-audit';

export async function GET(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const returns = await prisma.corporateTaxReturn.findMany({ orderBy: { financialYear: 'desc' } });
  return NextResponse.json(returns);
}

export async function POST(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();

  const r = await prisma.corporateTaxReturn.create({
    data: {
      financialYear: body.financialYear,
      yearStart: new Date(body.yearStart),
      yearEnd: new Date(body.yearEnd),
      createdBy: auth.email,
      revenue: body.revenue ?? 0,
      costOfSales: body.costOfSales ?? 0,
      grossProfit: body.grossProfit ?? 0,
      operatingExpenses: body.operatingExpenses ?? 0,
      otherIncome: body.otherIncome ?? 0,
      otherExpenses: body.otherExpenses ?? 0,
      accountingNetProfit: body.accountingNetProfit ?? 0,
      nonDeductibleExpenses: body.nonDeductibleExpenses ?? 0,
      deductibleAdjustments: body.deductibleAdjustments ?? 0,
      exemptIncome: body.exemptIncome ?? 0,
      depreciationAdjustment: body.depreciationAdjustment ?? 0,
      interestLimitation: body.interestLimitation ?? 0,
      relatedPartyAdjustments: body.relatedPartyAdjustments ?? 0,
      taxLossesBF: body.taxLossesBF ?? 0,
      taxLossesUsed: body.taxLossesUsed ?? 0,
      taxableIncome: body.taxableIncome ?? 0,
      taxableUpTo375k: body.taxableUpTo375k ?? 0,
      taxableAbove375k: body.taxableAbove375k ?? 0,
      ctAt0Pct: body.ctAt0Pct ?? 0,
      ctAt9Pct: body.ctAt9Pct ?? 0,
      totalCTPayable: body.totalCTPayable ?? 0,
      creditsPayments: body.creditsPayments ?? 0,
      netCTPayable: body.netCTPayable ?? 0,
      status: 'Draft',
      notes: body.notes ?? null,
    },
  });

  await logTaxAction({
    userId: auth.userId, userEmail: auth.email, userRole: auth.role,
    action: 'CREATE_CT_RETURN', module: 'CorporateTax', recordId: r.id,
    description: `Created CT return FY ${r.financialYear} — Net CT: AED ${r.netCTPayable}`,
  });

  return NextResponse.json(r, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, status, ftaRefNumber, submittedAt, ...rest } = await req.json();

  const updateData: Record<string, unknown> = { status };
  if (ftaRefNumber) {
    updateData.ftaRefNumber = ftaRefNumber;
    updateData.submittedAt = submittedAt ? new Date(submittedAt) : new Date();
    updateData.submittedBy = auth.email;
  }
  if (status === 'Approved') {
    updateData.adminApprovedBy = auth.email;
    updateData.adminApprovedAt = new Date();
  }

  const r = await prisma.corporateTaxReturn.update({ where: { id }, data: updateData });

  await logTaxAction({
    userId: auth.userId, userEmail: auth.email, userRole: auth.role,
    action: `UPDATE_CT_RETURN_${status}`, module: 'CorporateTax', recordId: id,
    description: `CT return FY ${r.financialYear} → ${status}${ftaRefNumber ? ` (FTA: ${ftaRefNumber})` : ''}`,
  });

  return NextResponse.json(r);
}
