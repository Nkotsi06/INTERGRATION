import { useState, useMemo } from 'react';
import { FiClock } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import useFetch from '../../hooks/useFetch';
import { getStaffVerifications, processVerification } from '../../api/pensionsApi';
import { useNotification } from '../../context/NotificationContext';

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
    { key: 'citizenName', label: 'Citizen' },
    { key: 'nationalId', label: 'National ID' },
    { key: 'lastVerified', label: 'Last verified' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge variant="captured" label={r.status} /> },
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

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiClock />}
          title="No verifications match"
          message="Change the filters to see more."
        />
      ) : (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default ProcessVerification;