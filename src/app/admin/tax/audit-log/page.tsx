import { requireTaxAuth } from '@/lib/tax-auth';
import { prisma } from '@/lib/prisma';

export default async function TaxAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; page?: string }>;
}) {
  await requireTaxAuth();
  const sp = await searchParams;
  const page = parseInt(sp.page ?? '1', 10);
  const pageSize = 50;
  const module = sp.module ?? '';

  const where = module ? { module } : {};
  const [logs, total] = await Promise.all([
    prisma.taxAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.taxAuditLog.count({ where }),
  ]);

  const modules = await prisma.taxAuditLog.groupBy({ by: ['module'], _count: true });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tax Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">Complete audit trail of all tax module actions</p>
      </div>

      {/* Module filter */}
      <div className="flex gap-2 flex-wrap">
        <a href="/admin/tax/audit-log"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!module ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          All ({total})
        </a>
        {modules.map(m => (
          <a key={m.module} href={`/admin/tax/audit-log?module=${encodeURIComponent(m.module)}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${module === m.module ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {m.module} ({m._count})
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Timestamp</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Module</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-gray-400">No audit log entries yet</td></tr>
            )}
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString('en-AE', { dateStyle: 'short', timeStyle: 'medium' })}
                </td>
                <td className="px-4 py-3 text-xs text-gray-700 max-w-[140px] truncate">{log.userEmail || log.userId}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 font-medium">{log.userRole}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-blue-50 rounded text-xs text-blue-700 font-medium">{log.module}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    log.action.includes('CREATE') || log.action.includes('ADD') ? 'bg-green-100 text-green-700' :
                    log.action.includes('DELETE') || log.action.includes('REJECT') ? 'bg-red-100 text-red-600' :
                    log.action.includes('UPDATE') || log.action.includes('EDIT') ? 'bg-amber-100 text-amber-700' :
                    log.action.includes('SUBMIT') || log.action.includes('APPROVE') ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{log.action}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 max-w-[300px] truncate">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <a href={`/admin/tax/audit-log?${module ? `module=${module}&` : ''}page=${page - 1}`}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">← Prev</a>
            )}
            {page * pageSize < total && (
              <a href={`/admin/tax/audit-log?${module ? `module=${module}&` : ''}page=${page + 1}`}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">Next →</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
