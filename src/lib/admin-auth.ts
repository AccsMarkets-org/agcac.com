import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

export type AdminPayload = { userId: string; email: string; role: string };

export async function requireAdminAuth(): Promise<AdminPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/admin/login');

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'alghawas-default-secret-change-in-production'
    );
    const { payload } = await jwtVerify(token, secret);
    return payload as AdminPayload;
  } catch {
    redirect('/admin/login');
  }
}
