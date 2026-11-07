import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalListings,
    publishedListings,
    draftListings,
    newInquiries,
    newReservations,
    confirmedReservations,
    monthlyRevenue,
    pendingVisits,
    checkedInVisits,
    activeUsers,
    pendingInvoices,
    overdueExpenses
  ] = await Promise.all([
    prisma.landListing.count(),
    prisma.landListing.count({ where: { status: 'PUBLISHED' } }),
    prisma.landListing.count({ where: { status: 'DRAFT' } }),
    prisma.landInquiry.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.landReservation.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.landReservation.count({ where: { status: 'CONFIRMED', createdAt: { gte: weekAgo } } }),
    prisma.payment.aggregate({
      where: { receivedAt: { gte: monthStart } },
      _sum: { amount: true }
    }),
    prisma.visit.count({ where: { status: 'EXPECTED', expectedArrival: { gte: today, lt: tomorrow } } }),
    prisma.visit.count({ where: { status: 'CHECKED_IN' } }),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.invoice.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
    prisma.expense.count({ where: { status: 'PENDING' } })
  ]);

  return NextResponse.json({
    totalListings,
    publishedListings,
    draftListings,
    newInquiries,
    newReservations,
    confirmedReservations,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    pendingVisits,
    checkedInVisits,
    activeUsers,
    pendingInvoices,
    overdueExpenses,
    generatedAt: now.toISOString()
  });
}