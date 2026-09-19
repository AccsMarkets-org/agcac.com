import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import Link from 'next/link';
import { Phone, MessageCircle } from 'lucide-react';

const S: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700', Contacted: 'bg-yellow-100 text-yellow-700',
  Quoted: 'bg-purple-100 text-purple-700', Won: 'bg-green-100 text-green-700', Lost: 'bg-red-100 text-red-700',
};

export default async function CallLeadsPage() {
  await requireAdminAuth();
  const leads = await prisma.lead.findMany({
    where: {
      deletedAt: null,
      OR: [
        { leadSource: { contains: 'call' } },
        { ctaClicked: { contains: 'call' } },
        { sourcePage: { contains: 'call' } },
        { formName: { contains: 'call' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Phone className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Call Leads</h1>
            <p className="text-gray-500 text-sm">{leads.length} lead{leads.length !== 1 ? 's' : ''} from phone enquiries</p>
          </div>
        </div>
        <a href="tel:+971506725808"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          <Phone className="w-4 h-4" /> +971 50 672 5808
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Call Leads', value: leads.length, color: 'bg-blue-50 border-blue-100 text-blue-700' },
          { label: 'New / Pending', value: leads.filter(l => l.status === 'New').length, color: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
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
          <Phone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No call leads yet.</p>
          <p className="text-gray-400 text-sm mt-1">Leads generated via call buttons will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b border-blue-100">
                <tr>
                  {['Lead ID','Date','Name','Phone','Service','Location','Source','Status','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-blue-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(l => (
                  <tr key={l.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-red-600 text-xs">{l.leadId}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{l.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a href={`tel:${l.phone}`} className="text-blue-600 hover:underline text-xs font-semibold">{l.phone}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[130px] truncate">{l.service}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[100px] truncate">{l.location ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{l.ctaClicked ?? l.leadSource ?? '—'}</td>
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
        Filtered to call-origin leads. <Link href="/admin/leads" className="text-red-600 hover:underline">View all leads →</Link>
      </p>
    </div>
  );
}
