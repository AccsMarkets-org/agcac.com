import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import Link from 'next/link';
import { AlertTriangle, Phone, MessageCircle } from 'lucide-react';

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'alghawas-default-secret-change-in-production');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch { return null; }
}

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700', Contacted: 'bg-yellow-100 text-yellow-700',
  Quoted: 'bg-purple-100 text-purple-700', Won: 'bg-green-100 text-green-700', Lost: 'bg-red-100 text-red-700',
};

export default async function EmergencyRequestsPage() {
  const admin = await verifyAuth();
  if (!admin) redirect('/admin/login');

  const leads = await prisma.lead.findMany({
    where: { deletedAt: null, urgency: 'Emergency' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Requests</h1>
          <p className="text-gray-500 text-sm">{leads.length} urgent AC breakdown request{leads.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No emergency requests at the moment.</p>
          <p className="text-gray-400 text-sm mt-1">Emergency leads from the website will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-50 border-b border-red-100">
                <tr>
                  {['Lead ID', 'Date & Time', 'Name', 'Phone', 'Service', 'Location', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-red-700 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-red-50/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-red-600 text-xs whitespace-nowrap">{lead.leadId}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{lead.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline text-xs">{lead.phone}</a>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[130px] truncate">{lead.service}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[110px] truncate">{lead.location ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        <a href={`tel:${lead.phone}`} className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors" title="Call">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                        </a>
                        <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.name}, this is Al Ghawas A/C. We received your EMERGENCY request (${lead.leadId}). Our team is responding now.`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors" title="WhatsApp">
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
        Filtered to urgency = Emergency. <Link href="/admin/leads" className="text-red-600 hover:underline">View all leads →</Link>
      </p>
    </div>
  );
}
