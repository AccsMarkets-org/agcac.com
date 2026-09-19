import { requireAdminAuth } from '@/lib/admin-auth';
import ChatAssistantClient from './ChatAssistantClient';

export const dynamic = 'force-dynamic';

export default async function ChatAssistantPage() {
  const auth = await requireAdminAuth();
  return <ChatAssistantClient userRole={auth.role} />;
}
