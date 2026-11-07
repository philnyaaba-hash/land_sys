import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const requests = await prisma.serviceRequest.findMany({
    take: 200,
    orderBy: { updatedAt: 'desc' },
    include: {
      client: { select: { name: true } },
      assignedTo: { select: { name: true } }
    }
  });
  return NextResponse.json({
    items: requests.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      clientId: r.client?.name || '—',
      host: r.assignedTo?.name || 'Unassigned',
      type: 'service'
    }))
  });
}