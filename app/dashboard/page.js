import { prisma } from '@/lib/prisma';
import KpiCards from '@/components/dashboard/kpi-cards';
import AlertsPanel from '@/components/dashboard/alerts-panel';
import ActivityChart from '@/components/dashboard/activity-chart';
import RegionalBreakdown from '@/components/dashboard/regional-breakdown';
import VisitorTraffic from '@/components/dashboard/visitor-traffic';
import ClientAnalytics from '@/components/dashboard/client-analytics';
import KanbanBoard from '@/components/dashboard/kanban-board';
import ExportHub from '@/components/dashboard/export-hub';

export const metadata = { title: 'Dashboard — LandLedger', robots: { index: false, follow: false } };

async function fetchStats() {
  const n = new Date();
  const t = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  const tm = new Date(t.getTime() + 86400000);
  const wa = new Date(n.getTime() - 604800000);
  const ms = new Date(n.getFullYear(), n.getMonth(), 1);
  const [tl, pl, dl, ni, nr, cr, mr, pv, ci, au, pi, oe] = await Promise.all([
    prisma.landListing.count(), prisma.landListing.count({ where: { status: 'PUBLISHED' } }),
    prisma.landListing.count({ where: { status: 'DRAFT' } }),
    prisma.landInquiry.count({ where: { createdAt: { gte: wa } } }),
    prisma.landReservation.count({ where: { createdAt: { gte: wa } } }),
    prisma.landReservation.count({ where: { status: 'CONFIRMED', createdAt: { gte: wa } } }),
    prisma.payment.aggregate({ where: { status: 'PAID', createdAt: { gte: ms } }, _sum: { amount: true } }),
    prisma.visit.count({ where: { status: 'EXPECTED', expectedArrival: { gte: t, lt: tm } } }),
    prisma.visit.count({ where: { status: 'CHECKED_IN' } }),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.invoice.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
    prisma.expense.count({ where: { status: 'PENDING' } })
  ]);
  return { tl, pl, dl, ni, nr, cr, mr: mr._sum.amount || 0, pv, ci, au, pi, oe };
}

async function fetchAlerts() {
  const n = new Date();
  const [aa, ov, pi, ur, usr] = await Promise.all([
    prisma.visit.count({ where: { status: 'AWAITING_APPROVAL' } }),
    prisma.visit.count({ where: { status: 'CHECKED_IN', expectedCheckout: { lt: n } } }),
    prisma.invoice.count({ where: { status: 'SENT', dueDate: { lt: n } } }),
    prisma.fieldReport.count({ where: { status: 'SUBMITTED' } }),
    prisma.serviceRequest.count({ where: { status: 'SUBMITTED', assignedToId: null } })
  ]);
  const a = [];
  if (aa > 0) a.push({ t: 'warning', title: 'Visits awaiting approval', c: aa, act: 'Review visits', h: '/dashboard/visits?status=AWAITING_APPROVAL', i: 'clock' });
  if (ov > 0) a.push({ t: 'error', title: 'Overdue check-outs', c: ov, act: 'Check out visitors', h: '/dashboard/visits?status=OVERDUE', i: 'alert' });
  if (pi > 0) a.push({ t: 'error', title: 'Overdue invoices', c: pi, act: 'Follow up on payments', h: '/dashboard/finance/invoices?status=SENT', i: 'invoice' });
  if (ur > 0) a.push({ t: 'info', title: 'Field reports awaiting review', c: ur, act: 'Review reports', h: '/dashboard/survey/reports?status=SUBMITTED', i: 'document' });
  if (usr > 0) a.push({ t: 'info', title: 'Unassigned service requests', c: usr, act: 'Assign staff', h: '/dashboard/services?status=SUBMITTED', i: 'task' });
  return a;
}

async function fetchRegions() {
  const [bl, bh] = await Promise.all([
    prisma.landListing.groupBy({ by: ['region'], where: { status: 'PUBLISHED' }, _count: { id: true }, _avg: { price: true, sizeAcres: true } }),
    prisma.landHolding.groupBy({ by: ['region'], _count: { id: true } })
  ]);
  const m = {};
  bl.forEach((r) => { m[r.region] = { r: r.region, l: r._count.id, ap: Math.round(r._avg.price || 0), as: Math.round((r._avg.sizeAcres || 0) * 100) / 100, h: 0 }; });
  bh.forEach((r) => { if (m[r.region]) m[r.region].h = r._count.id; else m[r.region] = { r: r.region, l: 0, ap: 0, as: 0, h: r._count.id }; });
  return Object.values(m).sort((a, b) => b.l - a.l);
}

async function fetchTraffic() {
  const n = new Date();
  const t = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  const tm = new Date(t.getTime() + 86400000);
  const [et, ci, cot, pa] = await Promise.all([
    prisma.visit.findMany({ where: { status: 'EXPECTED', expectedArrival: { gte: t, lt: tm } }, include: { host: { select: { name: true } } }, orderBy: { expectedArrival: 'asc' }, take: 50 }),
    prisma.visit.findMany({ where: { status: 'CHECKED_IN' }, include: { visitor: { select: { fullName: true } }, host: { select: { name: true } } }, orderBy: { checkedInAt: 'asc' }, take: 50 }),
    prisma.visit.count({ where: { status: 'CHECKED_OUT', checkedOutAt: { gte: t } } }),
    prisma.visit.count({ where: { status: 'AWAITING_APPROVAL' } })
  ]);
  return { et, ci, cot, pa };
}

async function fetchClients() {
  const n = new Date();
  const wa = new Date(n.getTime() - 604800000);
  const ma = new Date(n.getTime() - 2592000000);
  const [tc, nw, nm, h, r] = await Promise.all([
    prisma.clientProfile.count(), prisma.clientProfile.count({ where: { createdAt: { gte: wa } } }),
    prisma.clientProfile.count({ where: { createdAt: { gte: ma } } }), prisma.landHolding.count(), prisma.landReservation.count()
  ]);
  const recent = await prisma.clientProfile.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, region: true, createdAt: true, _count: { select: { holdings: true, inquiries: true } } } });
  return { tc, nw, nm, h, r, recent };
}

export default async function DashboardPage() {
  const [s, al, rg, tr, cl] = await Promise.all([fetchStats(), fetchAlerts(), fetchRegions(), fetchTraffic(), fetchClients()]);
  const n = new Date();
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header"><h1 className="dashboard-title">Workspace dashboard</h1><p className="dashboard-sub">LandLedger office overview — {n.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></header>
      <KpiCards stats={s} />
      <div className="dashboard-row dashboard-row-alerts"><AlertsPanel alerts={al} /></div>
      <div className="dashboard-row dashboard-row-main"><section className="panel wide"><ActivityChart /></section><section className="panel narrow"><RegionalBreakdown regions={rg} /><VisitorTraffic traffic={tr} /></section></div>
      <div className="dashboard-row dashboard-row-bottom"><section className="panel wide"><ClientAnalytics clients={cl} /></section></div>
      <div className="dashboard-row dashboard-row-kanban"><section className="panel wide"><KanbanBoard /></section></div>
      <div className="dashboard-row dashboard-row-export"><section className="panel wide"><ExportHub /></section></div>
    </div>
  );
}
