/* Dashboard KPI overview cards — server component */
export default function KpiCards({ stats }) {
  /* Core metrics — enlarged main feature, grouped by category */
  const cards = [
    { label: 'Listings', value: stats.tl, sub: `${stats.pl} published · ${stats.dl} draft`, icon: 'map', color: 'green' },
    { label: 'Inquiries (7d)', value: stats.ni, sub: 'Storefront traffic', icon: 'message', color: 'blue' },
    { label: 'Reservations (7d)', value: stats.nr, sub: `${stats.cr} confirmed`, icon: 'task', color: 'green' },
    { label: 'Revenue', value: `GH₵ ${stats.mr.toLocaleString()}`, sub: 'Payments collected', icon: 'invoice', color: 'green' },
    { label: 'Visits today', value: stats.pv, sub: 'Expected arrivals', icon: 'clock', color: 'amber' },
    { label: 'Checked in', value: stats.ci, sub: 'Currently on site', icon: 'user', color: 'blue' },
    { label: 'Staff active', value: stats.au, sub: 'User accounts', icon: 'users', color: 'purple' },
    { label: 'Invoices pending', value: stats.pi, sub: 'Awaiting action', icon: 'alert', color: 'red' }
  ];

  return (
    <div className="dashboard-grid">
      {cards.map((card) => (
        <section key={card.label} className="kpi-card kpi-${card.color}">
          <div className="kpi-head">
            <span className="kpi-icon">{card.icon}</span>
            <div>
              <p className="kpi-label">{card.label}</p>
              <p className="kpi-value">{card.value}</p>
            </div>
          </div>
          <p className="kpi-sub">{card.sub}</p>
        </section>
      ))}
    </div>
  );
}