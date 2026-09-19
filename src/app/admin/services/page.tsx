import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import ServicesCMSClient from './ServicesCMSClient';

export default async function ServicesAdminPage() {
  await requireAdminAuth();
  const raw = await prisma.serviceCMS.findMany({ orderBy: { sortOrder: 'asc' } });
  const services = raw.map(s => ({
    id: s.id, title: s.title, slug: s.slug, description: s.description ?? '',
    icon: s.icon ?? '', imageUrl: s.imageUrl ?? '', priceRange: s.priceRange ?? '',
    seoTitle: s.seoTitle ?? '', seoDesc: s.seoDesc ?? '',
    showOnSite: s.showOnSite, sortOrder: s.sortOrder, status: s.status,
    createdAt: s.createdAt.toISOString(),
  }));
  return <ServicesCMSClient initial={services} />;
}
