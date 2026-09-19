'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

const FIELDS = [
  { key: 'hr_email', label: 'HR Email', type: 'email', placeholder: 'hr@alghawasac.com' },
  { key: 'hr_whatsapp', label: 'HR WhatsApp Number', type: 'text', placeholder: '971506725808' },
  { key: 'max_upload_mb', label: 'Max Upload File Size (MB)', type: 'number', placeholder: '10' },
  { key: 'careers_hero_title', label: 'Careers Hero Title', type: 'text', placeholder: 'Build Your Career with Al Ghawas...' },
  { key: 'careers_seo_title', label: 'Careers SEO Title', type: 'text', placeholder: 'Careers | Al Ghawas' },
];

const TEXTAREA_FIELDS = [
  { key: 'careers_hero_subtitle', label: 'Careers Hero Subtitle' },
  { key: 'careers_seo_desc', label: 'Careers SEO Description' },
  { key: 'consent_text', label: 'Application Consent Text' },
];

export default function CareerSettingsClient() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/careers/settings')
      .then(r => r.json())
      .then(d => { setSettings(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/careers/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else alert('Save failed');
    } catch { alert('Save error'); } finally { setSaving(false); }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading settings...</div>;

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Career Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure the HR module and public careers page</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">HR Configuration</h2>
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className="text-xs font-medium text-gray-600 block mb-1">{f.label}</label>
            <input
              type={f.type} value={settings[f.key] || ''} placeholder={f.placeholder}
              onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        ))}
        {TEXTAREA_FIELDS.map(f => (
          <div key={f.key}>
            <label className="text-xs font-medium text-gray-600 block mb-1">{f.label}</label>
            <textarea
              value={settings[f.key] || ''} rows={3}
              onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 ${saved ? 'bg-green-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
