import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import {
  Users, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Phone, MessageCircle, FileText, ClipboardList, Wrench, Receipt
} from 'lucide-react';
import Link from 'next/link';

async function getAdminPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'alghawas-default-secret-change-in-production');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

async function getDashboardStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalLeads, newLeads, todayLeads, monthLeads,
    wonLeads, inProgressLeads,
    urgentLeads, followUpsDue,
    activeSiteVisits, activeAMC,
    pendingJobs, pendingInvoices,
    recentLeads
  ] = await Promise.all([
    prisma.lead.count({ where: { deletedAt: null } }),
    prisma.lead.count({ where: { deletedAt: null, status: 'New' } }),
    prisma.lead.count({ where: { deletedAt: null, createdAt: { gte: startOfToday } } }),
    prisma.lead.count({ where: { deletedAt: null, createdAt: { gte: startOfMonth } } }),
    prisma.lead.count({ where: { deletedAt: null, status: 'Won' } }),
    prisma.lead.count({ where: { deletedAt: null, status: { in: ['Contacted', 'Quoted'] } } }),
    prisma.lead.count({ where: { deletedAt: null, urgency: 'Emergency' } }),
    prisma.followUp.count({ where: { status: 'Pending', dueAt: { lte: new Date() } } }),
    prisma.siteVisit.count({ where: { status: 'Scheduled' } }),
    prisma.aMCContract.count({ where: { status: 'Active' } }),
    prisma.technicianJob.count({ where: { status: 'Assigned' } }),
    prisma.invoice.count({ where: { status: 'Unpaid' } }),
    prisma.lead.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true, leadId: true, name: true, phone: true,
        service: true, status: true, urgency: true,
        location: true, createdAt: true,
      },
    }),
  ]);

  return {
    totalLeads, newLeads, todayLeads, monthLeads,
    wonLeads, inProgressLeads, urgentLeads, followUpsDue,
    activeSiteVisits, activeAMC, pendingJobs, pendingInvoices,
    recentLeads,
  };
}

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-yellow-100 text-yellow-700',
  Quoted: 'bg-purple-100 text-purple-700',
  Won: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-700',
};

export default async function AdminDashboardPage() {
  const admin = await getAdminPayload();
  if (!admin) redirect('/admin/login');

  const stats = await getDashboardStats();

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Al Ghawas A/C Refrigeration Contracting LLC — CRM Overview</p>
      </div>

      {/* Primary KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Total Leads</div>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-4xl font-black">{stats.totalLeads}</div>
          <div className="text-gray-400 text-xs mt-1">{stats.monthLeads} this month</div>
        </div>

        <div className="bg-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-blue-200 text-xs font-semibold uppercase tracking-wide">New Leads</div>
            <TrendingUp className="w-5 h-5 text-blue-300" />
          </div>
          <div className="text-4xl font-black">{stats.newLeads}</div>
          <div className="text-blue-200 text-xs mt-1">{stats.todayLeads} today</div>
        </div>

        <div className="bg-green-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-green-200 text-xs font-semibold uppercase tracking-wide">Won Jobs</div>
            <CheckCircle className="w-5 h-5 text-green-300" />
          </div>
          <div className="text-4xl font-black">{stats.wonLeads}</div>
          <div className="text-green-200 text-xs mt-1">{stats.inProgressLeads} in progress</div>
        </div>

        <div className="bg-red-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-red-200 text-xs font-semibold uppercase tracking-wide">Urgent</div>
            <AlertTriangle className="w-5 h-5 text-red-300" />
          </div>
          <div className="text-4xl font-black">{stats.urgentLeads}</div>
          <div className="text-red-200 text-xs mt-1">{stats.followUpsDue} follow-ups due</div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Site Visits Scheduled', value: stats.activeSiteVisits, icon: <Clock className="w-4 h-4" />, href: '/admin/site-visits', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active AMC Contracts', value: stats.activeAMC, icon: <ClipboardList className="w-4 h-4" />, href: '/admin/amc-contracts', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Technician Jobs', value: stats.pendingJobs, icon: <Wrench className="w-4 h-4" />, href: '/admin/technician-jobs', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Unpaid Invoices', value: stats.pendingInvoices, icon: <Receipt className="w-4 h-4" />, href: '/admin/invoices', color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, icon, href, color, bg }) => (
          <Link key={href} href={href} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
              {icon}
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{value}</div>
              <div className="text-gray-500 text-xs mt-0.5">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/admin/leads" className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center group-hover:bg-red-600 transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900">Manage Leads</div>
            <div className="text-gray-400 text-xs mt-0.5">View, filter, update all leads</div>
          </div>
        </Link>

        <Link href="/admin/emergency-requests" className="bg-red-50 border border-red-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900">Emergency Requests</div>
            <div className="text-gray-400 text-xs mt-0.5">Urgent AC breakdown calls</div>
          </div>
        </Link>

        <Link href="/admin/amc-contracts" className="bg-amber-50 border border-amber-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900">AMC Contracts</div>
            <div className="text-gray-400 text-xs mt-0.5">Annual maintenance agreements</div>
          </div>
        </Link>
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Leads</h2>
          <Link href="/admin/leads" className="text-sm text-red-600 hover:text-red-700 font-semibold">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Lead ID', 'Date', 'Name', 'Phone', 'Service', 'Location', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No leads yet. Leads from the website will appear here.
                  </td>
                </tr>
              ) : (
                stats.recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-red-600 whitespace-nowrap text-xs">{lead.leadId}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{lead.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[130px] truncate">{lead.service}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[110px] truncate">{lead.location || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[11px] font-semibold ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
