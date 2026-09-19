import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const rule = await prisma.aIAutomationRule.findFirst({
    where: { OR: [{ id: params.id }, { ruleId: params.id }] },
  });
  if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.active !== undefined) updateData.active = body.active;
  if (body.priority !== undefined) updateData.priority = body.priority;
  if (body.conditions !== undefined) updateData.conditions = JSON.stringify(body.conditions);
  if (body.actions !== undefined) updateData.actions = JSON.stringify(body.actions);

  const updated = await prisma.aIAutomationRule.update({ where: { id: rule.id }, data: updateData });
  return NextResponse.json({ rule: updated });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ALLOWED = ['SuperAdmin', 'Admin'];
  if (!ALLOWED.includes(auth.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const rule = await prisma.aIAutomationRule.findFirst({
    where: { OR: [{ id: params.id }, { ruleId: params.id }] },
  });
  if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.aIAutomationRule.delete({ where: { id: rule.id } });
  return NextResponse.json({ success: true });
}
