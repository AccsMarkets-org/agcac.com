import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const app = await prisma.jobApplication.findUnique({
    where: { id },
    include: {
      job: true,
      candidate: true,
      documents: true,
      notes: { orderBy: { createdAt: 'desc' } },
      interviews: { include: { interviewer: { select: { name: true } } }, orderBy: { interviewDate: 'desc' } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(app);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.action === 'add-note') {
    const note = await prisma.applicationNote.create({
      data: { applicationId: id, authorName: auth.email, note: body.note },
    });
    return NextResponse.json(note);
  }

  if (body.action === 'schedule-interview') {
    const app = await prisma.jobApplication.findUnique({ where: { id } });
    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const interview = await prisma.interview.create({
      data: {
        applicationId: id,
        candidateId: app.candidateId || undefined,
        jobId: app.jobId || undefined,
        interviewDate: new Date(body.interviewDate),
        interviewTime: body.interviewTime || null,
        mode: body.mode || 'In-person',
        location: body.location || null,
        interviewerId: body.interviewerId || null,
        status: 'Scheduled',
        notes: body.notes || null,
      },
    });

    // Update application status
    await prisma.jobApplication.update({ where: { id }, data: { status: 'Interview Scheduled' } });
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: id,
        fromStatus: app.status,
        toStatus: 'Interview Scheduled',
        changedBy: auth.email,
        note: 'Interview scheduled',
      },
    });

    return NextResponse.json(interview);
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
