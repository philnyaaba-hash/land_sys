import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const [awaitingApprovalVisits, overdueVisits, pendingInvoices, unsubmittedReports, unassignedServiceRequests] = await Promise.all([
    prisma.visit.count({ where: { status: 'AWAITING_APPROVAL' } }),
    prisma.visit.count({ where: { status: 'CHECKED_IN', expectedCheckout: { lt: now } } }),
    prisma.invoice.count({ where: { status: 'SENT', dueDate: { lt: now } } }),
    prisma.fieldReport.count({ where: { status: 'SUBMITTED' } }),
    prisma.serviceRequest.count({ where: { status: 'SUBMITTED', assignedToId: null } })
  ]);

  const alerts = [];

  if (awaitingApprovalVisits > 0) {
    alerts.push({
      type: 'warning',
      title: 'Visits awaiting approval',
      count: awaitingApprovalVisits,
      action: 'Review visits',
      href: '/dashboard/visits?status=AWAITING_APPROVAL',
      icon: 'clock'
    });
  }

  if (overdueVisits > 0) {
    alerts.push({
      type: 'error',
      title: 'Overdue check-outs',
      count: overdueVisits,
      action: 'Check out visitors',
      href: '/dashboard/visits?status=OVERDUE',
      icon: 'alert'
    });
  }

  if (pendingInvoices > 0) {
    alerts.push({
      type: 'error',
      title: 'Overdue invoices',
      count: pendingInvoices,
      action: 'Follow up on payments',
      href: '/dashboard/finance/invoices?status=SENT',
      icon: 'invoice'
    });
  }

  if (unsubmittedReports > 0) {
    alerts.push({
      type: 'info',
      title: 'Field reports awaiting review',
      count: unsubmittedReports,
      action: 'Review reports',
      href: '/dashboard/survey/reports?status=SUBMITTED',
      icon: 'document'
    });
  }

  if (unassignedServiceRequests > 0) {
    alerts.push({
      type: 'info',
      title: 'Unassigned service requests',
      count: unassignedServiceRequests,
      action: 'Assign staff',
      href: '/dashboard/services?status=SUBMITTED',
      icon: 'task'
    });
  }

  return NextResponse.json({ alerts, total: alerts.length });
}