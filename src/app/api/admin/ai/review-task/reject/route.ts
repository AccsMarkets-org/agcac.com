import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as { taskId: string; reason: string };
  const { taskId, reason } = body;
  if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 });
  if (!reason) return NextResponse.json({ error: 'Rejection reason required' }, { status: 400 });

  const task = await prisma.aIReviewTask.findFirst({
    where: { OR: [{ id: taskId }, { taskId }] },
  });
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  await prisma.aIReviewTask.update({
    where: { id: task.id },
    data: {
      status: 'Rejected',
      reviewerNotes: reason,
      resolvedAt: new Date(),
      resolvedBy: auth.email,
      actionTaken: `Rejected: ${reason}`,
    },
  });

  await prisma.aIDocument.update({
    where: { id: task.documentId },
    data: {
      processingStatus: 'Rejected',
      reviewStatus: 'Rejected',
      rejectionReason: reason,
      reviewedBy: auth.email,
      reviewedAt: new Date(),
    },
  });

  await prisma.aIAuditLog.create({
    data: {
      userId: auth.userId,
      userEmail: auth.email,
      userRole: auth.role,
      action: 'DocumentRejected',
      module: 'AI',
      recordId: task.documentId,
      recordType: 'AIDocument',
      reason,
      details: `Rejected by ${auth.email}: ${reason}`,
    },
  });

  return NextResponse.json({ success: true, message: 'Document rejected and logged.' });
}
