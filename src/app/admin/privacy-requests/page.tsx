import { requireTaxAuth } from '@/lib/tax-auth';
import prisma from '@/lib/prisma';
import PrivacyRequestsClient from './PrivacyRequestsClient';

export default async function PrivacyRequestsPage() {
  await requireTaxAuth();

  const requests = await prisma.privacyRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return <PrivacyRequestsClient initialRequests={requests} />;
}
