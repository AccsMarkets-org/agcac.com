import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const returns = await prisma.vATReturn.findMany({ orderBy: { endDate: 'desc' } });
  return NextResponse.json(returns);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const ret = await prisma.vATReturn.create({
    data: {
      period: body.period || '',
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      outputVAT: parseFloat(body.outputVAT) || 0,
      inputVAT: parseFloat(body.inputVAT) || 0,
      netVAT: parseFloat(body.netVAT) || 0,
      salesNet: parseFloat(body.salesNet) || 0,
      purchasesNet: parseFloat(body.purchasesNet) || 0,
      status: body.status || 'Draft',
      notes: body.notes || null,
    },
  });
  return NextResponse.json(ret, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id, ...data } = body;
  const ret = await prisma.vATReturn.update({
    where: { id },
    data: {
      period: data.period || '',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      outputVAT: parseFloat(data.outputVAT) || 0,
      inputVAT: parseFloat(data.inputVAT) || 0,
      netVAT: parseFloat(data.netVAT) || 0,
      salesNet: parseFloat(data.salesNet) || 0,
      purchasesNet: parseFloat(data.purchasesNet) || 0,
      status: data.status || 'Draft',
      notes: data.notes || null,
      submittedAt: data.status === 'Submitted' && !data.submittedAt ? new Date() : (data.submittedAt ? new Date(data.submittedAt) : null),
    },
  });
  return NextResponse.json(ret);
}
