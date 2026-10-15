import { useNavigate } from 'react-router-dom';
import { useNotificationPoller } from '../../context/NotificationPollerContext';

function NotificationBanner() {
  const { latestBatch, dismissBatch } = useNotificationPoller();
  const navigate = useNavigate();

  if (!latestBatch) return null;

  const { count } = latestBatch;

  return (
    <div
      className="notification-banner"
      role="status"
      aria-live="polite"
    >
      <span className="notification-banner-text">
        {count === 1
          ? 'You have 1 new notification'
          : `You have ${count} new notifications`}
      </span>
      <div className="notification-banner-actions">
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => {
            dismissBatch();
            navigate('/notifications');
          }}
        >
          View notifications
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={dismissBatch}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default NotificationBanner;