import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [
    uploadedToday,
    totalDocs,
    needsReview,
    approvedToday,
    duplicateWarnings,
    vatIssues,
    missingTRN,
    lowConfidence,
    activeRules,
    openSuggestions,
    recentUploads,
    recentSuggestions,
    recentLogs,
  ] = await Promise.all([
    prisma.aIDocument.count({ where: { createdAt: { gte: today }, deletedAt: null } }),
    prisma.aIDocument.count({ where: { deletedAt: null } }),
    prisma.aIDocument.count({ where: { processingStatus: { in: ['Extracted', 'NeedsReview'] }, reviewStatus: 'Pending', deletedAt: null } }),
    prisma.aIDocument.count({ where: { approvedAt: { gte: today } } }),
    prisma.aIAnomaly.count({ where: { type: 'DuplicateInvoice', status: 'Open' } }),
    prisma.aIAnomaly.count({ where: { type: 'VATMismatch', status: 'Open' } }),
    prisma.aIValidationWarning.count({ where: { type: 'MissingTRN', resolved: false } }),
    prisma.aIDocument.count({ where: { confidenceScore: { lt: 60 }, processingStatus: { not: 'Rejected' }, deletedAt: null } }),
    prisma.aIAutomationRule.count({ where: { active: true } }),
    prisma.aISuggestion.count({ where: { status: 'Open' } }),
    prisma.aIDocument.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, docId: true, originalName: true, documentType: true, processingStatus: true, confidenceScore: true, createdAt: true },
    }),
    prisma.aISuggestion.findMany({
      where: { status: 'Open' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, suggestionId: true, type: true, title: true, riskLevel: true, createdAt: true },
    }),
    prisma.aIAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, action: true, userEmail: true, module: true, createdAt: true, details: true },
    }),
  ]);

  // Doc status breakdown
  const statusBreakdown = await prisma.aIDocument.groupBy({
    by: ['processingStatus'],
    _count: { id: true },
    where: { deletedAt: null },
  });

  // Doc type breakdown
  const typeBreakdown = await prisma.aIDocument.groupBy({
    by: ['documentType'],
    _count: { id: true },
    where: { deletedAt: null },
  });

  return NextResponse.json({
    stats: {
      uploadedToday,
      totalDocs,
      needsReview,
      approvedToday,
      duplicateWarnings,
      vatIssues,
      missingTRN,
      lowConfidence,
      activeRules,
      openSuggestions,
    },
    charts: {
      statusBreakdown: statusBreakdown.map(s => ({ status: s.processingStatus, count: s._count.id })),
      typeBreakdown: typeBreakdown.map(t => ({ type: t.documentType, count: t._count.id })),
    },
    recentUploads,
    recentSuggestions,
    recentLogs,
  });
}
