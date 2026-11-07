import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalClients, newClientsWeek, newClientsMonth, activeHoldings, totalReservations] = await Promise.all([
    prisma.clientProfile.count(),
    prisma.clientProfile.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.clientProfile.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.landHolding.count(),
    prisma.landReservation.count()
  ]);

  const recentClients = await prisma.clientProfile.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      companyName: true,
      region: true,
      createdAt: true,
      user: { select: { name: true, email: true, phone: true } },
      _count: { select: { holdings: true, reservations: true } }
    }
  });

  return NextResponse.json({
    totalClients,
    newClientsWeek,
    newClientsMonth,
    activeHoldings,
    totalReservations,
    recentClients,
    generatedAt: now.toISOString()
  });
}