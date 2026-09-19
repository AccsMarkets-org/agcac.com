'use client';
import { useState } from 'react';
import { Settings, Save, CheckCircle } from 'lucide-react';

const FIELDS = [
  { key: 'company_name', label: 'Company Name', type: 'text', section: 'Company' },
  { key: 'company_name_ar', label: 'Company Name (Arabic)', type: 'text', section: 'Company' },
  { key: 'company_phone', label: 'Phone / WhatsApp', type: 'text', section: 'Company' },
  { key: 'company_email', label: 'Email', type: 'email', section: 'Company' },
  { key: 'company_address', label: 'Address', type: 'text', section: 'Company' },
  { key: 'company_trn', label: 'TRN (Tax Registration Number)', type: 'text', section: 'Company' },
  { key: 'company_license', label: 'Trade License Number', type: 'text', section: 'Company' },
  { key: 'whatsapp_number', label: 'WhatsApp CTA Number', type: 'text', section: 'WhatsApp & Notifications' },
  { key: 'whatsapp_message', label: 'WhatsApp Default Message', type: 'text', section: 'WhatsApp & Notifications' },
  { key: 'lead_notification_email', label: 'Lead Alert Email', type: 'email', section: 'WhatsApp & Notifications' },
  { key: 'invoice_footer', label: 'Invoice Footer Text', type: 'textarea', section: 'Finance' },
  { key: 'invoice_bank_details', label: 'Bank Details (for invoices)', type: 'textarea', section: 'Finance' },
  { key: 'invoice_vat_rate', label: 'VAT Rate (%)', type: 'number', section: 'Finance' },
  { key: 'seo_title', label: 'SEO Site Title', type: 'text', section: 'SEO & Meta' },
  { key: 'seo_description', label: 'SEO Meta Description', type: 'textarea', section: 'SEO & Meta' },
  { key: 'google_analytics_id', label: 'Google Analytics ID (GA4)', type: 'text', section: 'SEO & Meta' },
  { key: 'facebook_pixel_id', label: 'Meta / Facebook Pixel ID', type: 'text', section: 'SEO & Meta' },
];

const SECTIONS = Array.from(new Set(FIELDS.map(f => f.section)));

export default function SettingsClient({ initial }: { initial: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false);
    const pairs = Object.entries(values).map(([key, value]) => ({ key, value }));
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: pairs }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else setError('Failed to save settings.');
    setSaving(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 text-sm">Company profile, finance, and integration settings</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save All Settings'}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl px-5 py-3 text-sm">{error}</div>}

      {SECTIONS.map(sec => (
        <div key={sec} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">{sec}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.filter(f => f.section === sec).map(field => (
              <div key={field.key} className={field.type === 'textarea' ? 'col-span-full' : ''}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={values[field.key] ?? ''}
                    onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={values[field.key] ?? ''}
                    onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
