import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getMyTrafficApplications } from '../../api/trafficApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  DRAFT: 'awaiting',
  SUBMITTED: 'captured',
  UNDER_REVIEW: 'captured',
  APPROVED: 'verified',
  REJECTED: 'rejected',
  COMPLETED: 'verified',
};

const SUB_TYPE_LABEL = {
  LEARNERS_LICENCE: "Learner's licence",
  DRIVING_LICENCE: 'Driving licence',
  PUBLIC_DRIVING_PERMIT: 'Public driving permit',
};

function MyTrafficApplications() {
  const { data, loading } = useFetch(getMyTrafficApplications, [], {
    pollInterval: 30000,
  });
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((a) => !statusFilter || a.status === statusFilter);
  }, [data, statusFilter]);

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    {
      key: 'sub_type',
      label: 'Type',
      render: (r) => SUB_TYPE_LABEL[r.sub_type] || r.sub_type || '—',
    },
    {
      key: 'submitted_at',
      label: 'Submitted',
      render: (r) => formatDate(r.submitted_at),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <StatusBadge
          variant={STATUS_VARIANT[r.status] || 'pending'}
          label={r.status}
        />
      ),
    },
  ];

  return (
    <PageWrapper
      title="My Traffic Applications"
      showBack
      backPath="/traffic/dashboard"
      accentColour="#B9770E"
    >
      <h1>My applications</h1>

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
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <TableSkeleton rows={5} columns={4} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No applications yet"
          message="Apply for a licence from your Traffic dashboard to see it here."
        />
      )}

      {!loading && filtered.length > 0 && (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default MyTrafficApplications;