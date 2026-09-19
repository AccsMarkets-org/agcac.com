import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTaxToken } from '@/lib/tax-auth';
import { logTaxAction } from '@/lib/tax-audit';

export async function GET(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const returns = await prisma.vATReturn.findMany({ orderBy: { endDate: 'desc' } });
  return NextResponse.json(returns);
}

export async function POST(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();

  const r = await prisma.vATReturn.create({
    data: {
      period: body.period,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      createdBy: auth.email,
      standardSales: body.standardSales ?? 0,
      zeroRatedSales: body.zeroRatedSales ?? 0,
      exemptSales: body.exemptSales ?? 0,
      outputVAT: body.outputVAT ?? 0,
      salesNet: body.salesNet ?? 0,
      standardPurchases: body.standardPurchases ?? 0,
      recoverableInput: body.recoverableInput ?? 0,
      nonRecoverableInput: body.nonRecoverableInput ?? 0,
      inputVAT: body.recoverableInput ?? 0,
      purchasesNet: body.purchasesNet ?? 0,
      adjustments: body.adjustments ?? 0,
      adjustmentNotes: body.adjustmentNotes ?? null,
      netVAT: body.netVAT ?? 0,
      status: 'Draft',
      notes: body.notes ?? null,
    },
  });

  await logTaxAction({
    userId: auth.userId, userEmail: auth.email, userRole: auth.role,
    action: 'CREATE_VAT_RETURN', module: 'VATReturns', recordId: r.id,
    description: `Created VAT return ${r.period} — Net VAT: AED ${r.netVAT}`,
  });

  return NextResponse.json(r, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await verifyTaxToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id, status, ftaRefNumber, submittedAt, ...rest } = body;

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

  // Allow updating figures too
  for (const key of ['standardSales', 'zeroRatedSales', 'exemptSales', 'outputVAT', 'standardPurchases', 'recoverableInput', 'inputVAT', 'netVAT', 'adjustments', 'adjustmentNotes', 'notes']) {
    if (rest[key] !== undefined) updateData[key] = rest[key];
  }

  const r = await prisma.vATReturn.update({ where: { id }, data: updateData });

  await logTaxAction({
    userId: auth.userId, userEmail: auth.email, userRole: auth.role,
    action: `UPDATE_VAT_RETURN_${status}`, module: 'VATReturns', recordId: id,
    description: `VAT return ${r.period} status → ${status}${ftaRefNumber ? ` (FTA Ref: ${ftaRefNumber})` : ''}`,
  });

  return NextResponse.json(r);
}
