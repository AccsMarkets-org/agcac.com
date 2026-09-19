import { requireAdminAuth } from '@/lib/admin-auth';
import InvoiceUploadClient from './InvoiceUploadClient';

export default async function InvoiceUploadPage() {
  const auth = await requireAdminAuth();
  const allowedRoles = ['SuperAdmin', 'Admin', 'Accountant', 'TaxManager', 'Manager'];
  const canUpload = allowedRoles.includes(auth.role);
  return <InvoiceUploadClient canUpload={canUpload} userRole={auth.role} />;
}
