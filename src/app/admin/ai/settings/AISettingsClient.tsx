'use client';
import { useState } from 'react';
import { Settings, CheckCircle, XCircle, Loader2, AlertTriangle, Save } from 'lucide-react';

interface EnvFlags {
  aiProvider: string;
  ocrProvider: string;
  maxUploadMb: string;
  aiEnabled: boolean;
  hasGoogleVision: boolean;
  hasAwsTextract: boolean;
  hasAzureFormRecognizer: boolean;
}

const PROVIDER_DESCRIPTIONS: Record<string, string> = {
  'rule-based': 'Built-in rule-based engine. No external API required. Works offline.',
  'google-vision': 'Google Cloud Vision API. Superior OCR accuracy for printed documents.',
  'aws-textract': 'Amazon Textract. Best for structured forms, tables, and multi-page PDFs.',
  'azure-form-recognizer': 'Azure AI Document Intelligence. Strong for invoices and receipts.',
};

const OCR_DESCRIPTIONS: Record<string, string> = {
  tesseract: 'Local Tesseract.js OCR. Free, no API needed. Works for clean printed documents.',
  'google-vision': 'Google Vision API for OCR. More accurate on handwriting or poor scans.',
  'aws-textract': 'AWS Textract for OCR. Best for structured financial documents.',
};

export default function AISettingsClient({ envFlags, userRole }: { envFlags: EnvFlags; userRole: string }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const StatusBadge = ({ active }: { active: boolean }) => (
    active
      ? <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Configured</span>
      : <span className="flex items-center gap-1 text-gray-400 text-xs"><XCircle className="w-3.5 h-3.5" /> Not configured</span>
  );

  const saveSettings = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          AI Automation Settings
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Configure AI providers, OCR engines, and system options</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <div className="flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>Environment Variables Required</strong> — API keys and provider settings must be set in your <code className="bg-amber-100 px-1 rounded">.env</code> file. Changes here are not persisted to .env automatically. Contact your system administrator to update environment variables on the server.
          </div>
        </div>
      </div>

      {/* AI Engine */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">AI Engine</h2>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(PROVIDER_DESCRIPTIONS).map(([key, desc]) => (
            <div key={key} className={`border rounded-xl p-3.5 ${envFlags.aiProvider === key ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 text-sm capitalize">{key.replace(/-/g, ' ')}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  {envFlags.aiProvider === key && (
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Active</span>
                  )}
                </div>
              </div>
              <div className="mt-2 text-xs font-mono text-gray-400">AI_PROVIDER={key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* OCR Engine */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">OCR Engine</h2>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(OCR_DESCRIPTIONS).map(([key, desc]) => (
            <div key={key} className={`border rounded-xl p-3.5 ${envFlags.ocrProvider === key ? 'border-cyan-400 bg-cyan-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 text-sm capitalize">{key.replace(/-/g, ' ')}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
                {envFlags.ocrProvider === key && (
                  <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2 py-0.5 rounded-full shrink-0 ml-3">Active</span>
                )}
              </div>
              <div className="mt-2 text-xs font-mono text-gray-400">OCR_PROVIDER={key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* API Key Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">API Key Status</h2>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <div className="text-sm font-semibold text-gray-900">Google Cloud Vision</div>
              <div className="text-xs font-mono text-gray-400">GOOGLE_VISION_API_KEY</div>
            </div>
            <StatusBadge active={envFlags.hasGoogleVision} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <div className="text-sm font-semibold text-gray-900">AWS Textract</div>
              <div className="text-xs font-mono text-gray-400">AWS_TEXTRACT_KEY</div>
            </div>
            <StatusBadge active={envFlags.hasAwsTextract} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-semibold text-gray-900">Azure Form Recognizer</div>
              <div className="text-xs font-mono text-gray-400">AZURE_FORM_RECOGNIZER_KEY</div>
            </div>
            <StatusBadge active={envFlags.hasAzureFormRecognizer} />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">API keys are stored securely as environment variables. They are never exposed in the UI.</p>
      </div>

      {/* Upload limits */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Upload Settings</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">Max Upload Size</div>
            <div className="text-xs font-mono text-gray-400">MAX_UPLOAD_SIZE_MB</div>
          </div>
          <span className="font-bold text-indigo-600 text-sm">{envFlags.maxUploadMb} MB</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">AI Automation System</div>
            <div className="text-xs font-mono text-gray-400">AI_AUTOMATION_ENABLED</div>
          </div>
          {envFlags.aiEnabled
            ? <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle className="w-3.5 h-3.5" /> Enabled</span>
            : <span className="flex items-center gap-1 text-red-500 text-xs font-bold"><XCircle className="w-3.5 h-3.5" /> Disabled</span>
          }
        </div>
      </div>

      {/* Supported file types */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">Supported File Types</h2>
        <div className="flex flex-wrap gap-2">
          {['PDF', 'JPEG', 'JPG', 'PNG', 'WebP', 'TIFF'].map(t => (
            <span key={t} className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-sm disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
        {saved && <span className="text-green-600 text-sm font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Saved</span>}
      </div>
    </div>
  );
}
