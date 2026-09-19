import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  const jobs = await prisma.careerJob.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search } },
          { department: { contains: search } },
        ],
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { applications: { where: { deletedAt: null } } } } },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.title || !body.department) return NextResponse.json({ error: 'title and department required' }, { status: 400 });

  const baseSlug = toSlug(body.title);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.careerJob.findFirst({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const job = await prisma.careerJob.create({
    data: {
      title: body.title,
      slug: body.slug || slug,
      department: body.department,
      location: body.location || 'Abu Dhabi, UAE',
      jobType: body.jobType || 'Full-Time',
      experienceRequired: body.experienceRequired || '1-3 years',
      salaryRange: body.salaryRange || null,
      overview: body.overview || '',
      responsibilities: body.responsibilities || '',
      requirements: body.requirements || '',
      preferredSkills: body.preferredSkills || null,
      requiredDocuments: body.requiredDocuments || null,
      benefits: body.benefits || null,
      status: body.status || 'Draft',
      featured: !!body.featured,
      published: !!body.published,
      closingDate: body.closingDate ? new Date(body.closingDate) : null,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      createdBy: auth.email,
      updatedBy: auth.email,
    },
  });

  return NextResponse.json(job, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const job = await prisma.careerJob.update({
    where: { id: body.id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.slug && { slug: body.slug }),
      ...(body.department && { department: body.department }),
      ...(body.location && { location: body.location }),
      ...(body.jobType && { jobType: body.jobType }),
      ...(body.experienceRequired !== undefined && { experienceRequired: body.experienceRequired }),
      ...(body.salaryRange !== undefined && { salaryRange: body.salaryRange }),
      ...(body.overview !== undefined && { overview: body.overview }),
      ...(body.responsibilities !== undefined && { responsibilities: body.responsibilities }),
      ...(body.requirements !== undefined && { requirements: body.requirements }),
      ...(body.preferredSkills !== undefined && { preferredSkills: body.preferredSkills }),
      ...(body.requiredDocuments !== undefined && { requiredDocuments: body.requiredDocuments }),
      ...(body.benefits !== undefined && { benefits: body.benefits }),
      ...(body.status && { status: body.status }),
      ...(body.featured !== undefined && { featured: !!body.featured }),
      ...(body.published !== undefined && { published: !!body.published }),
      ...(body.closingDate !== undefined && { closingDate: body.closingDate ? new Date(body.closingDate) : null }),
      ...(body.seoTitle !== undefined && { seoTitle: body.seoTitle }),
      ...(body.seoDescription !== undefined && { seoDescription: body.seoDescription }),
      updatedBy: auth.email,
    },
  });

  return NextResponse.json(job);
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminToken(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.careerJob.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
