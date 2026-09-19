import { NextRequest, NextResponse } from 'next/server';
import { verifyTaxToken } from '@/lib/tax-auth';
import prisma from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await verifyTaxToken(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status, adminNotes } = await req.json();

  const validStatuses = ['pending', 'in_review', 'resolved', 'rejected'];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const updated = await prisma.privacyRequest.update({
    where: { id: params.id },
    data: {
      ...(status && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
      ...(status === 'resolved' && {
        resolvedBy: admin.email,
        resolvedAt: new Date(),
      }),
    },
  });

  return NextResponse.json({ request: updated });
}
