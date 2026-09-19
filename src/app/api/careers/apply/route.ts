import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function nextAppId(): Promise<string> {
  const count = await prisma.jobApplication.count();
  return `APP-${String(count + 1).padStart(4, '0')}`;
}

async function nextCandId(): Promise<string> {
  const count = await prisma.candidate.count();
  return `CAND-${String(count + 1).padStart(4, '0')}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.fullName || !body.phone || !body.email || !body.positionApplied) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    // Upsert candidate record
    let candidate = await prisma.candidate.findFirst({ where: { phone: body.phone } });
    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          candidateId: await nextCandId(),
          fullName: body.fullName,
          phone: body.phone,
          whatsapp: body.whatsapp || null,
          email: body.email,
          nationality: body.nationality || null,
          currentLocation: body.currentLocation || null,
          visaStatus: body.visaStatus || null,
          yearsExperience: body.yearsExperience || null,
          skills: body.skills || null,
        },
      });
    }

    const applicationId = await nextAppId();

    const application = await prisma.jobApplication.create({
      data: {
        applicationId,
        jobId: body.jobId || null,
        candidateId: candidate.id,
        fullName: body.fullName,
        phone: body.phone,
        whatsapp: body.whatsapp || null,
        email: body.email,
        nationality: body.nationality || null,
        currentLocation: body.currentLocation || null,
        visaStatus: body.visaStatus || null,
        yearsExperience: body.yearsExperience || null,
        positionApplied: body.positionApplied,
        department: body.department || null,
        currentSalary: body.currentSalary || null,
        expectedSalary: body.expectedSalary || null,
        noticePeriod: body.noticePeriod || null,
        drivingLicense: !!body.drivingLicense,
        skills: body.skills || null,
        message: body.message || null,
        consentGiven: !!body.consentGiven,
        consentText: body.consentText || null,
        status: 'New',
      },
    });

    // Save documents
    if (Array.isArray(body.documents) && body.documents.length > 0) {
      await prisma.candidateDocument.createMany({
        data: body.documents.map((d: { storedName: string; fileName: string; fileType: string; fileSize: number; documentType: string }) => ({
          applicationId: application.id,
          candidateId: candidate!.id,
          fileName: d.fileName,
          fileType: d.fileType,
          fileUrl: `/api/careers/file/${d.storedName}`,
          fileSize: d.fileSize || 0,
          documentType: d.documentType || 'CV',
        })),
      });
    }

    return NextResponse.json({ applicationId, success: true });
  } catch (e) {
    console.error('Application error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
