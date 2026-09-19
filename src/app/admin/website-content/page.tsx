import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import WebsiteContentClient from './WebsiteContentClient';

export default async function WebsiteContentPage() {
  await requireAdminAuth();
  const raw = await prisma.websiteContent.findMany({ orderBy: [{ section: 'asc' }, { key: 'asc' }] });
  const items = raw.map(w => ({
    id: w.id, key: w.key, section: w.section ?? '', title: w.title ?? '',
    content: w.content ?? '', status: w.status, updatedBy: w.updatedBy ?? '',
    updatedAt: w.updatedAt.toISOString(),
  }));
  return <WebsiteContentClient initial={items} />;
}
