import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VALID_STATUSES = ['New', 'Contacted', 'Quoted', 'Won', 'Lost', 'No Response'];
const VALID_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json() as {
      id: string;
      status?: string;
      priority?: string;
      assignedToId?: string | null;
      followUpDate?: string | null;
      internalNotes?: string;
    };

    const { id, status, priority, assignedToId, followUpDate, internalNotes } = body;
    if (!id) return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    if (status && !VALID_STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    if (priority && !VALID_PRIORITIES.includes(priority)) return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

    const lead = await prisma.lead.update({ where: { id }, data: updateData });

    if (status) {
      await prisma.activityLog.create({
        data: { leadId: id, action: 'Status Updated', detail: `→ ${status}`, userId: auth.userId, userName: auth.email },
      });
    }

    return NextResponse.json({ success: true, lead });
  } catch {
    return NextResponse.json({ error: 'Lead not found or server error' }, { status: 404 });
  }
}
