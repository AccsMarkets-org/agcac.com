import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import Link from 'next/link';
import { Building2, Phone, MessageCircle } from 'lucide-react';

const S: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700', Contacted: 'bg-yellow-100 text-yellow-700',
  Quoted: 'bg-purple-100 text-purple-700', Won: 'bg-green-100 text-green-700', Lost: 'bg-red-100 text-red-700',
};

export default async function ProjectInquiriesPage() {
  await requireAdminAuth();
  const leads = await prisma.lead.findMany({
    where: {
      deletedAt: null,
      OR: [
        { projectCategory: { not: null } },
        { projectName: { not: null } },
        { sourcePage: { contains: 'project' } },
        { service: { contains: 'VRF' } },
        { service: { contains: 'Chilled Water' } },
        { service: { contains: 'Duct' } },
        { propertyType: { contains: 'Commercial' } },
        { propertyType: { contains: 'Industrial' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Building2 className="w-6 h-6 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Inquiries</h1>
          <p className="text-gray-500 text-sm">{leads.length} commercial / industrial project lead{leads.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: leads.length, color: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
          { label: 'New', value: leads.filter(l => l.status === 'New').length, color: 'bg-blue-50 border-blue-100 text-blue-700' },
          { label: 'Quoted', value: leads.filter(l => l.status === 'Quoted').length, color: 'bg-purple-50 border-purple-100 text-purple-700' },
          { label: 'Won', value: leads.filter(l => l.status === 'Won').length, color: 'bg-green-50 border-green-100 text-green-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No project inquiries yet.</p>
          <p className="text-gray-400 text-sm mt-1">Commercial and industrial leads will appear here automatically.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-indigo-50 border-b border-indigo-100">
                <tr>
                  {['Lead ID','Date','Name','Phone','Service','Property','Project','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-indigo-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(l => (
                  <tr key={l.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-red-600 text-xs">{l.leadId}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{l.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a href={`tel:${l.phone}`} className="text-blue-600 hover:underline text-xs">{l.phone}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[120px] truncate">{l.service}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{l.propertyType ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate">{l.projectName ?? l.projectCategory ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${S[l.status] ?? 'bg-gray-100 text-gray-600'}`}>{l.status}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        <a href={`tel:${l.phone}`} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                        </a>
                        <a href={`https://wa.me/${l.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center">
                          <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-xs text-gray-400">
        Matches commercial, industrial, and named-project leads. <Link href="/admin/leads" className="text-red-600 hover:underline">View all leads →</Link>
      </p>
    </div>
  );
}
