import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

export type AdminPayload = { userId: string; email: string; role: string };

const TAX_ROLES = ['superadmin', 'admin', 'accountant', 'tax manager', 'SuperAdmin', 'Admin', 'Accountant', 'Tax Manager'];

const secret = () => new TextEncoder().encode(
  process.env.JWT_SECRET || 'alghawas-default-secret-change-in-production'
);

export async function requireTaxAuth(): Promise<AdminPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/admin/login');
  try {
    const { payload } = await jwtVerify(token, secret());
    const p = payload as unknown as AdminPayload;
    if (!TAX_ROLES.some(r => r.toLowerCase() === p.role?.toLowerCase())) {
      redirect('/admin?error=no-tax-access');
    }
    return p;
  } catch {
    redirect('/admin/login');
  }
}

export async function verifyTaxToken(req: NextRequest): Promise<AdminPayload | null> {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const p = payload as unknown as AdminPayload;
    if (!TAX_ROLES.some(r => r.toLowerCase() === p.role?.toLowerCase())) return null;
    return p;
  } catch {
    return null;
  }
}

export function isTaxRole(role: string): boolean {
  return TAX_ROLES.some(r => r.toLowerCase() === role?.toLowerCase());
}
