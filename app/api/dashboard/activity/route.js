import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push(d);
  }

  const dateRanges = days.map((d, idx) => {
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end, label: d.toLocaleDateString(undefined, { weekday: 'short' }) };
  });

  const [inquiries, reservations, payments] = await Promise.all([
    prisma.landInquiry.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: dateRanges[0].start } },
      _count: { id: true }
    }),
    prisma.landReservation.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: dateRanges[0].start } },
      _count: { id: true }
    }),
    prisma.payment.groupBy({
      by: ['createdAt'],
      where: { status: 'PAID', createdAt: { gte: dateRanges[0].start } },
      _sum: { amount: true }
    })
  ]);

  const bucket = (records, key = '_count') => {
    const map = {};
    dateRanges.forEach(({ label }) => { map[label] = 0; });
    records.forEach((r) => {
      const day = new Date(r.createdAt).toLocaleDateString(undefined, { weekday: 'short' });
      if (map[day] !== undefined) {
        map[day] += key === '_sum' ? (r._sum.amount || 0) : (r._count.id || 0);
      }
    });
    return Object.entries(map);
  };

  return NextResponse.json({
    labels: dateRanges.map((d) => d.label),
    inquiries: bucket(inquiries),
    reservations: bucket(reservations),
    payments: bucket(payments, '_sum')
  });
}