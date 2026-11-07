'use client';

import { useEffect, useState } from 'react';

export default function DailySummary({ date }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/reports/daily-summary?date=${encodeURIComponent(date || '')}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load summary');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [date]);

  if (loading) return <div className="p-4">Loading daily summary…</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!summary) return null;

  return (
    <div className="p-4 border rounded-lg bg-green-50">
      <h2 className="text-lg font-bold text-green-900 mb-2">Daily Summary — {summary.date}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-white p-3 rounded border">
          <div className="text-green-600 font-bold">{summary.inquiries}</div>
          <div className="text-gray-600 text-xs">New inquiries</div>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="text-green-600 font-bold">{summary.sales}</div>
          <div className="text-gray-600 text-xs">Confirmed sales</div>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="text-green-600 font-bold">GH₵ {summary.payments.toLocaleString()}</div>
          <div className="text-gray-600 text-xs">Payments received</div>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="text-green-600 font-bold">{summary.expenses}</div>
          <div className="text-gray-600 text-xs">Expenses recorded</div>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="text-green-600 font-bold">{summary.expectedVisits}</div>
          <div className="text-gray-600 text-xs">Expected visits</div>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="text-green-600 font-bold">{summary.activeListings}</div>
          <div className="text-gray-600 text-xs">Active listings</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Generated at {new Date(summary.generatedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}