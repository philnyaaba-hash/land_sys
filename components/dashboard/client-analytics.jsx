/* Client portal usage analytics — server component */
export default function ClientAnalytics({ clients }) {
  if (!clients) {
    return <section className="panel"><p className="muted">Loading client analytics…</p></section>;
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Client portal analytics</h2>
      <div className="client-stats">
        <div className="client-stat">
          <div className="client-value">{clients.tc}</div>
          <div className="client-label">Total clients</div>
        </div>
        <div className="client-stat">
          <div className="client-value">{clients.nw}</div>
          <div className="client-label">New this week</div>
        </div>
        <div className="client-stat">
          <div className="client-value">{clients.nm}</div>
          <div className="client-label">New this month</div>
        </div>
        <div className="client-stat">
          <div className="client-value">{clients.h}</div>
          <div className="client-label">Active holdings</div>
        </div>
        <div className="client-stat">
          <div className="client-value">{clients.r}</div>
          <div className="client-label">Total reservations</div>
        </div>
      </div>
      {clients.recentClients && clients.recentClients.length > 0 && (
        <div className="recent-clients">
          <h3 className="section-sub">Recent client sign-ups</h3>
          <table className="region-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Region</th>
                <th className="num">Holdings</th>
                <th className="num">Inquiries</th>
                <th className="num">Joined</th>
              </tr>
            </thead>
            <tbody>
              {clients.recentClients.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.region || '—'}</td>
                  <td className="num">{c._count.holdings}</td>
                  <td className="num">{c._count.inquiries}</td>
                  <td className="num muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}