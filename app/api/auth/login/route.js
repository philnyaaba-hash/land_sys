import { compare } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { createSession, requireSameOrigin, setSessionCookie } from '../../../../lib/office-auth';
import { prisma } from '../../../../lib/prisma';
import { checkRateLimit, clientIp } from '../../../../lib/rate-limit.mjs';

export const runtime = 'nodejs';

// Compared against when the email is unknown so response time does not reveal
// whether an account exists.
const DUMMY_HASH = '$2b$10$RMXKmURNKhU3aM8lX1RKAePvns8ZxSRVtbYwSDFb/hOeroWhZtzg.';
const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const LOGIN_ATTEMPT_LIMIT = 60;

function unauthorized() {
  return NextResponse.json(
    { error: 'Email or password is incorrect.' },
    { status: 401, headers: { 'cache-control': 'no-store' } }
  );
}

export async function POST(request) {
  if (!requireSameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });

  const throttle = checkRateLimit('auth:login:' + clientIp(request), {
    limit: LOGIN_ATTEMPT_LIMIT,
    windowMs: LOGIN_WINDOW_MS
  });
  if (!throttle.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429, headers: { 'retry-after': String(throttle.retryAfter), 'cache-control': 'no-store' } }
    );
  }

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
  if (!user) {
    await compare(password, DUMMY_HASH);
    return unauthorized();
  }
  if (user.status !== 'ACTIVE') {
    await compare(password, user.passwordHash);
    return unauthorized();
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
    const locked = attempts >= 5;
    return NextResponse.json(
      { error: locked ? 'Too many failed attempts. Try again later.' : 'Email or password is incorrect.' },
      {
        status: locked ? 429 : 401,
        headers: locked ? { 'retry-after': '900', 'cache-control': 'no-store' } : { 'cache-control': 'no-store' }
      }
    );
  }

  await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockoutUntil: null, lastLoginAt: now } });
  const token = await createSession(user.id);
  const response = NextResponse.json(
    { ok: true, user: { id: user.id, name: user.name, email: user.email } },
    { headers: { 'cache-control': 'no-store' } }
  );
  return setSessionCookie(response, token);
}
