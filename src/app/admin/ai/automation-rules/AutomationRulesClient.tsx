'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Zap } from 'lucide-react';

interface Rule {
  id: string;
  ruleId: string;
  name: string;
  description: string | null;
  trigger: string;
  conditions: string;
  actions: string;
  priority: number;
  active: boolean;
  runCount: number;
  createdAt: Date | string;
}

const TRIGGERS = [
  { value: 'OnUpload', label: 'On Document Upload' },
  { value: 'OnExtraction', label: 'On AI Extraction Complete' },
  { value: 'OnApproval', label: 'On Document Approved' },
  { value: 'OnRejection', label: 'On Document Rejected' },
  { value: 'OnPaymentUpload', label: 'On Payment Proof Uploaded' },
  { value: 'OnDuplicateDetected', label: 'On Duplicate Detected' },
];

const CONDITION_FIELDS = ['supplierName', 'documentType', 'totalAmount', 'uploadedByRole', 'hasWarnings', 'hasDuplicate', 'vatAmount'];
const OPERATORS = ['contains', 'equals', 'greaterThan', 'lessThan', 'isEmpty', 'isNotEmpty', 'isTrue'];
const ACTION_TYPES = [
  'RequireSuperAdminApproval', 'SendToReviewCenter', 'AutoAssignCategory',
  'BlockApproval', 'CreatePaymentReminder', 'NotifyAccountant', 'LinkToAMC',
  'FlagAsDuplicate', 'SetHighPriority',
];

const EXAMPLE_RULES = [
  {
    name: 'Flag large invoices for Super Admin',
    description: 'If invoice total > AED 10,000, require Super Admin approval',
    trigger: 'OnUpload',
    conditions: [{ field: 'totalAmount', operator: 'greaterThan', value: '10000' }],
    actions: [{ type: 'RequireSuperAdminApproval', value: '' }],
    priority: 10,
  },
  {
    name: 'Auto-flag missing TRN',
    description: 'If supplier TRN is empty, send to review center with high priority',
    trigger: 'OnExtraction',
    conditions: [{ field: 'supplierName', operator: 'isNotEmpty', value: '' }, { field: 'hasWarnings', operator: 'isTrue', value: 'true' }],
    actions: [{ type: 'SendToReviewCenter', value: '' }, { type: 'SetHighPriority', value: '' }],
    priority: 9,
  },
  {
    name: 'Block duplicate invoice approval',
    description: 'If duplicate is detected, block approval',
    trigger: 'OnApproval',
    conditions: [{ field: 'hasDuplicate', operator: 'isTrue', value: 'true' }],
    actions: [{ type: 'BlockApproval', value: '' }],
    priority: 100,
  },
  {
    name: 'Etisalat → Utilities category',
    description: 'If supplier contains Etisalat, auto-set category to Utilities - Telecom',
    trigger: 'OnExtraction',
    conditions: [{ field: 'supplierName', operator: 'contains', value: 'etisalat' }],
    actions: [{ type: 'AutoAssignCategory', value: 'Utilities - Telecom' }],
    priority: 5,
  },
];

