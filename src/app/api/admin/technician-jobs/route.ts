import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function nextJobId() {
  const last = await prisma.technicianJob.findFirst({ orderBy: { jobId: 'desc' } });
  const num = last ? parseInt(last.jobId.replace('JOB-', '')) + 1 : 1;
  return `JOB-${String(num).padStart(4, '0')}`;
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status) where.status = status;
  if (search) where.OR = [
    { customerName: { contains: search } },
    { phone: { contains: search } },
    { jobId: { contains: search } },
    { location: { contains: search } },
    { service: { contains: search } },
    { technicianName: { contains: search } },
  ];

  const jobs = await prisma.technicianJob.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(jobs.map(j => ({
    ...j,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
    jobDate: j.jobDate?.toISOString() ?? null,
  })));
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const jobId = await nextJobId();

  const job = await prisma.technicianJob.create({
    data: {
      jobId,
      leadId: body.leadId ?? null,
      customerName: body.customerName,
      phone: body.phone,
      location: body.location,
      service: body.service,
      jobDate: body.jobDate ? new Date(body.jobDate) : null,
      jobTime: body.jobTime ?? null,
      technicianName: body.technicianName ?? null,
      materials: body.materials ?? null,
      notes: body.notes ?? null,
      workNotes: body.workNotes ?? null,
      completionReport: body.completionReport ?? null,
      status: body.status ?? 'Assigned',
    },
  });

  return NextResponse.json({
    ...job,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    jobDate: job.jobDate?.toISOString() ?? null,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const job = await prisma.technicianJob.update({
    where: { id: body.id },
    data: {
      customerName: body.customerName,
      phone: body.phone,
      location: body.location,
      service: body.service,
      jobDate: body.jobDate ? new Date(body.jobDate) : null,
      jobTime: body.jobTime ?? null,
      technicianName: body.technicianName ?? null,
      materials: body.materials ?? null,
      notes: body.notes ?? null,
      workNotes: body.workNotes ?? null,
      completionReport: body.completionReport ?? null,
      status: body.status ?? 'Assigned',
    },
  });

  return NextResponse.json({
    ...job,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    jobDate: job.jobDate?.toISOString() ?? null,
  });
}
