import { Link } from 'react-router-dom';
import { FiBell } from '../../utils/actionIcons';

function NotificationBell({ count = 0 }) {
  return (
    <Link to="/citizen/notifications" className="notification-bell" aria-label="Notifications">
      <FiBell aria-hidden="true" focusable="false" />
      {count > 0 && <span className="notification-count">{count}</span>}
    </Link>
  );
}

export default NotificationBell;