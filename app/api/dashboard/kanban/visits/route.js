import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const visits = await prisma.visit.findMany({
    take: 200,
    orderBy: { updatedAt: 'desc' },
    include: {
      visitor: { select: { fullName: true } },
      host: { select: { name: true } }
    }
  });
  return NextResponse.json({
    items: visits.map((v) => ({
      id: v.id,
      title: v.visitCode,
      status: v.status,
      visitor: v.visitor,
      host: v.host,
      type: 'visit'
    }))
  });
}