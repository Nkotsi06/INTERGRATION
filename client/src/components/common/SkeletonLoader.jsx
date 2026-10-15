function SkeletonLoader({ type = 'text', count = 1 }) {
  return (
    <div className="skeleton-container">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`skeleton skeleton-${type}`} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {Array.from({ length: columns }, (_, i) => (
              <th key={i}>
                <div className="skeleton skeleton-text" style={{ height: 12, width: '60%' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }, (_, c) => (
                <td key={c}>
                  <div className="skeleton skeleton-text" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatsSkeleton({ count = 4 }) {
  return (
    <div className="stats-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card card-flat stat-card">
          <div className="stat-body" style={{ width: '100%' }}>
            <div className="skeleton skeleton-text" style={{ height: 28, width: '40%' }} />
            <div className="skeleton skeleton-text" style={{ height: 12, width: '70%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;