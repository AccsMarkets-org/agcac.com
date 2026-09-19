import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import ReviewCenterClient from './ReviewCenterClient';

export const dynamic = 'force-dynamic';

export default async function ReviewCenterPage() {
  const auth = await requireAdminAuth();

  const tasks = await prisma.aIReviewTask.findMany({
    where: { status: { in: ['NeedsReview', 'InReview'] } },
    include: {
      document: {
        include: { warnings: true },
      },
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    take: 50,
  });

  const enriched = tasks.map(t => ({
    ...t,
    document: {
      ...t.document,
      extractedJSON: t.document.extractedData ? JSON.parse(t.document.extractedData) : null,
    },
  }));

  return <ReviewCenterClient tasks={enriched} userEmail={auth.email} userRole={auth.role} />;
}
