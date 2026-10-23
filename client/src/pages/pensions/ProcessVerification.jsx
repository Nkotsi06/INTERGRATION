import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getStaffVerifications, processVerification } from '../../api/pensionsApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

function ProcessVerification() {
  const { data, loading, refetch } = useFetch(getStaffVerifications, []);
  const [statusFilter, setStatusFilter] = useState('');
  const { success, error: showError } = useNotification();

  const filtered = useMemo(() => {
    if (!data) return [];
    return statusFilter ? data.filter((v) => v.status === statusFilter) : data;
  }, [data, statusFilter]);

  const handleConfirm = async (id) => {
    try {
      await processVerification(id, { action: 'CONFIRM' });
      success('Verification confirmed');
      refetch();
    } catch (err) {
      showError('Could not confirm this verification.');
    }
  };

  const columns = [
    {
      key: 'citizenName',
      label: 'Citizen',
      render: (r) => {
        const name = [r.firstName, r.lastName].filter(Boolean).join(' ').trim();
        return name || '—';
      },
    },
    { key: 'nationalId', label: 'National ID', render: (r) => r.nationalId || '—' },
    {
      key: 'verifiedAt',
      label: 'Last verified',
      render: (r) => (r.verifiedAt ? formatDate(r.verifiedAt) : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <StatusBadge
          variant={r.status === 'VERIFIED' ? 'verified' : 'pending'}
          label={r.status}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <Button variant="success" size="small" onClick={() => handleConfirm(r.id)}>
          Confirm
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Process Verification"
      showBack
      backPath="/pensions/staff"
      accentColour="#7D3C98"
    >
      <h1>Process verification</h1>
      <p className="text-muted">
        Only citizens verified by Home Affairs appear here.
      </p>

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
              <option value="VERIFIED">Verified</option>
            </select>
          </div>
        </div>
        {statusFilter && (
          <button
            type="button"
            className="clear-filters"
            onClick={() => setStatusFilter('')}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && <TableSkeleton rows={6} columns={5} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No verifications match"
          message="Change the filters to see more."
        />
      )}

      {!loading && filtered.length > 0 && (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default ProcessVerification;