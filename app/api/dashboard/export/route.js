import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toCsv(rows, columns) {
  const header = columns.join(',');
  const lines = rows.map((row) =>
    columns.map((col) => {
      const val = row[col] ?? '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
    }).join(',')
  );
  return [header, ...lines].join('\n');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'listings';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const dateFilter = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lt = new Date(to);
  const hasDateFilter = Object.keys(dateFilter).length > 0;

  let data = [];
  let columns = [];
  let filename = '';

  if (type === 'listings') {
    data = await prisma.landListing.findMany({
      where: hasDateFilter ? { createdAt: dateFilter } : {},
      orderBy: { createdAt: 'desc' },
      take: 10000
    });
    columns = ['id', 'reference', 'title', 'region', 'district', 'community', 'landType', 'titleStatus', 'status', 'sizeAcres', 'price', 'createdAt'];
    filename = 'land-listings';
  } else if (type === 'inquiries') {
    data = await prisma.landInquiry.findMany({
      where: hasDateFilter ? { createdAt: dateFilter } : {},
      orderBy: { createdAt: 'desc' },
      take: 10000
    });
    columns = ['id', 'reference', 'name', 'email', 'phone', 'type', 'status', 'message', 'createdAt'];
    filename = 'land-inquiries';
  } else if (type === 'reservations') {
    data = await prisma.landReservation.findMany({
      where: hasDateFilter ? { createdAt: dateFilter } : {},
      orderBy: { createdAt: 'desc' },
      take: 10000
    });
    columns = ['id', 'reference', 'listingReference', 'buyerName', 'buyerEmail', 'amount', 'reservationFee', 'status', 'paymentMethod', 'createdAt'];
    filename = 'land-reservations';
  } else if (type === 'payments') {
    data = await prisma.payment.findMany({
      where: hasDateFilter ? { createdAt: dateFilter } : {},
      orderBy: { createdAt: 'desc' },
      take: 10000
    });
    columns = ['id', 'reference', 'amount', 'status', 'method', 'receivedById', 'createdAt'];
    filename = 'payments';
  } else if (type === 'visits') {
    data = await prisma.visit.findMany({
      where: hasDateFilter ? { createdAt: dateFilter } : {},
      orderBy: { createdAt: 'desc' },
      take: 10000,
      include: { visitor: { select: { fullName: true, email: true } }, host: { select: { name: true } } }
    });
    columns = ['id', 'visitCode', 'visitor.fullName', 'visitor.email', 'status', 'purpose', 'expectedArrival', 'checkedInAt', 'checkedOutAt', 'host.name'];
    filename = 'visits';
  } else {
    return NextResponse.json({ error: 'Unknown export type' }, { status: 400 });
  }

  const csv = toCsv(data, columns);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}.csv"`,
      'cache-control': 'no-store'
    }
  });
}