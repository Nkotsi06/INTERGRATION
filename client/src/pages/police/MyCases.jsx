import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getMyCases } from '../../api/policeApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured',
  UNDER_INVESTIGATION: 'captured',
  UPDATED: 'captured',
  CLOSED: 'verified',
};

function MyCases() {
  const { data: cases, loading } = useFetch(getMyCases, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!cases) return [];
    return cases.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (dateFilter && c.createdAt < dateFilter) return false;
      return true;
    });
  }, [cases, statusFilter, dateFilter]);

  const hasActive = !!(statusFilter || dateFilter);

  const columns = [
    { key: 'caseNumber', label: 'Case number' },
    { key: 'caseType', label: 'Type' },
    {
      key: 'createdAt',
      label: 'Date reported',
      render: (r) => formatDate(r.createdAt),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} />,
    },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button
          variant="secondary"
          size="small"
          onClick={() => navigate(`/police/cases/${r.caseNumber}`)}
        >
          View details
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper
      title="My Cases"
      showBack
      backPath="/police/dashboard"
      accentColour="#922B21"
    >
      <h1>My cases</h1>

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
              <option value="UNDER_INVESTIGATION">Under investigation</option>
              <option value="UPDATED">Updated</option>
              <option value="CLOSED">Closed</option>
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

      {loading && <TableSkeleton rows={5} columns={5} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No cases found"
          message="Change the filters, or report a new case."
        />
      )}

      {!loading && filtered.length > 0 && (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default MyCases;