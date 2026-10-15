import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getMyApplications } from '../../api/passportApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  DRAFT: 'awaiting',
  SUBMITTED: 'captured',
  UNDER_REVIEW: 'captured',
  APPROVED: 'verified',
  REJECTED: 'rejected',
  COMPLETED: 'verified',
};

function CheckStatus() {
  const { data, loading } = useFetch(getMyApplications, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (dateFilter && a.dateSubmitted < dateFilter) return false;
      return true;
    });
  }, [data, statusFilter, dateFilter]);

  const hasActive = !!(statusFilter || dateFilter);

  const columns = [
    { key: 'referenceNumber', label: 'Reference' },
    { key: 'dateSubmitted', label: 'Submitted', render: (r) => formatDate(r.dateSubmitted) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
  ];

  return (
    <PageWrapper
      title="Check Application Status"
      showBack
      backPath="/passport/dashboard"
      accentColour="#17A2B8"
    >
      <h1>Check application status</h1>

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
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under review</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <label className="filter-label">From date</label>
            <input
              type="date"
              className="filter-date-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
        {hasActive && (
          <button
            type="button"
            className="clear-filters"
            onClick={() => {
              setStatusFilter('');
              setDateFilter('');
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && <TableSkeleton rows={5} columns={3} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No applications found"
          message="Try changing the filters, or apply for a passport."
        />
      )}

      {!loading && filtered.length > 0 && (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default CheckStatus;