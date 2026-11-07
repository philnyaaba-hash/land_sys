import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const [expectedToday, checkedInNow, checkedOutToday, pendingApproval] = await Promise.all([
    prisma.visit.findMany({
      where: { status: 'EXPECTED', expectedArrival: { gte: today, lt: tomorrow } },
      include: { host: { select: { id: true, name: true, email: true } }, department: { select: { id: true, name: true } } },
      orderBy: { expectedArrival: 'asc' },
      take: 50
    }),
    prisma.visit.findMany({
      where: { status: 'CHECKED_IN' },
      include: { visitor: { select: { id: true, fullName: true, phone: true } }, host: { select: { id: true, name: true } } },
      orderBy: { checkedInAt: 'asc' },
      take: 50
    }),
    prisma.visit.count({ where: { status: 'CHECKED_OUT', checkedOutAt: { gte: today } } }),
    prisma.visit.count({ where: { status: 'AWAITING_APPROVAL' } })
  ]);

  return NextResponse.json({
    expectedToday,
    checkedInNow,
    checkedOutToday,
    pendingApproval,
    generatedAt: now.toISOString()
  });
}