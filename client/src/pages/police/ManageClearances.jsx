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
import apiClient from '../../api/apiClient';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

function ManageClearances() {
  const { data, loading, error, refetch } = useFetch(getStaffClearances, [], {
    pollInterval: 30000,
  });
  const [actionError, setActionError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

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

  const downloadClearancePdf = async (row) => {
    setDownloadingId(row.id);
    try {
      const response = await apiClient.get(`/police/staff/clearances/${row.id}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data || response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Clearance_${row.reference_number || row.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setActionError('Could not download clearance PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'citizen_name', label: 'Citizen' },
    { key: 'purpose', label: 'Purpose', render: (row) => row.form_data?.purpose || '—' },
    { key: 'station', label: 'Collection Station', render: (row) => row.form_data?.station || '—' },
    { key: 'submitted_at', label: 'Submitted', render: (row) => formatDate(row.submitted_at) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge variant={STATUS_VARIANT[row.status] || 'pending'} label={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        if (row.status === 'SUBMITTED') {
          return (
            <div style={{ display: 'flex', gap: 6 }}>
              <Button
                variant="primary"
                size="small"
                disabled={processingId === row.id}
                onClick={() => handleAction(row, 'APPROVE')}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="small"
                disabled={processingId === row.id}
                onClick={() => handleAction(row, 'REJECT')}
              >
                Reject
              </Button>
            </div>
          );
        }

        if (row.status === 'APPROVED') {
          return (
            <Button
              variant="secondary"
              size="small"
              disabled={downloadingId === row.id}
              onClick={() => downloadClearancePdf(row)}
            >
              {downloadingId === row.id ? 'Downloading…' : 'Download Clearance PDF'}
            </Button>
          );
        }

        return <span className="text-muted">Processed</span>;
      },
    },
  ];

  return (
    <PageWrapper title="Manage Clearances" showBack backPath="/police/staff" accentColour="#922B21">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Manage Clearance Applications</h1>
          <p className="text-muted" style={{ margin: '4px 0 0 0' }}>
            Review, approve, reject, or download approved police clearance certificates.
          </p>
        </div>
      </div>

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
