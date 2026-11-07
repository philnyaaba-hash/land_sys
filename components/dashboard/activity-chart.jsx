'use client';

/* Weekly activity chart — client component */
import { useEffect, useState } from 'react';

export default function ActivityChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/dashboard/activity')
      .then((r) => r.json())
      .then((json) => { if (!cancelled) { setData(json); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="chart-placeholder">Loading activity chart…</div>;
  if (!data) return null;

  const max = Math.max(
    ...data.inquiries.map(([, v]) => v),
    ...data.reservations.map(([, v]) => v),
    ...data.payments.map(([, v]) => v),
    1
  );

  const barHeight = (value) => Math.max(6, Math.round((value / max) * 100));

  return (
    <section className="panel">
      <h2 className="panel-title">Weekly activity</h2>
      <div className="activity-chart">
        {data.labels.map((label, i) => {
          const inq = data.inquiries[i]?.[1] ?? 0;
          const res = data.reservations[i]?.[1] ?? 0;
          const pay = data.payments[i]?.[1] ?? 0;
          return (
            <div key={label} className="activity-day">
              <div className="activity-day-label">{label}</div>
              <div className="activity-bars">
                <div
                  className="activity-bar activity-bar-inquiries"
                  style={{ height: `${barHeight(inq)}%` }}
                  title={`Inquiries: ${inq}`}
                />
                <div
                  className="activity-bar activity-bar-reservations"
                  style={{ height: `${barHeight(res)}%` }}
                  title={`Reservations: ${res}`}
                />
                <div
                  className="activity-bar activity-bar-payments"
                  style={{ height: `${barHeight(pay)}%` }}
                  title={`Payments: GH₵ ${pay}`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="chart-legend">
        <span><span className="legend-dot legend-inquiries" /></span> Inquiries
        <span><span className="legend-dot legend-reservations" /></span> Reservations
        <span><span className="legend-dot legend-payments" /></span> Payments
      </div>
    </section>
  );
}