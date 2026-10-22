import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getProcurement, getProcurementStats } from '../../api/financeApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  OPEN: 'pending',
  CLOSED: 'rejected',
  AWARDED: 'approved',
  CANCELLED: 'rejected',
};

function ProcurementView() {
  const { data: rows, loading } = useFetch(getProcurement, []);
  const { data: stats } = useFetch(getProcurementStats, []);
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => !statusFilter || r.status === statusFilter);
  }, [rows, statusFilter]);

  const columns = [
    { key: 'tender_number', label: 'Tender #' },
    { key: 'title', label: 'Title' },
    { key: 'ministry_code', label: 'Ministry' },
    {
      key: 'estimated_value',
      label: 'Estimated',
      render: (r) => formatCurrency(r.estimated_value),
    },
    { key: 'awarded_to', label: 'Awarded to', render: (r) => r.awarded_to || '—' },
    {
      key: 'awarded_value',
      label: 'Award value',
      render: (r) => (r.awarded_value ? formatCurrency(r.awarded_value) : '—'),
    },
    {
      key: 'closing_date',
      label: 'Closing',
      render: (r) => (r.closing_date ? formatDate(r.closing_date) : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} />,
    },
  ];

  return (
    <PageWrapper title="Procurement" showBack backPath="/finance/dashboard" accentColour="#117864">
      <h1>Procurement & tenders</h1>

      <div className="stats-grid">
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{stats?.open_tenders ?? 0}</div>
            <div className="stat-label">Open tenders</div>
          </div>
        </Card>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{stats?.awarded_tenders ?? 0}</div>
            <div className="stat-label">Awarded</div>
          </div>
        </Card>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{formatCurrency(stats?.total_awarded ?? 0)}</div>
            <div className="stat-label">Total awarded</div>
          </div>
        </Card>
      </div>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="AWARDED">Awarded</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No procurement records" message="Nothing to show." />
      ) : (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default ProcurementView;
