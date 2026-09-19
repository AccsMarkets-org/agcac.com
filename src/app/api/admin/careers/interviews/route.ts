import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';

  const interviews = await prisma.interview.findMany({
    where: status ? { status } : {},
    orderBy: { interviewDate: 'asc' },
    include: {
      application: { select: { applicationId: true, fullName: true, positionApplied: true, phone: true } },
      job: { select: { title: true, department: true } },
      interviewer: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(interviews);
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const interview = await prisma.interview.update({
    where: { id: body.id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.result !== undefined && { result: body.result }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.interviewDate && { interviewDate: new Date(body.interviewDate) }),
      ...(body.interviewTime !== undefined && { interviewTime: body.interviewTime }),
      ...(body.mode && { mode: body.mode }),
      ...(body.location !== undefined && { location: body.location }),
    },
  });

  return NextResponse.json(interview);
}
