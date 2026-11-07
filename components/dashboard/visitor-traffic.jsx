/* Visitor traffic today widget — server component */
export default function VisitorTraffic({ traffic }) {
  return (
    <section className="panel">
      <h2 className="panel-title">Visitor traffic today</h2>
      <div className="traffic-stats">
        <div className="traffic-stat">
          <div className="traffic-value">{traffic?.et?.length ?? 0}</div>
          <div className="traffic-label">Expected today</div>
        </div>
        <div className="traffic-stat">
          <div className="traffic-value">{traffic?.ci?.length ?? 0}</div>
          <div className="traffic-label">Checked in now</div>
        </div>
        <div className="traffic-stat">
          <div className="traffic-value">{traffic?.cot ?? 0}</div>
          <div className="traffic-label">Checked out today</div>
        </div>
        <div className="traffic-stat">
          <div className="traffic-value">{traffic?.pa ?? 0}</div>
          <div className="traffic-label">Awaiting approval</div>
        </div>
      </div>
      {traffic?.et && traffic.et.length > 0 && (
        <div className="upcoming-visits">
          <h3 className="section-sub">Expected arrivals</h3>
          <ul className="visit-list">
            {traffic.et.slice(0, 5).map((v) => (
              <li key={v.id} className="visit-item">
                <div className="visit-info">
                  <p className="visit-name">{v.visitor.fullName}</p>
                  <p className="visit-meta">{v.host?.name || 'No host assigned'} · {new Date(v.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`visit-status visit-${v.status}`}>{v.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}