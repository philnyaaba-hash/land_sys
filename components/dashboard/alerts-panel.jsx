/* Needs Attention alert panel — server component */
export default function AlertsPanel({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <section className="alerts-panel empty-state">
        <p className="empty-ico"></p>
        <h3>All caught up</h3>
        <p>No items require your attention right now.</p>
      </section>
    );
  }

  return (
    <section className="alerts-panel">
      <h2 className="panel-title">Needs attention</h2>
      <div className="alert-list">
        {alerts.map((alert, idx) => (
          <article key={idx} className="alert-item alert-${alert.t}">
            <div className="alert-left">
              <span className="alert-icon">{alert.i}</span>
              <div>
                <p className="alert-title">{alert.title}</p>
                <p className="alert-count">{alert.c} item{alert.c !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <a href={alert.h} className="alert-action">{alert.act}</a>
          </article>
        ))}
      </div>
    </section>
  );
}