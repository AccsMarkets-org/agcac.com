import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/admin/login'];
const ADMIN_PREFIX = '/admin';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect admin routes
  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  // Allow login page and static files
  if (PUBLIC_PATHS.some(p => pathname === p)) {
    return NextResponse.next();
  }

  // Allow API routes — each API route does its own auth check
  if (pathname.startsWith('/admin') && pathname.includes('/api/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'alghawas-default-secret-change-in-production'
    );
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('admin_token');
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
