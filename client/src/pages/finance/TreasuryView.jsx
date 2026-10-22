import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { StatsSkeleton, TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getTreasury, getTreasuryStats } from '../../api/financeApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PAID: 'approved',
  CANCELLED: 'rejected',
};

function TreasuryView() {
  const { data: rows, loading } = useFetch(getTreasury, []);
  const { data: stats, loading: statsLoading } = useFetch(getTreasuryStats, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [ministryFilter, setMinistryFilter] = useState('');

  const ministries = useMemo(() => {
    if (!rows) return [];
    return Array.from(new Set(rows.map((r) => r.paying_ministry))).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (ministryFilter && r.paying_ministry !== ministryFilter) return false;
      return true;
    });
  }, [rows, statusFilter, ministryFilter]);

  const columns = [
    { key: 'payment_reference', label: 'Reference' },
    { key: 'paying_ministry', label: 'Ministry' },
    { key: 'payee_name', label: 'Payee' },
    {
      key: 'amount',
      label: 'Amount',
      render: (r) => formatCurrency(r.amount),
    },
    {
      key: 'payment_date',
      label: 'Date',
      render: (r) => (r.payment_date ? formatDate(r.payment_date) : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} />,
    },
  ];

  return (
    <PageWrapper title="Treasury Payments" showBack backPath="/finance/dashboard" accentColour="#117864">
      <h1>Treasury payments</h1>

      {statsLoading ? (
        <StatsSkeleton count={3} />
      ) : (
        <div className="stats-grid">
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.pending ?? 0}</div>
              <div className="stat-label">Pending</div>
            </div>
          </Card>
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{stats?.approved ?? 0}</div>
              <div className="stat-label">Approved</div>
            </div>
          </Card>
          <Card variant="bordered" className="stat-card">
            <div className="stat-body">
              <div className="stat-value">{formatCurrency(stats?.total_paid ?? 0)}</div>
              <div className="stat-label">Total paid</div>
            </div>
          </Card>
        </div>
      )}

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
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <label className="filter-label">Ministry</label>
            <select
              className="filter-select"
              value={ministryFilter}
              onChange={(e) => setMinistryFilter(e.target.value)}
            >
              <option value="">All</option>
              {ministries.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <TableSkeleton rows={6} columns={6} />}

      {!loading && filtered.length === 0 && (
        <EmptyState title="No treasury payments" message="Nothing to show." />
      )}

      {!loading && filtered.length > 0 && (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default TreasuryView;
