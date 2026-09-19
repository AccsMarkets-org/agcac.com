import { requireTaxAuth } from '@/lib/tax-auth';
import UploadOCRClient from './UploadOCRClient';

export default async function UploadPage() {
  const user = await requireTaxAuth();
  return <UploadOCRClient userEmail={user.email} userRole={user.role} />;
}
