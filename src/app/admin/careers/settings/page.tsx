import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import CareerSettingsClient from './CareerSettingsClient';

async function verifyAuth() {
  const c = await cookies();
  const token = c.get('admin_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'alghawas-default-secret-change-in-production');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch { return null; }
}

export default async function CareerSettingsPage() {
  const admin = await verifyAuth();
  if (!admin) redirect('/admin/login');
  return <CareerSettingsClient />;
}
