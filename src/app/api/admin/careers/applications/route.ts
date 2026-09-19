import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const jobId = searchParams.get('jobId') || '';
  const search = searchParams.get('search') || '';

  const apps = await prisma.jobApplication.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(jobId ? { jobId } : {}),
      ...(search ? {
        OR: [
          { fullName: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
          { positionApplied: { contains: search } },
        ],
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      job: { select: { title: true, department: true } },
      documents: { select: { id: true, documentType: true, fileName: true, fileUrl: true, fileType: true } },
    },
  });

  return NextResponse.json(apps);
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const current = await prisma.jobApplication.findUnique({ where: { id: body.id } });
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const app = await prisma.jobApplication.update({
    where: { id: body.id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.rating !== undefined && { rating: Number(body.rating) }),
      ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId }),
    },
    include: {
      job: { select: { title: true, department: true } },
      documents: { select: { id: true, documentType: true, fileName: true, fileUrl: true, fileType: true } },
    },
  });

  // Log status change
  if (body.status && body.status !== current.status) {
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: body.id,
        fromStatus: current.status,
        toStatus: body.status,
        changedBy: auth.email,
        note: body.statusNote || null,
      },
    });
  }

  return NextResponse.json(app);
}