export default function AutomationRulesClient({ rules: initial, userRole }: { rules: Rule[]; userRole: string }) {
  const router = useRouter();
  const [rules, setRules] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState('OnUpload');
  const [conditions, setConditions] = useState([{ field: 'supplierName', operator: 'contains', value: '' }]);
  const [actions, setActions] = useState([{ type: 'SendToReviewCenter', value: '' }]);
  const [priority, setPriority] = useState(0);

  const canEdit = ['SuperAdmin', 'Admin', 'Accountant'].includes(userRole);

  const addFromExample = (example: typeof EXAMPLE_RULES[0]) => {
    setName(example.name);
    setDescription(example.description);
    setTrigger(example.trigger);
    setConditions(example.conditions);
    setActions(example.actions);
    setPriority(example.priority);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    if (!name.trim()) return alert('Rule name required');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/ai/automation-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, trigger, conditions, actions, priority, active: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setRules(prev => [data.rule, ...prev]);
        setShowForm(false);
        setName(''); setDescription(''); setConditions([{ field: 'supplierName', operator: 'contains', value: '' }]);
        setActions([{ type: 'SendToReviewCenter', value: '' }]);
      } else {
        alert(data.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/admin/ai/automation-rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !active } : r));
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    await fetch(`/api/admin/ai/automation-rules/${id}`, { method: 'DELETE' });
    setRules(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Automation Rules
          </h1>
          <p className="text-gray-500 text-sm">{rules.filter(r => r.active).length} active rules</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Rule
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && canEdit && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-600" /> New Automation Rule</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Rule Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Flag large invoices" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Trigger</label>
              <select value={trigger} onChange={e => setTrigger(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="What does this rule do?" />
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Conditions (ALL must match)</label>
              <button onClick={() => setConditions(p => [...p, { field: 'supplierName', operator: 'contains', value: '' }])} className="text-xs text-indigo-600 hover:underline">+ Add Condition</button>
            </div>
            {conditions.map((cond, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select value={cond.field} onChange={e => setConditions(p => p.map((c, j) => j === i ? { ...c, field: e.target.value } : c))} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs">
                  {CONDITION_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select value={cond.operator} onChange={e => setConditions(p => p.map((c, j) => j === i ? { ...c, operator: e.target.value } : c))} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs">
                  {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <input value={cond.value} onChange={e => setConditions(p => p.map((c, j) => j === i ? { ...c, value: e.target.value } : c))} placeholder="value" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
                {conditions.length > 1 && <button onClick={() => setConditions(p => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Actions (execute all)</label>
              <button onClick={() => setActions(p => [...p, { type: 'NotifyAccountant', value: '' }])} className="text-xs text-indigo-600 hover:underline">+ Add Action</button>
            </div>
            {actions.map((act, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select value={act.type} onChange={e => setActions(p => p.map((a, j) => j === i ? { ...a, type: e.target.value } : a))} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs">
                  {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <input value={act.value} onChange={e => setActions(p => p.map((a, j) => j === i ? { ...a, value: e.target.value } : a))} placeholder="value (optional)" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
                {actions.length > 1 && <button onClick={() => setActions(p => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-sm disabled:opacity-50 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Save Rule
            </button>
            <button onClick={() => setShowForm(false)} className="border border-gray-200 text-gray-600 px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Existing rules */}
      {rules.length > 0 ? (
        <div className="space-y-3">
          {rules.map(rule => {
            const conds = JSON.parse(rule.conditions) as Array<{ field: string; operator: string; value: string }>;
            const acts = JSON.parse(rule.actions) as Array<{ type: string; value?: string }>;
            return (
              <div key={rule.id} className={`bg-white rounded-2xl border p-4 ${rule.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{rule.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {rule.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{rule.trigger}</span>
                      <span className="text-xs text-gray-400">Priority: {rule.priority}</span>
                      <span className="text-xs text-gray-400">Runs: {rule.runCount}</span>
                    </div>
                    {rule.description && <div className="text-sm text-gray-500 mt-1">{rule.description}</div>}
                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                      <span className="font-medium text-gray-500">IF:</span>
                      {conds.map((c, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{c.field} {c.operator} {c.value}</span>
                      ))}
                      <span className="font-medium text-gray-500 ml-2">THEN:</span>
                      {acts.map((a, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{a.type}{a.value ? `: ${a.value}` : ''}</span>
                      ))}
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleActive(rule.id, rule.active)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                        {rule.active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button onClick={() => deleteRule(rule.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
          No automation rules yet. Create one above or use an example below.
        </div>
      )}

      {/* Example rules */}
      {canEdit && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Quick-Start Example Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXAMPLE_RULES.map((ex, i) => (
              <button
                key={i}
                onClick={() => addFromExample(ex)}
                className="text-left bg-white rounded-xl border border-gray-200 p-3 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <div className="font-semibold text-gray-900 text-sm">{ex.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{ex.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
