/* Dashboard KPI overview cards — server component */
export default function KpiCards({ stats }) {
  const cards = [
    { label: 'Total listings', value: stats.tl, sub: `${stats.pl} published · ${stats.dl} draft`, icon: 'map', color: 'green' },
    { label: 'New inquiries (7d)', value: stats.ni, sub: 'From the storefront', icon: 'message', color: 'blue' },
    { label: 'New reservations (7d)', value: stats.nr, sub: `${stats.cr} confirmed`, icon: 'task', color: 'green' },
    { label: 'Monthly revenue', value: `GH₵ ${stats.mr.toLocaleString()}`, sub: 'Payments collected this month', icon: 'invoice', color: 'green' },
    { label: 'Pending visits today', value: stats.pv, sub: 'Expected arrivals', icon: 'clock', color: 'amber' },
    { label: 'Checked in now', value: stats.ci, sub: 'Currently on site', icon: 'user', color: 'blue' },
    { label: 'Active staff', value: stats.au, sub: 'Active user accounts', icon: 'users', color: 'purple' },
    { label: 'Pending invoices', value: stats.pi, sub: 'Draft or sent', icon: 'alert', color: 'red' }
  ];

  return (
    <div className="dashboard-grid">
      {cards.map((card) => (
        <section key={card.label} className={`kpi-card kpi-${card.color}`}>
          <div className="kpi-head">
            <div>
              <p className="kpi-label">{card.label}</p>
              <p className="kpi-value">{card.value}</p>
            </div>
            <div className="kpi-icon">{card.icon}</div>
          </div>
          <p className="kpi-sub">{card.sub}</p>
        </section>
      ))}
    </div>
  );
}