'use client';

/* Office Workflow Kanban board — client component */
import { useEffect, useState } from 'react';

const COLUMNS = [
  { key: 'NEW', label: 'New', color: 'blue' },
  { key: 'AWAITING_APPROVAL', label: 'Awaiting approval', color: 'amber' },
  { key: 'APPROVED', label: 'Approved', color: 'green' },
  { key: 'SCHEDULED', label: 'Scheduled', color: 'purple' },
  { key: 'COMPLETED', label: 'Completed', color: 'green' }
];

export default function KanbanBoard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/dashboard/kanban/visits').then((r) => r.json()).catch(() => ({ items: [] })),
      fetch('/api/dashboard/kanban/service-requests').then((r) => r.json()).catch(() => ({ items: [] }))
    ]).then(([visits, services]) => {
      if (!cancelled) {
        const all = [
          ...(visits.items || []).map((v) => ({ ...v, type: 'visit' })),
          ...(services.items || []).map((s) => ({ ...s, type: 'service' }))
        ];
        setItems(all);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="kanban-placeholder">Loading workflow board…</div>;

  const byStatus = {};
  COLUMNS.forEach((col) => { byStatus[col.key] = []; });
  items.forEach((item) => {
    const key = item.status || 'NEW';
    if (byStatus[key]) byStatus[key].push(item);
  });

  return (
    <section className="panel">
      <h2 className="panel-title">Office workflow</h2>
      <div className="kanban">
        {COLUMNS.map((col) => (
          <div key={col.key} className="kanban-column">
            <div className="kanban-column-head">
              <span className={`kanban-badge kanban-badge-${col.color}`}>{col.label}</span>
              <span className="kanban-count">{byStatus[col.key]?.length ?? 0}</span>
            </div>
            <div className="kanban-column-body">
              {(byStatus[col.key] ?? []).map((item) => (
                <article key={item.id} className="kanban-card">
                  <div className="kanban-card-title">{item.title || item.visitor?.fullName || item.reference}</div>
                  <div className="kanban-card-meta">{item.clientId || item.host?.name || '—'}</div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}