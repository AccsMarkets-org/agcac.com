import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const department = searchParams.get('department') || '';
  const jobType = searchParams.get('jobType') || '';
  const search = searchParams.get('search') || '';

  const jobs = await prisma.careerJob.findMany({
    where: {
      published: true,
      status: 'Open',
      deletedAt: null,
      ...(department ? { department } : {}),
      ...(jobType ? { jobType } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search } },
          { department: { contains: search } },
          { location: { contains: search } },
        ],
      } : {}),
    },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true, title: true, slug: true, department: true,
      location: true, jobType: true, experienceRequired: true,
      salaryRange: true, overview: true, featured: true, closingDate: true,
      createdAt: true,
    },
  });

  return NextResponse.json(jobs);
}
