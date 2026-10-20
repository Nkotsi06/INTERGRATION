import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getApplications } from '../../api/citizenApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  COMPLETED: 'success',
  DRAFT: 'default',
  READY_FOR_COLLECTION: 'success',
  COLLECTED: 'default',
  IN_PRODUCTION: 'warning',
};

function ApplicationStatus() {
  const { data: applications, loading } = useFetch(getApplications, [], {
    pollInterval: 30000,
  });
  const [filterValues, setFilterValues] = useState({ status: '', service: '' });

  const filtered = useMemo(() => {
    if (!applications) return [];
    return applications.filter((app) => {
      if (filterValues.status && app.status !== filterValues.status) return false;
      if (filterValues.service && app.service !== filterValues.service) return false;
      return true;
    });
  }, [applications, filterValues]);

  const columns = [
    { key: 'referenceNumber', label: 'Reference' },
    { key: 'service', label: 'Ministry' },
    { 
      key: 'serviceName', 
      label: 'Service',
      render: (r) => r.data?.serviceName || '—'
    },
    { 
      key: 'dateSubmitted', 
      label: 'Submitted',
      render: (r) => formatDate(r.submittedAt)
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'default'}>
          {row.status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'collection',
      label: 'Collection Branch',
      render: (r) => r.data?.formData?.branchName || '—'
    }
  ];

  return (
    <PageWrapper title="My Applications" showBack backPath="/citizen/dashboard">
      <h1>My Applications</h1>
      <p className="text-muted">Track all your government service applications.</p>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={filterValues.status}
              onChange={(e) => setFilterValues((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="READY_FOR_COLLECTION">Ready for Collection</option>
              <option value="COLLECTED">Collected</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <label className="filter-label">Ministry</label>
            <select
              className="filter-select"
              value={filterValues.service}
              onChange={(e) => setFilterValues((prev) => ({ ...prev, service: e.target.value }))}
            >
              <option value="">All</option>
              <option value="HOME_AFFAIRS">Home Affairs</option>
              <option value="PASSPORT">Passport</option>
              <option value="TRAFFIC">Traffic</option>
              <option value="FINANCE">Finance</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <TableSkeleton rows={5} columns={5} />}
      {!loading && filtered.length === 0 && (
        <EmptyState title="No applications found" message="You have not applied for any services yet." />
      )}
      {!loading && filtered.length > 0 && (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default ApplicationStatus;