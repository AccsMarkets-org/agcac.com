import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import AnomalyClient from './AnomalyClient';

export const dynamic = 'force-dynamic';

export default async function AnomalyDetectionPage() {
  await requireAdminAuth();

  const anomalies = await prisma.aIAnomaly.findMany({
    where: { status: { in: ['Open', 'UnderReview'] } },
    orderBy: [{ riskLevel: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  });

  return <AnomalyClient anomalies={anomalies} />;
}
