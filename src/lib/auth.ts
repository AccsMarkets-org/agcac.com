import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'alghawas-default-secret-change-in-production'
);

export interface AdminPayload {
  userId: string;
  email: string;
  role: string;
}

export async function signAdminToken(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(request: NextRequest): Promise<AdminPayload | null> {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function loginWithCredentials(
  emailOrUsername: string,
  password: string
): Promise<AdminPayload | null> {
  // Try Prisma DB user first
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { name: emailOrUsername },
        ],
        active: true,
      },
    });

    if (user) {
      const valid = await bcrypt.compare(password, user.password);
      if (valid) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
        return { userId: user.id, email: user.email, role: user.role };
      }
      return null;
    }
  } catch {
    // Prisma unavailable — fall through to env fallback
  }

  // Env-var fallback (dev convenience)
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@alghawasac.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'AlGhawas@2025!';
  if (
    (emailOrUsername === adminUser || emailOrUsername === adminEmail) &&
    password === adminPass
  ) {
    return { userId: 'env-admin', email: adminEmail, role: 'SuperAdmin' };
  }

  return null;
}
