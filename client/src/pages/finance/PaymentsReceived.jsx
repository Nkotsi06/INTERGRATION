import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { listPayments } from '../../api/paymentApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

const MINISTRIES = [
  { value: '', label: 'All ministries' },
  { value: 'HOME_AFFAIRS', label: 'Home Affairs' },
  { value: 'TRAFFIC', label: 'Traffic' },
  { value: 'POLICE', label: 'Police' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'PENSIONS', label: 'Pensions' },
  { value: 'PASSPORT', label: 'Passport' },
];

const PAGE_SIZE = 25;

function PaymentsReceived() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    ministry: searchParams.get('ministry') || '',
    service: '',
    status: '',
    from: '',
    to: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listPayments({
        ...filters,
        page,
        pageSize: PAGE_SIZE,
      });
      setData({
        rows: result?.rows || [],
        total: result?.total || 0,
      });
    } catch (err) {
      setError(err.message || 'Could not load payments.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep the URL in sync so links like /finance/payments?ministry=TRAFFIC work.
  useEffect(() => {
    const next = new URLSearchParams();
    if (filters.ministry) next.set('ministry', filters.ministry);
    setSearchParams(next, { replace: true });
  }, [filters.ministry, setSearchParams]);

  const update = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const hasActive = Object.values(filters).some(Boolean);

  const columns = [
    { key: 'receipt_number', label: 'Receipt' },
    { key: 'paid_at', label: 'Date', render: (r) => formatDate(r.paid_at) },
    { key: 'ministry', label: 'Ministry' },
    { key: 'service', label: 'Service', render: (r) => r.service || '—' },
    {
      key: 'citizen',
      label: 'Citizen',
      render: (r) =>
        r.first_name || r.last_name
          ? `${r.first_name || ''} ${r.last_name || ''}`.trim()
          : '—',
    },
    { key: 'national_id', label: 'National ID', render: (r) => r.national_id || '—' },
    {
      key: 'amount',
      label: 'Amount',
      render: (r) => formatCurrency(r.amount),
    },
    { key: 'method', label: 'Method' },
    { key: 'status', label: 'Status' },
  ];

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const startRow = (page - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(page * PAGE_SIZE, data.total);

  return (
    <PageWrapper
      title="Payments received"
      showBack
      backPath="/finance/dashboard"
      accentColour="#117864"
    >
      <h1>Payments received</h1>
      <p className="text-muted">
        Every payment made through any ministry's service.
      </p>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Ministry</label>
            <select
              className="filter-select"
              value={filters.ministry}
              onChange={(e) => update('ministry', e.target.value)}
            >
              {MINISTRIES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => update('status', e.target.value)}
            >
              <option value="">All</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="filter-dropdown" style={{ minWidth: 220 }}>
            <label className="filter-label">Search</label>
            <input
              type="text"
              className="filter-input"
              value={filters.search}
              onChange={(e) => update('search', e.target.value)}
              placeholder="Receipt or reference"
            />
          </div>

          <div className="filter-date-range">
            <label className="filter-label">Date range</label>
            <div className="date-range-inputs">
              <input
                type="date"
                className="filter-date-input"
                value={filters.from}
                onChange={(e) => update('from', e.target.value)}
              />
              <span className="date-range-sep">to</span>
              <input
                type="date"
                className="filter-date-input"
                value={filters.to}
                onChange={(e) => update('to', e.target.value)}
              />
            </div>
          </div>
        </div>

        {hasActive && (
          <button
            type="button"
            className="clear-filters"
            onClick={() =>
              setFilters({
                ministry: '',
                service: '',
                status: '',
                from: '',
                to: '',
                search: '',
              })
            }
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && <TableSkeleton rows={8} columns={9} />}
      {!loading && error && <Alert type="error" message={error} />}

      {!loading && !error && data.rows.length === 0 && (
        <div className="table-empty">No payments match these filters.</div>
      )}

      {!loading && !error && data.rows.length > 0 && (
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
    </PageWrapper>
  );
}

export default PaymentsReceived;
