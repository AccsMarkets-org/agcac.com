import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rules = await prisma.aIAutomationRule.findMany({ orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }] });
  return NextResponse.json({ rules });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ALLOWED = ['SuperAdmin', 'Admin', 'Accountant'];
  if (!ALLOWED.includes(auth.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json() as {
    name: string;
    description?: string;
    trigger: string;
    conditions: Array<{ field: string; operator: string; value: string }>;
    actions: Array<{ type: string; value?: string }>;
    priority?: number;
    active?: boolean;
  };

  if (!body.name || !body.trigger) return NextResponse.json({ error: 'name and trigger required' }, { status: 400 });

  const rule = await prisma.aIAutomationRule.create({
    data: {
      ruleId: `RULE-${uuidv4().substring(0, 8).toUpperCase()}`,
      name: body.name,
      description: body.description,
      trigger: body.trigger,
      conditions: JSON.stringify(body.conditions || []),
      actions: JSON.stringify(body.actions || []),
      priority: body.priority || 0,
      active: body.active ?? true,
      createdBy: auth.email,
    },
  });

  await prisma.aIAuditLog.create({
    data: {
      userId: auth.userId, userEmail: auth.email, userRole: auth.role,
      action: 'AutomationRuleCreated', module: 'AI', recordId: rule.id, recordType: 'AIAutomationRule',
      details: `Rule "${body.name}" created`,
    },
  });

  return NextResponse.json({ rule });
}
