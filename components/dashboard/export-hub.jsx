'use client';

/* Export / Reports hub — client component */
import { useState } from 'react';

const EXPORT_TYPES = [
  { key: 'listings', label: 'Land Listings', desc: 'All published and draft listings' },
  { key: 'inquiries', label: 'Land Inquiries', desc: 'Buyer inquiries from the storefront' },
  { key: 'reservations', label: 'Reservations', desc: 'Confirmed and pending reservations' },
  { key: 'payments', label: 'Payments', desc: 'Recorded payments and receipts' },
  { key: 'visits', label: 'Visits', desc: 'Office visitor check-in records' }
];

export default function ExportHub() {
  const [downloading, setDownloading] = useState(null);

  const handleExport = (type) => {
    setDownloading(type);
    const url = `/api/dashboard/export?type=${type}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(null), 800);
  };

  return (
    <section className="panel">
      <h2 className="panel-title">Export &amp; reports</h2>
      <p className="panel-desc">Download CSV reports for offline analysis.</p>
      <div className="export-grid">
        {EXPORT_TYPES.map((t) => (
          <article key={t.key} className={`export-item ${downloading === t.key ? 'export-downloading' : ''}`}>
            <div className="export-info">
              <h3>{t.label}</h3>
              <p className="muted">{t.desc}</p>
            </div>
            <button
              className="export-btn"
              onClick={() => handleExport(t.key)}
              disabled={downloading === t.key}
            >
              {downloading === t.key ? 'Downloading…' : 'Export CSV'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}