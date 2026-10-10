import { useState, useMemo } from 'react';
import { FiCalendar } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useFetch from '../../hooks/useFetch';
import { getAppointments, cancelAppointment } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

function MyAppointments() {
  const { data: appointments, loading, refetch } = useFetch(getAppointments, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [pendingCancel, setPendingCancel] = useState(null);
  const { success, error: showError } = useNotification();

  const filtered = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (dateFilter && a.date < dateFilter) return false;
      return true;
    });
  }, [appointments, statusFilter, dateFilter]);

  const hasActive = !!(statusFilter || dateFilter);

  const handleCancel = async () => {
    try {
      await cancelAppointment(pendingCancel.id);
      success('Appointment cancelled');
      setPendingCancel(null);
      refetch();
    } catch (err) {
      showError('Could not cancel the appointment.');
    }
  };

  const columns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'time', label: 'Time' },
    { key: 'type', label: 'Type' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge variant={r.status === 'CANCELLED' ? 'rejected' : 'pending'} label={r.status} /> },
    { key: 'actions', label: 'Actions', render: (r) => (
      <Button variant="secondary" size="small" onClick={() => setPendingCancel(r)}>
        Cancel
      </Button>
    ) },
  ];

  return (
    <PageWrapper
      title="My Appointments"
      showBack
      backPath="/traffic/dashboard"
      accentColour="#B9770E"
    >
      <h1>My appointments</h1>

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
              <option value="BOOKED">Booked</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="filter-dropdown">
            <label className="filter-label">From date</label>
            <input
              type="date"
              className="filter-date-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {hasActive && (
          <button
            type="button"
            className="clear-filters"
            onClick={() => {
              setStatusFilter('');
              setDateFilter('');
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiCalendar />}
          title="No appointments found"
          message="Try adjusting the filters or book a new test."
        />
      ) : (
        <Table columns={columns} data={filtered} />
      )}

      <ConfirmDialog
        isOpen={!!pendingCancel}
        onClose={() => setPendingCancel(null)}
        onConfirm={handleCancel}
        title="Cancel this appointment?"
        message="You will need to book a new one."
        confirmLabel="Cancel appointment"
        variant="danger"
      />
    </PageWrapper>
  );
}

export default MyAppointments;