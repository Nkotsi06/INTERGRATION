import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useFetch from '../../hooks/useFetch';
import apiClient from '../../api/apiClient';
import { useNotification } from '../../context/NotificationContext';
import { useNotificationPoller } from '../../context/NotificationPollerContext';
import { formatDate } from '../../utils/formatters';

function Notifications() {
  const { data, loading, error, refetch } = useFetch(
    () => apiClient.get('/notifications'),
    []
  );
  const [pendingDelete, setPendingDelete] = useState(null);
  const { success, error: showError } = useNotification();
  const { clearAll } = useNotificationPoller();

  const notifications = Array.isArray(data) ? data : [];

  useEffect(() => {
    if (loading || error) return;
    if (!notifications.some((n) => !n.is_read)) return;

    let cancelled = false;
    apiClient
      .put('/notifications/read-all')
      .then(() => {
        if (!cancelled) clearAll();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [loading, error, notifications, clearAll]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await apiClient.delete(`/notifications/${pendingDelete.id}`);
      success('Notification deleted');
      setPendingDelete(null);
      refetch();
    } catch (err) {
      showError('Could not delete this notification.');
    }
  };

  const handleMarkRead = async (n) => {
    if (n.is_read) return;
    try {
      await apiClient.put(`/notifications/${n.id}/read`);
      refetch();
    } catch (err) {}
  };

  return (
    <PageWrapper title="Notifications" showBack backPath="/">
      <h1>Notifications</h1>

      {loading && <p className="text-muted">Loading…</p>}

      {!loading && error && (
        <Alert type="error" message="Could not load notifications." />
      )}

      {!loading && !error && notifications.length === 0 && (
        <EmptyState
          title="No notifications"
          message="Updates will appear here."
        />
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="document-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`card card-flat notification-item ${n.is_read ? '' : 'is-unread'}`}
              onClick={() => handleMarkRead(n)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleMarkRead(n);
              }}
            >
              <div className="notification-item-body">
                <div>
                  <strong>{n.title}</strong>
                  {!n.is_read && <span className="notification-unread-marker"> · New</span>}
                  <p>{n.message}</p>
                  <small className="text-muted">
                    {formatDate(n.created_at || n.createdAt)}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete(n);
                  }}
                >
                  Delete
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