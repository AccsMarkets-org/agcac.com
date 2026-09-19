import { requireTaxAuth } from '@/lib/tax-auth';
import { prisma } from '@/lib/prisma';
import TaxSettingsClient from './TaxSettingsClient';

export default async function TaxSettingsPage() {
  await requireTaxAuth();
  const settings = await prisma.taxSetting.findMany({ orderBy: { category: 'asc' } });
  const plain = settings.map(s => ({ ...s, updatedAt: s.updatedAt?.toISOString() ?? null }));
  return <TaxSettingsClient settings={plain} />;
}
