import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Brain, Upload, Clock, CheckCircle, AlertTriangle, FileText,
  Zap, BarChart3, MessageCircle, Shield, Activity, TrendingUp, RefreshCw
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AIDashboardPage() {
  await requireAdminAuth();

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
    statusBreakdown,
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
      take: 8,
      select: { id: true, action: true, userEmail: true, createdAt: true, details: true },
    }),
    prisma.aIDocument.groupBy({
      by: ['processingStatus'],
      _count: { id: true },
      where: { deletedAt: null },
    }),
  ]);

  const statCards = [
    { label: 'Uploaded Today', value: uploadedToday, icon: Upload, color: 'bg-blue-500', href: '/admin/ai/document-queue' },
    { label: 'Total Documents', value: totalDocs, icon: FileText, color: 'bg-indigo-500', href: '/admin/ai/document-queue' },
    { label: 'Needs Review', value: needsReview, icon: Clock, color: 'bg-amber-500', href: '/admin/ai/review-center', alert: needsReview > 0 },
    { label: 'Approved Today', value: approvedToday, icon: CheckCircle, color: 'bg-green-500', href: '/admin/ai/document-queue?status=Approved' },
    { label: 'Duplicate Warnings', value: duplicateWarnings, icon: AlertTriangle, color: 'bg-red-500', href: '/admin/ai/anomaly-detection', alert: duplicateWarnings > 0 },
    { label: 'VAT Issues', value: vatIssues, icon: Zap, color: 'bg-orange-500', href: '/admin/ai/anomaly-detection', alert: vatIssues > 0 },
    { label: 'Missing TRN', value: missingTRN, icon: Shield, color: 'bg-purple-500', href: '/admin/ai/review-center', alert: missingTRN > 0 },
    { label: 'Low Confidence', value: lowConfidence, icon: BarChart3, color: 'bg-pink-500', href: '/admin/ai/review-center' },
    { label: 'Active Rules', value: activeRules, icon: Brain, color: 'bg-teal-500', href: '/admin/ai/automation-rules' },
    { label: 'AI Suggestions', value: openSuggestions, icon: TrendingUp, color: 'bg-cyan-500', href: '/admin/ai/suggestions', alert: openSuggestions > 0 },
  ];

  const statusColors: Record<string, string> = {
    Uploaded: 'bg-gray-100 text-gray-700',
    Queued: 'bg-blue-100 text-blue-700',
    OCRProcessing: 'bg-yellow-100 text-yellow-700',
    OCRCompleted: 'bg-indigo-100 text-indigo-700',
    Extracted: 'bg-cyan-100 text-cyan-700',
    NeedsReview: 'bg-amber-100 text-amber-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Posted: 'bg-emerald-100 text-emerald-700',
    Failed: 'bg-red-200 text-red-800',
  };

  const riskColors: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-600',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-orange-100 text-orange-700',
    Critical: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-600" />
            AI Automation Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Intelligent invoice processing, OCR, validation, and tax automation for Al Ghawas A/C
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/ai/invoice-upload"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </Link>
          <Link
            href="/admin/ai/chat-assistant"
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            AI Assistant
          </Link>
        </div>
      </div>

      {/* Warning banner */}
      {(needsReview > 0 || duplicateWarnings > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <span className="font-bold">Action required: </span>
            {needsReview > 0 && <span>{needsReview} document(s) waiting for accountant review. </span>}
            {duplicateWarnings > 0 && <span>{duplicateWarnings} duplicate invoice warning(s) detected. </span>}
            <span className="text-amber-600 italic">AI suggestions require accountant review before tax filing or financial posting.</span>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className={`bg-white rounded-2xl border p-4 hover:shadow-md transition-shadow flex flex-col gap-2 ${card.alert ? 'border-red-200' : 'border-gray-200'}`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
              {card.alert && card.value > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              )}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-xs text-gray-500">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Invoice Upload', desc: 'Upload & OCR', href: '/admin/ai/invoice-upload', icon: Upload, color: 'text-purple-600 bg-purple-50' },
          { label: 'Review Center', desc: 'Approve / Reject', href: '/admin/ai/review-center', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Anomaly Detection', desc: 'Issues found', href: '/admin/ai/anomaly-detection', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { label: 'Automation Rules', desc: 'Configure triggers', href: '/admin/ai/automation-rules', icon: Brain, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'AI Suggestions', desc: 'Smart recommendations', href: '/admin/ai/suggestions', icon: TrendingUp, color: 'text-cyan-600 bg-cyan-50' },
          { label: 'Tax Assistant', desc: 'VAT & CT help', href: '/admin/ai/tax-assistant', icon: Shield, color: 'text-teal-600 bg-teal-50' },
          { label: 'Chat Assistant', desc: 'Query CRM data', href: '/admin/ai/chat-assistant', icon: MessageCircle, color: 'text-blue-600 bg-blue-50' },
          { label: 'AI Audit Log', desc: 'All AI actions', href: '/admin/ai/logs', icon: Activity, color: 'text-gray-600 bg-gray-50' },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all flex items-center gap-3 group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{item.label}</div>
              <div className="text-xs text-gray-400">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Processing Status
          </h2>
          {statusBreakdown.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No documents yet</p>
          ) : (
            <div className="space-y-2">
              {statusBreakdown.map(s => (
                <div key={s.processingStatus} className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[s.processingStatus] || 'bg-gray-100 text-gray-600'}`}>
                    {s.processingStatus}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{s._count.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent uploads */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Recent Uploads
          </h2>
          {recentUploads.length === 0 ? (
            <div className="text-center py-6">
              <Upload className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No documents uploaded yet</p>
              <Link href="/admin/ai/invoice-upload" className="text-purple-600 text-xs hover:underline mt-1 block">
                Upload your first document →
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentUploads.map(doc => (
                <Link key={doc.id} href={`/admin/ai/review-center`} className="flex items-start gap-2 hover:bg-gray-50 rounded-lg p-1.5 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate">{doc.originalName}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 rounded-full ${statusColors[doc.processingStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {doc.processingStatus}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {Math.round(doc.confidenceScore)}% conf.
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              <Link href="/admin/ai/document-queue" className="text-xs text-purple-600 hover:underline block text-center pt-1">
                View all documents →
              </Link>
            </div>
          )}
        </div>

        {/* Recent AI suggestions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            AI Suggestions
          </h2>
          {recentSuggestions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No open suggestions</p>
          ) : (
            <div className="space-y-2">
              {recentSuggestions.map(s => (
                <div key={s.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5 ${riskColors[s.riskLevel] || 'bg-gray-100 text-gray-600'}`}>
                    {s.riskLevel}
                  </span>
                  <div className="text-xs text-gray-700 leading-tight">{s.title}</div>
                </div>
              ))}
              <Link href="/admin/ai/suggestions" className="text-xs text-purple-600 hover:underline block text-center pt-1">
                View all suggestions →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent AI Activity Log */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Recent AI Activity
        </h2>
        {recentLogs.length === 0 ? (
          <p className="text-gray-400 text-sm">No AI activity logged yet.</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-gray-800">{log.action}</span>
                  {log.details && <span className="text-gray-500"> — {log.details.substring(0, 80)}{log.details.length > 80 ? '…' : ''}</span>}
                </div>
                <div className="text-xs text-gray-400 shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <Link href="/admin/ai/logs" className="text-xs text-purple-600 hover:underline block text-center pt-2">
              View full audit log →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
