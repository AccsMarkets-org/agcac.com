import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, Phone, MessageCircle, Mail, MapPin, Calendar,
  User, Tag, Clock, FileText, Activity, AlertTriangle,
} from 'lucide-react';
import LeadDetailClient from './LeadDetailClient';

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  await requireAdminAuth();

  const lead = await prisma.lead.findFirst({
    where: { OR: [{ id: params.id }, { leadId: params.id }], deletedAt: null },
    include: {
      assignedTo: { select: { id: true, name: true } },
      followUps: { orderBy: { dueAt: 'asc' } },
      callLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
      siteVisits: { orderBy: { visitDate: 'asc' }, take: 5, include: { assignedTech: { select: { name: true } } } },
      quotations: { orderBy: { createdAt: 'desc' }, take: 5 },
      activityLog: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });

  if (!lead) notFound();

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Back + header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/leads" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Leads
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-900">{lead.leadId}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(lead.name)}%2C%20this%20is%20Al%20Ghawas%20A%2FC.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        </div>
      </div>

      {/* Urgency banner */}
      {lead.urgency === 'Emergency' && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-red-700 font-bold text-sm">EMERGENCY REQUEST — Requires immediate attention</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Lead info */}
        <div className="xl:col-span-2 space-y-5">
          {/* Contact card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{lead.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    lead.status === 'Won' ? 'bg-green-100 text-green-700 border-green-200' :
                    lead.status === 'Lost' ? 'bg-red-100 text-red-700 border-red-200' :
                    lead.status === 'Quoted' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                    lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-blue-100 text-blue-700 border-blue-200'
                  }`}>{lead.status}</span>
                  {lead.urgency !== 'Normal' && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      lead.urgency === 'Emergency' ? 'bg-red-600 text-white' : 'bg-orange-100 text-orange-700'
                    }`}>{lead.urgency}</span>
                  )}
                  <span className="text-gray-400 text-xs">{lead.leadId}</span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-400">
                <div>{new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div>{new Date(lead.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Phone, label: 'Phone', value: lead.phone, href: `tel:${lead.phone}` },
                { icon: MessageCircle, label: 'WhatsApp', value: lead.whatsapp || lead.phone, href: `https://wa.me/${(lead.whatsapp || lead.phone).replace(/\D/g,'')}` },
                { icon: Mail, label: 'Email', value: lead.email || '—', href: lead.email ? `mailto:${lead.email}` : undefined },
                { icon: MapPin, label: 'Location', value: [lead.location, lead.area].filter(Boolean).join(', ') || '—', href: undefined },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">{label}</div>
                    {href && value !== '—' ? (
                      <a href={href} className="text-sm font-medium text-red-600 hover:underline">{value}</a>
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Service Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Service', value: lead.service },
                { label: 'Property Type', value: lead.propertyType || '—' },
                { label: 'Project Type', value: lead.projectType || '—' },
                { label: 'Rooms', value: lead.numberOfRooms || '—' },
                { label: 'Area (sqft)', value: lead.approximateArea || '—' },
                { label: 'AC Units', value: lead.numberOfACUnits || '—' },
                { label: 'Existing System', value: lead.existingSystem || '—' },
                { label: 'Budget Range', value: lead.budgetRange || '—' },
                { label: 'Project Name', value: lead.projectName || '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                  <div className="text-sm font-semibold text-gray-900">{value}</div>
                </div>
              ))}
            </div>
            {lead.message && (
              <div className="mt-5">
                <div className="text-xs text-gray-400 mb-1">Message</div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">{lead.message}</div>
              </div>
            )}
          </div>

          {/* Tracking */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Lead Tracking</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Source Page', value: lead.sourcePage || '—' },
                { label: 'Form Name', value: lead.formName || '—' },
                { label: 'Lead Source', value: lead.leadSource || '—' },
                { label: 'UTM Source', value: lead.utmSource || '—' },
                { label: 'UTM Medium', value: lead.utmMedium || '—' },
                { label: 'UTM Campaign', value: lead.utmCampaign || '—' },
                { label: 'GCLID', value: lead.gclid ? '✓ Present' : '—' },
                { label: 'FBCLID', value: lead.fbclid ? '✓ Present' : '—' },
                { label: 'Device', value: lead.deviceType || '—' },
                { label: 'Browser', value: lead.browser || '—' },
                { label: 'CTA Clicked', value: lead.ctaClicked || '—' },
                { label: 'Referrer', value: lead.referrer || '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                  <div className="font-medium text-gray-900 text-xs">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity log */}
          {lead.activityLog.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Activity Log
              </h2>
              <div className="space-y-3">
                {lead.activityLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700">{log.action}</span>
                      {log.detail && <div className="text-xs text-gray-400 mt-0.5">{log.detail}</div>}
                    </div>
                    <div className="text-xs text-gray-400 shrink-0">
                      {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions panel */}
        <div className="space-y-5">
          <LeadDetailClient
            lead={{
              id: lead.id,
              leadId: lead.leadId,
              status: lead.status,
              priority: lead.priority,
              assignedTo: lead.assignedTo ? { id: lead.assignedTo.id, name: lead.assignedTo.name } : null,
              followUpDate: lead.followUpDate ? lead.followUpDate.toISOString() : null,
              internalNotes: lead.internalNotes,
            }}
            users={users}
          />

          {/* Linked quotations */}
          {lead.quotations.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Quotations
              </h2>
              <div className="space-y-2">
                {lead.quotations.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <div>
                      <div className="font-semibold text-gray-900">{q.quoteId}</div>
                      <div className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString('en-GB')}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      q.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                      q.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{q.status}</span>
                  </div>
                ))}
              </div>
              <Link href="/admin/quotations" className="text-xs text-red-600 hover:underline mt-2 block">
                View all quotations →
              </Link>
            </div>
          )}

          {/* Site visits */}
          {lead.siteVisits.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Site Visits
              </h2>
              <div className="space-y-2">
                {lead.siteVisits.map((sv) => (
                  <div key={sv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {sv.visitDate ? new Date(sv.visitDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}
                      </div>
                      <div className="text-xs text-gray-400">{sv.assignedTech?.name || 'Unassigned'}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      sv.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      sv.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{sv.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-ups */}
          {lead.followUps.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Follow-ups
              </h2>
              <div className="space-y-2">
                {lead.followUps.map((fu) => (
                  <div key={fu.id} className="p-3 bg-gray-50 rounded-xl text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-900">Follow-up</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        fu.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>{fu.status}</span>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(fu.dueAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    {fu.note && <div className="text-xs text-gray-600 mt-1">{fu.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
