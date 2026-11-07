#!/usr/bin/env node
/* Seed sample data for reports and dashboard modules.
 * Run: node scripts/seed-reports.cjs
 */
'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  // Create a sample department
  const dept = await prisma.department.upsert({
    where: { name: 'Land Administration' },
    update: {},
    create: { name: 'Land Administration', code: 'LAND' }
  });

  // Create a sample user (admin)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@landledger.local' },
    update: {},
    create: {
      employeeId: 'EMP-0001',
      email: 'admin@landledger.local',
      name: 'System Administrator',
      passwordHash: '$2b$10$placeholder',
      phone: '+233 20 000 0000',
      jobTitle: 'Administrator',
      officeLocation: 'Head Office',
      status: 'ACTIVE',
      departmentId: dept.id
    }
  });

  // Create sample land listings
  for (let i = 1; i <= 5; i++) {
    await prisma.landListing.upsert({
      where: { reference: `LIST-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        reference: `LIST-${String(i).padStart(3, '0')}`,
        title: `Sample Plot ${i} – Adenta Ridge`,
        region: 'Greater Accra',
        district: 'Adenta Municipal',
        community: 'Adenta Ridge',
        landType: 'RESIDENTIAL',
        titleStatus: 'REGISTERED',
        status: 'PUBLISHED',
        sizeAcres: 0.5 + i * 0.1,
        price: 200000 + i * 25000,
        summary: `Serviced residential plot ${i} on graded road.`,
        description: 'A compact release of plots with drainage and corner pillars.',
        highlights: ['Registered title', 'Graded access road'],
        imageUrls: ['/assets/land/residential.png'],
        publishedAt: now
      }
    });
  }

  // Create sample inquiries
  for (let i = 1; i <= 3; i++) {
    await prisma.landInquiry.create({
      data: {
        reference: `INQ-${String(i).padStart(3, '0')}`,
        name: `Client ${i}`,
        email: `client${i}@example.com`,
        phone: `+233 20 000 000${i}`,
        message: `I am interested in viewing the available plots.`,
        type: 'VIEWING',
        status: 'NEW'
      }
    });
  }

  // Create sample reservations
  for (let i = 1; i <= 2; i++) {
    await prisma.landReservation.create({
      data: {
        reference: `RES-${String(i).padStart(3, '0')}`,
        listingReference: `LIST-${String(i).padStart(3, '0')}`,
        buyerName: `Buyer ${i}`,
        buyerEmail: `buyer${i}@example.com`,
        buyerPhone: `+233 20 000 001${i}`,
        amount: 220000 + i * 10000,
        reservationFee: 11000 + i * 500,
        status: 'CONFIRMED',
        paymentMethod: 'MOBILE_MONEY'
      }
    });
  }

  // Create sample payments
  for (let i = 1; i <= 3; i++) {
    await prisma.payment.create({
      data: {
        reference: `PAY-${String(i).padStart(3, '0')}`,
        amount: 50000 + i * 10000,
        status: 'PAID',
        method: 'MOBILE_MONEY',
        receivedById: admin.id,
        receivedAt: now
      }
    });
  }

  // Create sample expenses
  for (let i = 1; i <= 2; i++) {
    await prisma.expense.create({
      data: {
        reference: `EXP-${String(i).padStart(3, '0')}`,
        title: `Office expense ${i}`,
        amount: 5000 + i * 1000,
        status: 'PAID',
        recordedById: admin.id
      }
    });
  }

  // Create sample visits
  for (let i = 1; i <= 2; i++) {
    await prisma.visit.create({
      data: {
        visitCode: `VIS-${String(i).padStart(3, '0')}`,
        visitorName: `Visitor ${i}`,
        visitorEmail: `visitor${i}@example.com`,
        hostId: admin.id,
        status: 'EXPECTED',
        expectedArrival: now,
        purpose: 'Site viewing'
      }
    });
  }

  console.log('Seed complete: sample reports data created.');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});