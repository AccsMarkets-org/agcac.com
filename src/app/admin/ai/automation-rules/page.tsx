import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import AutomationRulesClient from './AutomationRulesClient';

export const dynamic = 'force-dynamic';

export default async function AutomationRulesPage() {
  const auth = await requireAdminAuth();
  const rules = await prisma.aIAutomationRule.findMany({ orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }] });
  return <AutomationRulesClient rules={rules} userRole={auth.role} />;
}
