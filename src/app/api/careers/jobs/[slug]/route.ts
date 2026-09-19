import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await prisma.careerJob.findFirst({
    where: { slug, published: true, status: 'Open', deletedAt: null },
  });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const related = await prisma.careerJob.findMany({
    where: { published: true, status: 'Open', deletedAt: null, department: job.department, slug: { not: slug } },
    take: 3,
    select: { id: true, title: true, slug: true, department: true, location: true, jobType: true },
  });

  return NextResponse.json({ job, related });
}
