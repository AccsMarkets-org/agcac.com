import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FileText, Upload, Eye, Clock, CheckCircle, AlertTriangle, XCircle, Brain } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DocumentQueuePage({ searchParams }: { searchParams: { status?: string; page?: string } }) {
  await requireAdminAuth();

  const status = searchParams.status || '';
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.processingStatus = status;

  const [docs, total] = await Promise.all([
    prisma.aIDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        warnings: { select: { severity: true }, where: { resolved: false } },
        reviewTasks: { select: { status: true }, take: 1, orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.aIDocument.count({ where }),
  ]);

  const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Needs Review', value: 'NeedsReview' },
    { label: 'Extracted', value: 'Extracted' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Failed', value: 'Failed' },
  ];

  const statusColors: Record<string, string> = {
    Uploaded: 'bg-gray-100 text-gray-700',
    Queued: 'bg-blue-100 text-blue-700',
    OCRProcessing: 'bg-yellow-100 text-yellow-700',
    OCRCompleted: 'bg-indigo-100 text-indigo-700',
    AIProcessing: 'bg-violet-100 text-violet-700',
    Extracted: 'bg-cyan-100 text-cyan-700',
    NeedsReview: 'bg-amber-100 text-amber-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Posted: 'bg-emerald-100 text-emerald-700',
    Failed: 'bg-red-200 text-red-800',
  };

  const confidenceColor = (c: number) => c >= 85 ? 'text-green-600' : c >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Document Queue
          </h1>
          <p className="text-gray-500 text-sm">{total} total documents</p>
        </div>
        <Link
          href="/admin/ai/invoice-upload"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map(tab => (
          <Link
            key={tab.value}
            href={`/admin/ai/document-queue${tab.value ? `?status=${tab.value}` : ''}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              status === tab.value ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {docs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Brain className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-500">No documents found</h3>
          <p className="text-sm text-gray-400 mt-1">Upload an invoice to start AI processing.</p>
          <Link href="/admin/ai/invoice-upload" className="mt-4 inline-flex items-center gap-2 bg-purple-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-purple-700 transition-colors">
            <Upload className="w-4 h-4" /> Upload Document
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Document</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Confidence</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Warnings</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Uploaded</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {docs.map(doc => {
                  const ed = doc.extractedData ? JSON.parse(doc.extractedData) : {};
                  const criticalCount = doc.warnings.filter(w => w.severity === 'Critical' || w.severity === 'Error').length;
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                          <div>
                            <div className="font-medium text-gray-900 max-w-[180px] truncate">{doc.originalName}</div>
                            <div className="text-xs text-gray-400">{doc.docId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-gray-600">{doc.documentType}</span>
                        {ed.supplier?.name && <div className="text-xs text-gray-400 mt-0.5 max-w-[120px] truncate">{ed.supplier.name}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[doc.processingStatus] || 'bg-gray-100 text-gray-600'}`}>
                          {doc.processingStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${confidenceColor(doc.confidenceScore)}`}>
                          {doc.confidenceScore.toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {doc.warnings.length === 0 ? (
                          <span className="text-green-500 text-xs">None</span>
                        ) : (
                          <span className={`text-xs font-semibold ${criticalCount > 0 ? 'text-red-600' : 'text-amber-600'}`}>
                            {doc.warnings.length} issue{doc.warnings.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(doc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}<br/>
                        {new Date(doc.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href="/admin/ai/review-center"
                          className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">Page {page} of {Math.ceil(total / limit)}</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/admin/ai/document-queue?page=${page - 1}${status ? `&status=${status}` : ''}`}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                    Previous
                  </Link>
                )}
                {page < Math.ceil(total / limit) && (
                  <Link href={`/admin/ai/document-queue?page=${page + 1}${status ? `&status=${status}` : ''}`}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700">
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
