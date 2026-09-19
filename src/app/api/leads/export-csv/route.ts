import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const leads = await prisma.lead.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  const headers = [
    'Lead ID', 'Date', 'Name', 'Phone', 'Email', 'Location',
    'Service', 'Property Type', 'Urgency', 'Priority', 'Status',
    'Source Page', 'Lead Source', 'UTM Source', 'UTM Medium', 'UTM Campaign',
    'UTM Term', 'UTM Content', 'GCLID', 'FBCLID',
    'Device', 'Browser', 'IP Address', 'Message', 'Notes',
  ];

  function esc(val: unknown): string {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  const rows = leads.map((l) => [
    l.leadId,
    l.createdAt.toLocaleDateString('en-GB'),
    l.name, l.phone, l.email ?? '',
    l.location ?? '', l.service,
    l.propertyType ?? '', l.urgency, l.priority, l.status,
    l.sourcePage ?? '', l.leadSource ?? '',
    l.utmSource ?? '', l.utmMedium ?? '', l.utmCampaign ?? '',
    l.utmTerm ?? '', l.utmContent ?? '', l.gclid ?? '', l.fbclid ?? '',
    l.deviceType ?? '', l.browser ?? '', l.ipAddress ?? '',
    l.message ?? '', l.internalNotes ?? '',
  ].map(esc).join(','));

  const csv = [headers.join(','), ...rows].join('\r\n');
  const filename = `AlGhawas_Leads_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
