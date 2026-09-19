import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import { Activity } from 'lucide-react';

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

export default async function ActivityLogPage() {
  const admin = await verifyAuth();
  if (!admin) redirect('/admin/login');

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { lead: { select: { leadId: true, name: true } } },
  });

  const ACTION_COLORS: Record<string, string> = {
    'Lead Created': 'bg-blue-100 text-blue-700',
    'Status Updated': 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Activity className="w-6 h-6 text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-500 text-sm">Full audit trail — last {logs.length} actions</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Activity className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date & Time', 'Action', 'Detail', 'Lead', 'By'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px] truncate">{log.detail ?? '—'}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {log.lead ? (
                        <span className="font-mono text-red-600 font-semibold">{log.lead.leadId}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{log.userName ?? 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
