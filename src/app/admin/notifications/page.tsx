import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import Link from 'next/link';
import { Bell, AlertTriangle, Users, Calendar } from 'lucide-react';

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

export default async function NotificationsPage() {
  const admin = await verifyAuth();
  if (!admin) redirect('/admin/login');

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [newLeads, emergencyLeads, overdueFollowUps, recentActivity] = await Promise.all([
    prisma.lead.findMany({
      where: { deletedAt: null, status: 'New', createdAt: { gte: startOfToday } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.lead.findMany({
      where: { deletedAt: null, urgency: 'Emergency', status: { in: ['New', 'Contacted'] } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.followUp.findMany({
      where: { status: 'Pending', dueAt: { lte: now } },
      include: { lead: { select: { leadId: true, name: true } } },
      take: 10,
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { lead: { select: { leadId: true } } },
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm">Alerts and updates requiring your attention</p>
        </div>
      </div>

      {/* Emergency alerts */}
      {emergencyLeads.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="font-bold text-red-800">{emergencyLeads.length} Active Emergency Request{emergencyLeads.length !== 1 ? 's' : ''}</h2>
          </div>
          <div className="space-y-2">
            {emergencyLeads.map((l) => (
              <div key={l.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                <div>
                  <span className="font-bold text-red-600 text-sm">{l.leadId}</span>
                  <span className="text-gray-600 text-sm ml-2">{l.name}</span>
                  <span className="text-gray-400 text-xs ml-2">{l.service}</span>
                </div>
                <a href={`tel:${l.phone}`} className="text-blue-600 hover:underline text-xs font-semibold">{l.phone}</a>
              </div>
            ))}
          </div>
          <Link href="/admin/emergency-requests" className="text-red-600 hover:underline text-sm font-semibold mt-3 block">
            View all emergency requests →
          </Link>
        </div>
      )}

      {/* Overdue follow-ups */}
      {overdueFollowUps.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-amber-800">{overdueFollowUps.length} Overdue Follow-Up{overdueFollowUps.length !== 1 ? 's' : ''}</h2>
          </div>
          <div className="space-y-2">
            {overdueFollowUps.map((f) => (
              <div key={f.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                <div>
                  <span className="font-bold text-amber-600 text-sm">{f.lead?.leadId ?? '—'}</span>
                  <span className="text-gray-600 text-sm ml-2">{f.lead?.name ?? '—'}</span>
                </div>
                <span className="text-gray-400 text-xs">
                  Due: {new Date(f.dueAt).toLocaleDateString('en-GB')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New leads today */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-500" />
          <h2 className="font-bold text-gray-900">New Leads Today ({newLeads.length})</h2>
        </div>
        {newLeads.length === 0 ? (
          <p className="text-gray-400 text-sm">No new leads today yet.</p>
        ) : (
          <div className="space-y-2">
            {newLeads.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-red-600 font-bold text-xs">{l.leadId}</span>
                  <span className="font-semibold text-gray-800 text-sm">{l.name}</span>
                  <span className="text-gray-400 text-xs hidden sm:block">{l.service}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs">
                    {new Date(l.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <a href={`tel:${l.phone}`} className="text-blue-600 hover:underline text-xs">{l.phone}</a>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link href="/admin/leads" className="text-red-600 hover:underline text-sm font-semibold mt-3 block">
          View all leads →
        </Link>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-gray-400 text-sm">No recent activity.</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">{log.action}</span>
                  <span className="text-gray-600 text-sm">{log.detail ?? '—'}</span>
                </div>
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
        <Link href="/admin/activity" className="text-red-600 hover:underline text-sm font-semibold mt-3 block">
          View full activity log →
        </Link>
      </div>
    </div>
  );
}
