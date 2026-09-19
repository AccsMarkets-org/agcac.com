import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const task = await prisma.aIReviewTask.findFirst({
    where: { OR: [{ id: params.id }, { taskId: params.id }] },
    include: {
      document: {
        include: {
          warnings: true,
        },
      },
    },
  });

  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  return NextResponse.json({ task });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as {
    reviewerNotes?: string;
    extractionEdits?: Record<string, unknown>;
    assignedTo?: string;
    priority?: string;
    status?: string;
  };

  const task = await prisma.aIReviewTask.findFirst({
    where: { OR: [{ id: params.id }, { taskId: params.id }] },
  });
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (body.reviewerNotes !== undefined) updateData.reviewerNotes = body.reviewerNotes;
  if (body.assignedTo !== undefined) {
    updateData.assignedTo = body.assignedTo;
    updateData.assignedAt = new Date();
  }
  if (body.priority !== undefined) updateData.priority = body.priority;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.extractionEdits !== undefined) {
    updateData.extractionEdits = JSON.stringify(body.extractionEdits);
    // Also update the document's extracted data with corrections
    const currentDoc = await prisma.aIDocument.findUnique({ where: { id: task.documentId } });
    if (currentDoc?.extractedData) {
      const existing = JSON.parse(currentDoc.extractedData);
      const merged = { ...existing, ...body.extractionEdits };
      await prisma.aIDocument.update({
        where: { id: task.documentId },
        data: { extractedData: JSON.stringify(merged) },
      });
    }
  }

  const updated = await prisma.aIReviewTask.update({
    where: { id: task.id },
    data: updateData,
  });

  await prisma.aIAuditLog.create({
    data: {
      userId: auth.userId,
      userEmail: auth.email,
      userRole: auth.role,
      action: 'ReviewTaskUpdated',
      module: 'AI',
      recordId: task.id,
      recordType: 'AIReviewTask',
      details: JSON.stringify(body),
    },
  });

  return NextResponse.json({ task: updated });
}
