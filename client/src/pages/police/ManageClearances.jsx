import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getStaffClearances, processClearance } from '../../api/policeApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured',
  APPROVED: 'verified',
  REJECTED: 'rejected',
};

function ManageClearances() {
  const { data, loading, error, refetch } = useFetch(getStaffClearances, [], {
    pollInterval: 30000,
  });
  const [actionError, setActionError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const handleAction = async (row, action) => {
    setActionError(null);
    setProcessingId(row.id);
    try {
      await processClearance(row.id, { action });
      await refetch();
    } catch (err) {
      setActionError(err.message || 'Could not update the clearance request.');
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'citizen_name', label: 'Citizen' },
    { key: 'purpose', label: 'Purpose', render: (row) => row.form_data?.purpose || '—' },
    { key: 'station', label: 'Collection station', render: (row) => row.form_data?.station || '—' },
    { key: 'submitted_at', label: 'Submitted', render: (row) => formatDate(row.submitted_at) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge variant={STATUS_VARIANT[row.status] || 'pending'} label={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => row.status === 'SUBMITTED' ? (
        <>
          <Button
            variant="primary"
            size="small"
            disabled={processingId === row.id}
            onClick={() => handleAction(row, 'APPROVE')}
          >
            Approve
          </Button>
          <Button
            variant="secondary"
            size="small"
            disabled={processingId === row.id}
            onClick={() => handleAction(row, 'REJECT')}
            style={{ marginLeft: 8 }}
          >
            Reject
          </Button>
        </>
      ) : '—',
    },
  ];

  return (
    <PageWrapper title="Manage Clearances" showBack backPath="/police/staff" accentColour="#922B21">
      <h1>Manage clearance applications</h1>
      {error && <Alert type="error" message={error} />}
      {actionError && <Alert type="error" message={actionError} />}
      {loading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : error ? null : !data || data.length === 0 ? (
        <EmptyState title="No clearance requests" message="New police clearance applications will appear here." />
      ) : (
        <Table columns={columns} data={data} />
      )}
    </PageWrapper>
  );
}

export default ManageClearances;
