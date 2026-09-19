import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import SuggestionsClient from './SuggestionsClient';

export const dynamic = 'force-dynamic';

export default async function SuggestionsPage() {
  await requireAdminAuth();

  const suggestions = await prisma.aISuggestion.findMany({
    where: { status: 'Open' },
    orderBy: [{ riskLevel: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  });

  return <SuggestionsClient suggestions={suggestions} />;
}
