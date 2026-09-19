import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { anonymousId, essential, analytics, advertising, functional, userAgent } = body;

    if (!anonymousId) {
      return NextResponse.json({ error: 'Missing anonymousId' }, { status: 400 });
    }

    const existing = await prisma.cookieConsent.findFirst({ where: { anonymousId } });
    if (existing) {
      await prisma.cookieConsent.update({
        where: { id: existing.id },
        data: {
          essential: !!essential,
          analytics: !!analytics,
          advertising: !!advertising,
          functional: !!functional,
          userAgent: userAgent || null,
          consentTimestamp: new Date(),
        },
      });
    } else {
      await prisma.cookieConsent.create({
        data: {
          anonymousId,
          essential: !!essential,
          analytics: !!analytics,
          advertising: !!advertising,
          functional: !!functional,
          userAgent: userAgent || null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Cookie consent error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
