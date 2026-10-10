import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import FilterBar from '../../components/filters/FilterBar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import useFetch from '../../hooks/useFetch';
import useFilters from '../../hooks/useFilters';
import { getApplications } from '../../api/citizenApi';
import { FiFileText } from 'react-icons/fi';

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

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'SUBMITTED', label: 'Submitted' },
        { value: 'UNDER_REVIEW', label: 'Under Review' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'COMPLETED', label: 'Completed' },
      ],
    },
    {
      key: 'service',
      label: 'Service',
      options: [
        { value: 'PASSPORT', label: 'Passport' },
        { value: 'TRAFFIC', label: 'Traffic' },
        { value: 'FINANCE', label: 'Finance' },
        { value: 'PENSIONS', label: 'Pensions' },
      ],
    },
  ];

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
      render: (row) => <Badge variant={STATUS_VARIANT[row.status] || 'default'}>{row.statusLabel || row.status}</Badge>,
    },
  ];

  return (
    <PageWrapper title="My Applications" showBack backPath="/citizen/dashboard">
      <h2>My Applications</h2>
      <FilterBar
        filters={filterConfig}
        values={filterValues}
        onChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }))}
        onClear={() => setFilterValues({ status: '', service: '' })}
      />
      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiFileText />}
          title="No applications found"
          message="Try adjusting your filters, or apply for a service to see it here."
        />
      ) : (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default ApplicationStatus;