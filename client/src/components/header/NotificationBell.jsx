import { FiBell } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function NotificationBell({ count = 0 }) {
  return (
    <Link to="/citizen/notifications" className="notification-bell" aria-label="Notifications">
      <FiBell />
      {count > 0 && <span className="notification-count">{count}</span>}
    </Link>
  );
}

export default NotificationBell;