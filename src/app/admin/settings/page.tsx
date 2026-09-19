import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  await requireAdminAuth();
  const rows = await prisma.settings.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return <SettingsClient initial={settings} />;
}
