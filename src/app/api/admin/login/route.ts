import { NextRequest, NextResponse } from 'next/server';
import { signAdminToken, loginWithCredentials } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { username?: string; email?: string; password: string };
    const identifier = body.email || body.username || '';
    const { password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const payload = await loginWithCredentials(identifier, password);
    if (!payload) {
      await new Promise((r) => setTimeout(r, 600)); // brute-force delay
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signAdminToken(payload);
    const response = NextResponse.json({ success: true, role: payload.role });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
