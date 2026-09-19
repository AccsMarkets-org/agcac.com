'use client';
import { useState } from 'react';

interface Setting { id: string; key: string; value: string; category: string; description: string | null; updatedAt: string | null }

const DEFAULTS: Omit<Setting, 'id' | 'updatedAt'>[] = [
  { key: 'company_name', value: 'Al Ghawas A/C Refrigeration Contracting LLC', category: 'company', description: 'Legal company name' },
  { key: 'company_trn', value: '', category: 'company', description: 'UAE Tax Registration Number (15 digits)' },
  { key: 'company_trade_license', value: '', category: 'company', description: 'Trade License Number' },
  { key: 'vat_registered', value: 'no', category: 'company', description: 'Is the company VAT registered? (yes/no)' },
  { key: 'vat_registration_date', value: '', category: 'company', description: 'VAT registration effective date' },
  { key: 'ct_registered', value: 'no', category: 'company', description: 'Corporate Tax registered? (yes/no)' },
  { key: 'ct_registration_number', value: '', category: 'company', description: 'Corporate Tax registration number' },
  { key: 'financial_year_end', value: '12-31', category: 'company', description: 'Financial year end (MM-DD)' },
  { key: 'vat_return_period', value: 'Quarterly', category: 'vat', description: 'VAT return filing period' },
  { key: 'standard_vat_rate', value: '5', category: 'vat', description: 'Standard VAT rate %' },
  { key: 'ct_threshold_0pct', value: '375000', category: 'ct', description: 'Corporate Tax 0% threshold (AED)' },
  { key: 'ct_rate_above_threshold', value: '9', category: 'ct', description: 'Corporate Tax rate above threshold %' },
];

export default function TaxSettingsClient({ settings }: { settings: Setting[] }) {
  const merged = DEFAULTS.map(d => {
    const existing = settings.find(s => s.key === d.key);
    return existing ?? { ...d, id: '', updatedAt: null };
  });

  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(merged.map(s => [s.key, s.value]))
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/tax/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: Object.entries(values).map(([key, value]) => ({ key, value })) }),
      });
      if (!res.ok) throw new Error('Save failed');
      setMsg('Settings saved successfully');
    } catch {
      setMsg('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const groups = ['company', 'vat', 'ct'];
  const groupLabels: Record<string, string> = { company: 'Company Registration', vat: 'VAT Settings', ct: 'Corporate Tax Settings' };

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tax Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure company tax registration details and filing parameters</p>
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {msg}
        </div>
      )}

      {groups.map(grp => (
        <div key={grp} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">{groupLabels[grp]}</h2>
          <div className="space-y-4">
            {merged.filter(s => s.category === grp).map(s => (
              <div key={s.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {s.description ?? s.key}
                </label>
                {s.key === 'vat_registered' || s.key === 'ct_registered' ? (
                  <select
                    value={values[s.key]}
                    onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                ) : s.key === 'vat_return_period' ? (
                  <select
                    value={values[s.key]}
                    onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                ) : (
                  <input
                    type={s.key.includes('date') ? 'date' : 'text'}
                    value={values[s.key]}
                    onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                    placeholder={s.key === 'company_trn' ? '15-digit TRN' : ''}
                    maxLength={s.key === 'company_trn' ? 15 : undefined}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                <p className="text-xs text-gray-400 mt-0.5">Key: {s.key}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-60 transition-colors"
      >
        {saving ? 'Saving...' : 'Save All Settings'}
      </button>
    </div>
  );
}
