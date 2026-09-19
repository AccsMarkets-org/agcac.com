import { requireAdminAuth } from '@/lib/admin-auth';
import AISettingsClient from './AISettingsClient';

export const dynamic = 'force-dynamic';

export default async function AISettingsPage() {
  const auth = await requireAdminAuth();
  if (!['SuperAdmin', 'Admin'].includes(auth.role)) {
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        Access denied. SuperAdmin or Admin required.
      </div>
    );
  }

  const envFlags = {
    aiProvider: process.env.AI_PROVIDER || 'rule-based',
    ocrProvider: process.env.OCR_PROVIDER || 'tesseract',
    maxUploadMb: process.env.MAX_UPLOAD_SIZE_MB || '20',
    aiEnabled: process.env.AI_AUTOMATION_ENABLED !== 'false',
    hasGoogleVision: !!process.env.GOOGLE_VISION_API_KEY,
    hasAwsTextract: !!process.env.AWS_TEXTRACT_KEY,
    hasAzureFormRecognizer: !!process.env.AZURE_FORM_RECOGNIZER_KEY,
  };

  return <AISettingsClient envFlags={envFlags} userRole={auth.role} />;
}
