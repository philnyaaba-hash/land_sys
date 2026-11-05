import { NextResponse } from 'next/server';
import { clearSessionCookie, currentUser, requireSameOrigin } from '../../../../lib/office-auth';

export const runtime = 'nodejs';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}

export async function DELETE(request) {
  if (!requireSameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  return clearSessionCookie(NextResponse.json({ ok: true }));
}
