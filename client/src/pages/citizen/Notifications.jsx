import { useState } from 'react';
import { FiBell, FiTrash2 } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useFetch from '../../hooks/useFetch';
import { getNotifications, deleteNotification } from '../../api/citizenApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

function Notifications() {
  const { data, loading, error, refetch } = useFetch(getNotifications, []);
  const [pendingDelete, setPendingDelete] = useState(null);
  const { success, error: showError } = useNotification();

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteNotification(pendingDelete.id);
      success('Notification deleted');
      setPendingDelete(null);
      refetch();
    } catch (err) {
      showError('Could not delete this notification.');
    }
  };

  const notifications = Array.isArray(data) ? data : [];

  return (
    <PageWrapper title="Notifications" showBack backPath="/citizen/dashboard">
      <h1>Notifications</h1>

      {loading && <p className="text-muted">Loading…</p>}

      {!loading && error && (
        <Alert type="error" message="Could not load notifications." />
      )}

      {!loading && !error && notifications.length === 0 && (
        <EmptyState
          icon={<FiBell />}
          title="No notifications"
          message="Updates about your applications will appear here."
        />
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="document-list">
          {notifications.map((n) => (
            <div key={n.id} className="card card-flat">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div>
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <small className="text-muted">
                    {formatDate(n.created_at || n.createdAt)}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-icon"
                  aria-label="Delete notification"
                  onClick={() => setPendingDelete(n)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this notification?"
        message="This will remove it from your list."
        confirmLabel="Delete"
        variant="danger"
      />
    </PageWrapper>
  );
}

export default Notifications;