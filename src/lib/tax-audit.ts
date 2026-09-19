import { prisma } from './prisma';

interface AuditParams {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  module?: string;
  recordId?: string;
  recordType?: string;
  description: string;
  beforeValue?: unknown;
  afterValue?: unknown;
}

export async function logTaxAction(params: AuditParams): Promise<void> {
  try {
    await prisma.taxAuditLog.create({
      data: {
        userId: params.userId ?? 'system',
        userEmail: params.userEmail ?? '',
        userRole: params.userRole ?? '',
        action: params.action,
        module: params.module ?? 'Tax',
        recordId: params.recordId ?? null,
        recordType: params.recordType ?? null,
        beforeValue: params.beforeValue ? JSON.stringify(params.beforeValue) : null,
        afterValue: params.afterValue ? JSON.stringify(params.afterValue) : null,
        description: params.description,
      },
    });
  } catch {
    // Non-fatal — don't block the main operation
  }
}
