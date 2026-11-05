import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { createSession, requireSameOrigin, setSessionCookie } from '../../../../lib/office-auth';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!requireSameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });

  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request must contain valid JSON.' }, { status: 400 });
  }

  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const password = typeof input.password === 'string' ? input.password : '';
  if (!email || email.length > 254 || !password || password.length > 200) {
    return NextResponse.json({ error: 'Enter a valid email address and password.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const now = new Date();
  if (!user || user.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
  }
  if (user.lockoutUntil && user.lockoutUntil > now) {
    return NextResponse.json({ error: 'Too many failed attempts. Try again later.' }, {
      status: 429,
      headers: { 'retry-after': String(Math.ceil((user.lockoutUntil - now) / 1000)) }
    });
  }

  const matches = await compare(password, user.passwordHash);
  if (!matches) {
    const attempts = user.failedLoginAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts >= 5 ? 0 : attempts,
        lockoutUntil: attempts >= 5 ? new Date(now.getTime() + 15 * 60 * 1000) : null
      }
    });
    return NextResponse.json({ error: attempts >= 5 ? 'Too many failed attempts. Try again later.' : 'Email or password is incorrect.' }, {
      status: attempts >= 5 ? 429 : 401
    });
  }

  await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockoutUntil: null, lastLoginAt: now } });
  const token = await createSession(user.id);
  const response = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
  return setSessionCookie(response, token);
}
