'use client';
import { useState } from 'react';
import { Save, UserCheck, Calendar, StickyNote, CheckCircle } from 'lucide-react';

interface Props {
  lead: {
    id: string;
    leadId: string;
    status: string;
    priority: string;
    assignedTo: { id: string; name: string } | null;
    followUpDate: string | null;
    internalNotes: string | null;
  };
  users: { id: string; name: string; email: string; role: string }[];
}

const STATUSES = ['New', 'Contacted', 'Quoted', 'Won', 'Lost', 'No Response'];
const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];
const STATUS_COLORS: Record<string, string> = {
  New: 'border-blue-400 bg-blue-50 text-blue-700',
  Contacted: 'border-yellow-400 bg-yellow-50 text-yellow-700',
  Quoted: 'border-purple-400 bg-purple-50 text-purple-700',
  Won: 'border-green-400 bg-green-50 text-green-700',
  Lost: 'border-red-400 bg-red-50 text-red-700',
  'No Response': 'border-gray-400 bg-gray-50 text-gray-600',
};

export default function LeadDetailClient({ lead, users }: Props) {
  const [status, setStatus] = useState(lead.status);
  const [priority, setPriority] = useState(lead.priority);
  const [assignedToId, setAssignedToId] = useState(lead.assignedTo?.id || '');
  const [followUpDate, setFollowUpDate] = useState(
    lead.followUpDate ? lead.followUpDate.split('T')[0] : ''
  );
  const [notes, setNotes] = useState(lead.internalNotes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/leads/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          status,
          priority,
          assignedToId: assignedToId || null,
          followUpDate: followUpDate || null,
          internalNotes: notes,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Lead Actions</h2>

      {/* Status */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Status</label>
        <div className="grid grid-cols-2 gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                status === s ? STATUS_COLORS[s] || 'border-gray-400 bg-gray-50 text-gray-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Priority</label>
        <div className="flex gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                priority === p
                  ? p === 'Urgent' ? 'bg-red-600 text-white border-red-600'
                    : p === 'High' ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Assign to */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1.5">
          <UserCheck className="w-3 h-3" /> Assign To
        </label>
        <select
          value={assignedToId}
          onChange={e => setAssignedToId(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">— Unassigned —</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
          ))}
        </select>
      </div>

      {/* Follow-up date */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1.5">
          <Calendar className="w-3 h-3" /> Follow-up Date
        </label>
        <input
          type="date"
          value={followUpDate}
          onChange={e => setFollowUpDate(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Internal notes */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block flex items-center gap-1.5">
          <StickyNote className="w-3 h-3" /> Internal Notes
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          placeholder="Add internal notes about this lead…"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className={`w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl text-sm transition-all ${
          saved ? 'bg-green-500 text-white' : 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-60'
        }`}
      >
        {saved ? (
          <><CheckCircle className="w-4 h-4" /> Saved!</>
        ) : (
          <><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}</>
        )}
      </button>
    </div>
  );
}
