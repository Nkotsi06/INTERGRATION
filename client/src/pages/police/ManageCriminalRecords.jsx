import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getStaffCriminalRecords, processCriminalRecord } from '../../api/policeApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  PENDING: 'captured',
  ISSUED: 'verified',
  REJECTED: 'rejected',
};

function ManageCriminalRecords() {
  const { data, loading, error, refetch } = useFetch(getStaffCriminalRecords, [], {
    pollInterval: 30000,
  });
  const [actionError, setActionError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const handleAction = async (row, action) => {
    setActionError(null);
    setProcessingId(row.id);
    try {
      await processCriminalRecord(row.id, { action });
      await refetch();
    } catch (err) {
      setActionError(err.message || 'Could not update the criminal record request.');
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'citizen_name', label: 'Citizen', render: (row) => row.citizen_name || row.citizen_id },
    { key: 'purpose', label: 'Purpose' },
    { key: 'created_at', label: 'Requested', render: (row) => formatDate(row.created_at) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge variant={STATUS_VARIANT[row.status] || 'pending'} label={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => row.status === 'PENDING' ? (
        <>
          <Button
            variant="primary"
            size="small"
            disabled={processingId === row.id}
            onClick={() => handleAction(row, 'ISSUE')}
          >
            Issue
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
    <PageWrapper title="Manage Criminal Records" showBack backPath="/police/staff" accentColour="#922B21">
      <h1>Manage criminal record requests</h1>
      {error && <Alert type="error" message={error} />}
      {actionError && <Alert type="error" message={actionError} />}
      {loading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : error ? null : !data || data.length === 0 ? (
        <EmptyState title="No criminal record requests" message="New requests will appear here." />
      ) : (
        <Table columns={columns} data={data} />
      )}
    </PageWrapper>
  );
}

export default ManageCriminalRecords;
