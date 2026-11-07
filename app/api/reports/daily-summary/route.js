import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);

  const today = new Date(date + 'T00:00:00');
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    newInquiries,
    newSales,
    paymentsReceived,
    expensesRecorded,
    expectedVisits,
    activeListings
  ] = await Promise.all([
    prisma.landInquiry.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.landReservation.count({ where: { createdAt: { gte: today, lt: tomorrow }, status: 'CONFIRMED' } }),
    prisma.payment.aggregate({
      where: { receivedAt: { gte: today, lt: tomorrow } },
      _sum: { amount: true }
    }),
    prisma.expense.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.visit.count({ where: { status: 'EXPECTED', expectedArrival: { gte: today, lt: tomorrow } } }),
    prisma.landListing.count({ where: { status: 'PUBLISHED' } })
  ]);

  return NextResponse.json({
    date,
    inquiries: newInquiries,
    sales: newSales,
    payments: paymentsReceived._sum.amount || 0,
    expenses: expensesRecorded,
    expectedVisits,
    activeListings,
    generatedAt: new Date().toISOString()
  });
}