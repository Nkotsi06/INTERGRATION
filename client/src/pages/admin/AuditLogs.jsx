import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { getAuditLogs, exportAuditLogs } from '../../api/auditApi';
import { formatDate } from '../../utils/formatters';

const PAGE_SIZE = 5;

function AuditLogs() {
  const [filters, setFilters] = useState({
    user: '',
    action: '',
    from: '',
    to: '',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [userInput, setUserInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({ ...prev, user: userInput }));
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [userInput]);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const limit = PAGE_SIZE;
      const offset = (page - 1) * PAGE_SIZE;
      const result = await getAuditLogs({
        user: filters.user || undefined,
        action: filters.action || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        page,
        pageSize: PAGE_SIZE,
        limit,
        offset,
      });
      setData({ rows: result.rows || [], total: result.total || 0 });
    } catch (err) {
      setLoadError('Could not load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const hasActiveFilters = !!(filters.user || filters.action || filters.from || filters.to);

  const columns = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (r) => formatDate(r.createdAt),
    },
    { key: 'username', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'recordId', label: 'Record', render: (r) => r.recordId || '—' },
    {
      key: 'result',
      label: 'Result',
      render: (r) => (
        <span className={`audit-result audit-result-${r.result}`}>
          {r.result === 'SUCCESS' ? 'Success' : 'Failed'}
        </span>
      ),
    },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportAuditLogs({
        user: filters.user || undefined,
        action: filters.action || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-logs.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const startRow = (page - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(page * PAGE_SIZE, data.total);

  return (
    <AdminLayout title="Audit Logs" showBack backPath="/admin/dashboard">
      <h1>Audit Logs</h1>
      <p className="text-muted">
        Review recorded system activity. Audit records cannot be edited.
      </p>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown" style={{ minWidth: 200 }}>
            <label className="filter-label">User</label>
            <input
              type="text"
              className="filter-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Search username"
            />
          </div>
          <div className="filter-dropdown">
            <label className="filter-label">Action Type</label>
            <input
              type="text"
              className="filter-input"
              value={filters.action}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, action: e.target.value }));
                setPage(1);
              }}
              placeholder="Any action"
            />
          </div>
          <div className="filter-date-range">
            <label className="filter-label">Date Range</label>
            <div className="date-range-inputs">
              <input
                type="date"
                className="filter-date-input"
                value={filters.from}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, from: e.target.value }));
                  setPage(1);
                }}
              />
              <span className="date-range-sep">to</span>
              <input
                type="date"
                className="filter-date-input"
                value={filters.to}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, to: e.target.value }));
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="clear-filters"
            onClick={() => {
              setUserInput('');
              setFilters({ user: '', action: '', from: '', to: '' });
              setPage(1);
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="audit-actions">
        <Button variant="primary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting…' : 'Export'}
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          Print
        </Button>
      </div>

      {loadError && <Alert type="error" message={loadError} />}

      {loading && <TableSkeleton rows={5} columns={5} />}

      {!loading && data.rows.length === 0 && (
        <EmptyState
          title="No audit entries match these filters"
          message="Clear filters to view all logs."
        />
      )}

      {!loading && data.rows.length > 0 && (
        <>
          <Table columns={columns} data={data.rows} />
          <div className="pagination">
            <span className="pagination-summary">
              Showing {startRow} to {endRow} of {data.total}
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="btn btn-secondary btn-small"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default AuditLogs;
