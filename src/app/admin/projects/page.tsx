import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import PortfolioClient from './PortfolioClient';

export default async function ProjectsPortfolioPage() {
  await requireAdminAuth();
  const raw = await prisma.portfolioProject.findMany({ orderBy: { createdAt: 'desc' } });
  const projects = raw.map(p => ({
    id: p.id, title: p.title, category: p.category,
    location: p.location ?? '', systemType: p.systemType ?? '',
    scopeOfWork: p.scopeOfWork ?? '', description: p.description ?? '',
    featured: p.featured, showOnSite: p.showOnSite, imageUrl: p.imageUrl ?? '',
    year: p.year ?? new Date().getFullYear(), clientName: p.clientName ?? '',
    status: p.status, createdAt: p.createdAt.toISOString(),
  }));
  return <PortfolioClient initial={projects} />;
}
