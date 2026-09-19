'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Phone, MessageCircle, Copy, CheckCircle, X,
  Download, Filter, ChevronDown, FileSpreadsheet, Eye,
  AlertTriangle, Clock, Loader2
} from 'lucide-react';

interface Lead {
  id: string;
  leadId: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  location: string | null;
  area: string | null;
  service: string;
  propertyType: string | null;
  urgency: string;
  status: string;
  priority: string;
  message: string | null;
  sourcePage: string | null;
  leadSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  deviceType: string | null;
  assignedTo: string | null;
  internalNotes: string | null;
  followUpDate: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  New:       { label: 'New',       bg: 'bg-blue-100',   text: 'text-blue-700' },
  Contacted: { label: 'Contacted', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Quoted:    { label: 'Quoted',    bg: 'bg-purple-100', text: 'text-purple-700' },
  Won:       { label: 'Won',       bg: 'bg-green-100',  text: 'text-green-700' },
  Lost:      { label: 'Lost',      bg: 'bg-red-100',    text: 'text-red-700' },
};

const STATUSES = Object.keys(STATUS_CONFIG);

const URGENCY_BADGE: Record<string, string> = {
  Emergency: 'bg-red-600 text-white',
  Urgent:    'bg-orange-500 text-white',
  Normal:    'bg-gray-100 text-gray-600',
};

export default function LeadsClientPage({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [copied, setCopied] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const filtered = useMemo(() => {
    let result = leads;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.leadId.toLowerCase().includes(q) ||
        l.location?.toLowerCase().includes(q) ||
        l.service.toLowerCase().includes(q)
      );
    }
    if (filterStatus) result = result.filter((l) => l.status === filterStatus);
    if (filterService) result = result.filter((l) => l.service.toLowerCase().includes(filterService.toLowerCase()));
    if (filterUrgency) result = result.filter((l) => l.urgency === filterUrgency);
    if (dateFrom) result = result.filter((l) => new Date(l.createdAt) >= new Date(dateFrom));
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((l) => new Date(l.createdAt) <= to);
    }
    return result;
  }, [leads, search, filterStatus, filterService, filterUrgency, dateFrom, dateTo]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/leads/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
        if (selectedLead?.id === id) setSelectedLead((l) => l ? { ...l, status } : l);
      }
    } finally {
      setUpdatingId('');
    }
  };

  const copyPhone = (phone: string, key: string) => {
    navigator.clipboard.writeText(phone);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const exportExcel = () => window.open('/api/leads/export-excel', '_blank');
  const exportCSV = () => window.open('/api/leads/export-csv', '_blank');

  const wa = (phone: string, name: string, leadId: string) =>
    `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
      `Hello ${name}, this is Al Ghawas A/C team. We received your HVAC request (${leadId}). How can we assist you today?`
    )}`;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Leads</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} of {leads.length} leads</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={exportExcel} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            placeholder="Search by name, phone, Lead ID, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {showFilters && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-gray-100">
            <select
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-500"
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
            >
              <option value="">All Urgency</option>
              <option value="Emergency">Emergency</option>
              <option value="Urgent">Urgent</option>
              <option value="Normal">Normal</option>
            </select>
            <input
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Filter by service..."
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
            />
            <input
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-500"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="From date"
            />
            <input
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-500"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="To date"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Lead ID', 'Date', 'Name', 'Phone', 'Service', 'Location', 'Urgency', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    No leads match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => {
                  const sc = STATUS_CONFIG[lead.status] || { bg: 'bg-gray-100', text: 'text-gray-600' };
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-red-600 whitespace-nowrap text-xs">{lead.leadId}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap max-w-[140px] truncate">{lead.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline text-xs">
                          {lead.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs max-w-[130px] truncate">{lead.service}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[110px] truncate">{lead.location || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${URGENCY_BADGE[lead.urgency] || URGENCY_BADGE.Normal}`}>
                          {lead.urgency === 'Emergency' && <AlertTriangle className="w-3 h-3 inline mr-0.5" />}
                          {lead.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {updatingId === lead.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : (
                          <select
                            value={lead.status}
                            onChange={(e) => updateStatus(lead.id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer outline-none ${sc.bg} ${sc.text}`}
                          >
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-600" />
                          </button>
                          <a
                            href={`tel:${lead.phone}`}
                            className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                          </a>
                          <a
                            href={wa(lead.phone, lead.name, lead.leadId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                          </a>
                          <button
                            onClick={() => copyPhone(lead.phone, lead.id)}
                            className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                            title="Copy phone"
                          >
                            {copied === lead.id
                              ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                              : <Copy className="w-3.5 h-3.5 text-gray-400" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead detail slide-over */}
      {selectedLead && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-4"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="bg-white w-full sm:w-[480px] sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-100 z-10">
              <div>
                <div className="font-bold text-gray-900 text-lg">{selectedLead.name}</div>
                <div className="text-red-600 font-semibold text-sm">{selectedLead.leadId}</div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Contact actions */}
              <div className="flex gap-3">
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call
                </a>
                <a
                  href={wa(selectedLead.phone, selectedLead.name, selectedLead.leadId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>

              {/* Status buttons */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Update Status</div>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map((s) => {
                    const c = STATUS_CONFIG[s];
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(selectedLead.id, s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedLead.status === s
                            ? `${c.bg} ${c.text} ring-2 ring-offset-1 ring-current`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Lead ID', selectedLead.leadId],
                  ['Created', new Date(selectedLead.createdAt).toLocaleString('en-GB')],
                  ['Phone', selectedLead.phone],
                  ['Email', selectedLead.email || '—'],
                  ['Location', selectedLead.location || '—'],
                  ['Area', selectedLead.area || '—'],
                  ['Service', selectedLead.service],
                  ['Property Type', selectedLead.propertyType || '—'],
                  ['Urgency', selectedLead.urgency],
                  ['Priority', selectedLead.priority],
                  ['Lead Source', selectedLead.leadSource || '—'],
                  ['Source Page', selectedLead.sourcePage || '—'],
                  ['UTM Source', selectedLead.utmSource || '—'],
                  ['UTM Campaign', selectedLead.utmCampaign || '—'],
                  ['Device', selectedLead.deviceType || '—'],
                  ['Assigned To', selectedLead.assignedTo || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-gray-400 text-[10px] uppercase tracking-wide font-semibold">{k}</div>
                    <div className="text-gray-900 font-semibold text-sm mt-0.5 truncate">{v}</div>
                  </div>
                ))}
              </div>

              {selectedLead.message && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-blue-400 text-[10px] uppercase tracking-wide font-semibold mb-1.5">Customer Message</div>
                  <p className="text-gray-800 text-sm leading-relaxed">{selectedLead.message}</p>
                </div>
              )}

              {selectedLead.internalNotes && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="text-amber-500 text-[10px] uppercase tracking-wide font-semibold mb-1.5">Internal Notes</div>
                  <p className="text-gray-800 text-sm leading-relaxed">{selectedLead.internalNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
