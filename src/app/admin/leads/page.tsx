import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import LeadsClientPage from './LeadsClient';

async function verifyAuth() {
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

export default async function LeadsPage() {
  const admin = await verifyAuth();
  if (!admin) redirect('/admin/login');

  const leads = await prisma.lead.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      assignedTo: { select: { name: true } },
    },
  });

  const serialized = leads.map((l) => ({
    id: l.id,
    leadId: l.leadId,
    name: l.name,
    phone: l.phone,
    whatsapp: l.whatsapp,
    email: l.email,
    location: l.location,
    area: l.area,
    service: l.service,
    propertyType: l.propertyType,
    urgency: l.urgency,
    status: l.status,
    priority: l.priority,
    message: l.message,
    sourcePage: l.sourcePage,
    leadSource: l.leadSource,
    utmSource: l.utmSource,
    utmMedium: l.utmMedium,
    utmCampaign: l.utmCampaign,
    deviceType: l.deviceType,
    assignedTo: l.assignedTo?.name ?? null,
    internalNotes: l.internalNotes,
    followUpDate: l.followUpDate ? l.followUpDate.toISOString() : null,
    createdAt: l.createdAt.toISOString(),
  }));

  return <LeadsClientPage initialLeads={serialized} />;
}
