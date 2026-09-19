import { requireTaxAuth } from '@/lib/tax-auth';
import LegalPagesClient from './LegalPagesClient';

export default async function LegalPagesAdminPage() {
  await requireTaxAuth();
  return <LegalPagesClient />;
}
