import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const [byListing, byHolding] = await Promise.all([
    prisma.landListing.groupBy({
      by: ['region'],
      where: { status: 'PUBLISHED' },
      _count: { id: true },
      _avg: { price: true, sizeAcres: true }
    }),
    prisma.landHolding.groupBy({
      by: ['region'],
      _count: { id: true }
    })
  ]);

  const regionMap = {};
  byListing.forEach((r) => {
    regionMap[r.region] = {
      region: r.region,
      listings: r._count.id,
      avgPrice: Math.round(r._avg.price || 0),
      avgSizeAcres: Math.round((r._avg.sizeAcres || 0) * 100) / 100,
      holdings: 0
    };
  });
  byHolding.forEach((r) => {
    if (regionMap[r.region]) {
      regionMap[r.region].holdings = r._count.id;
    } else {
      regionMap[r.region] = {
        region: r.region,
        listings: 0,
        avgPrice: 0,
        avgSizeAcres: 0,
        holdings: r._count.id
      };
    }
  });

  return NextResponse.json({ regions: Object.values(regionMap).sort((a, b) => b.listings - a.listings) });
}