import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useFetch from '../../hooks/useFetch';
import { getInspections, cancelInspection } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  BOOKED: 'captured',
  COMPLETED: 'verified',
  PASSED: 'verified',
  FAILED: 'rejected',
  CANCELLED: 'rejected',
};

function MyInspections() {
  const { data, loading, refetch } = useFetch(getInspections, [], {
    pollInterval: 30000,
  });
  const [pendingCancel, setPendingCancel] = useState(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const handleCancel = async () => {
    setBusy(true);
    try {
      await cancelInspection(pendingCancel.id);
      success('Inspection cancelled');
      setPendingCancel(null);
      refetch();
    } catch (err) {
      showError('Could not cancel the inspection.');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'inspection_type', label: 'Type' },
    { key: 'inspection_date', label: 'Date', render: (r) => r.inspection_date ? formatDate(r.inspection_date) : '—' },
    { key: 'location', label: 'Location', render: (r) => r.location || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
    {
      key: 'actions',
      label: '',
      render: (r) =>
        r.status === 'BOOKED' ? (
          <Button variant="danger" size="small" onClick={() => setPendingCancel(r)}>Cancel</Button>
        ) : null,
    },
  ];

  return (
    <PageWrapper title="Vehicle Inspections" showBack backPath="/traffic/dashboard" accentColour="#B9770E">
      <h1>Vehicle inspections</h1>

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/traffic/inspections/new')}>
          Book inspection
        </Button>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No inspections booked" message="Click 'Book inspection' to schedule one." />
      ) : (
        <Table columns={columns} data={data} />
      )}

      <ConfirmDialog
        isOpen={!!pendingCancel}
        onClose={() => setPendingCancel(null)}
        onConfirm={handleCancel}
        title="Cancel this inspection?"
        message="You will need to book a new one."
        confirmLabel="Cancel inspection"
        variant="danger"
        loading={busy}
      />
    </PageWrapper>
  );
}

export default MyInspections;