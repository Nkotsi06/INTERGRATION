import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useFetch from '../../hooks/useFetch';
import { getVehicles, deleteVehicle } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

function MyVehicles() {
  const { data: vehicles, loading, refetch } = useFetch(getVehicles, []);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteVehicle(pendingDelete.id);
      success('Vehicle deleted');
      setPendingDelete(null);
      refetch();
    } catch (err) {
      showError('Could not delete the vehicle.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'registration_number', label: 'Registration' },
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'year', label: 'Year', render: (r) => r.year || '—' },
    { key: 'colour', label: 'Colour', render: (r) => r.colour || '—' },
    { key: 'status', label: 'Status', render: (r) => r.status || 'ACTIVE' },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" size="small"
            onClick={() => navigate(`/traffic/vehicles/edit/${r.id}`)}>
            Edit
          </Button>
          <Button variant="danger" size="small" onClick={() => setPendingDelete(r)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="My Vehicles" showBack backPath="/traffic/dashboard" accentColour="#B9770E">
      <h1>My vehicles</h1>

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/traffic/vehicles/new')}>
          Register a vehicle
        </Button>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : !vehicles || vehicles.length === 0 ? (
        <EmptyState title="No vehicles registered" message="Click 'Register a vehicle' to add one." />
      ) : (
        <Table columns={columns} data={vehicles} />
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this vehicle?"
        message={`${pendingDelete?.registration_number || 'This vehicle'} will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </PageWrapper>
  );
}

export default MyVehicles;