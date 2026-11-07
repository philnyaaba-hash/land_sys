/* Regional performance breakdown — server component */
export default function RegionalBreakdown({ regions }) {
  if (!regions || regions.length === 0) {
    return <section className="panel"><p className="muted">No regional data available.</p></section>;
  }

  return (
    <section className="panel">
      <h2 className="panel-title">Regional performance</h2>
      <table className="region-table">
        <thead>
          <tr>
            <th>Region</th>
            <th className="num">Listings</th>
            <th className="num">Holdings</th>
            <th className="num">Avg price</th>
            <th className="num">Avg size</th>
          </tr>
        </thead>
        <tbody>
          {regions.map((r) => (
            <tr key={r.region}>
              <td>{r.r}</td>
              <td className="num">{r.l}</td>
              <td className="num">{r.h}</td>
              <td className="num">GH₵ {r.ap.toLocaleString()}</td>
              <td className="num">{r.as} acres</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}