import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getApplications } from '../../api/citizenApi';

const STATUS_VARIANT = {
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  COMPLETED: 'success',
  DRAFT: 'default',
};

function ApplicationStatus() {
  const { data: applications, loading } = useFetch(getApplications, []);
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
    { key: 'referenceNumber', label: 'Reference Number' },
    { key: 'service', label: 'Service' },
    { key: 'dateSubmitted', label: 'Date Submitted' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'default'}>
          {row.statusLabel || row.status}
        </Badge>
      ),
    },
  ];

  return (
    <PageWrapper title="My Applications" showBack backPath="/citizen/dashboard">
      <h1>My Applications</h1>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={filterValues.status}
              onChange={(e) =>
                setFilterValues((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">All</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <label className="filter-label">Service</label>
            <select
              className="filter-select"
              value={filterValues.service}
              onChange={(e) =>
                setFilterValues((prev) => ({ ...prev, service: e.target.value }))
              }
            >
              <option value="">All</option>
              <option value="PASSPORT">Passport</option>
              <option value="TRAFFIC">Traffic</option>
              <option value="FINANCE">Finance</option>
              <option value="PENSIONS">Pensions</option>
            </select>
          </div>
        </div>
        {(filterValues.status || filterValues.service) && (
          <button
            type="button"
            className="clear-filters"
            onClick={() => setFilterValues({ status: '', service: '' })}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && <TableSkeleton rows={5} columns={4} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No applications found"
          message="Try adjusting your filters, or apply for a service to see it here."
        />
      )}

      {!loading && filtered.length > 0 && (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default ApplicationStatus;