import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, requestType, details } = body;

    if (!fullName || !email || !requestType || !details) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validTypes = ['access', 'correction', 'deletion', 'withdrawal', 'other'];
    if (!validTypes.includes(requestType)) {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    const requestId = `DR-${nanoid(8).toUpperCase()}`;

    await prisma.privacyRequest.create({
      data: {
        requestId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        requestType,
        details: details.trim(),
        status: 'pending',
      },
    });

    return NextResponse.json({ ok: true, requestId });
  } catch (err) {
    console.error('Privacy request error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
