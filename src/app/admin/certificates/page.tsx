import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import CertificatesClient from './CertificatesClient';

export default async function CertificatesPage() {
  await requireAdminAuth();
  const raw = await prisma.certificate.findMany({ orderBy: { createdAt: 'desc' } });
  const certs = raw.map(c => ({
    id: c.id, name: c.name, category: c.category,
    issueDate: c.issueDate?.toISOString().split('T')[0] ?? '',
    expiryDate: c.expiryDate?.toISOString().split('T')[0] ?? '',
    status: c.status, showOnSite: c.showOnSite, fileUrl: c.fileUrl ?? '',
    notes: c.notes ?? '', createdAt: c.createdAt.toISOString(),
  }));
  return <CertificatesClient initial={certs} />;
}
