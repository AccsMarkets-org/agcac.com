import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const s = await prisma.aISuggestion.findFirst({ where: { OR: [{ id: params.id }, { suggestionId: params.id }] } });
  if (!s) return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });

  await prisma.aISuggestion.update({
    where: { id: s.id },
    data: { status: 'Accepted', acceptedBy: auth.email, acceptedAt: new Date() },
  });

  await prisma.aIAuditLog.create({
    data: {
      userId: auth.userId, userEmail: auth.email, userRole: auth.role,
      action: 'SuggestionAccepted', module: 'AI', recordId: s.id, recordType: 'AISuggestion',
      details: `Suggestion "${s.title}" accepted`,
    },
  });

  return NextResponse.json({ success: true });
}
