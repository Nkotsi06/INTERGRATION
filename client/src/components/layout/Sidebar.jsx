import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotificationPoller } from '../../context/NotificationPollerContext';
import { getSidebarConfig } from './sidebarLinks';

function Sidebar({ collapsed = false, onNavigate }) {
  const { user } = useAuth();
  const { unreadCount } = useNotificationPoller();

  const config = user ? getSidebarConfig(user.role) : null;
  if (!config) return null;

  return (
    <aside
      className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}
      aria-label="Main navigation"
    >
      <span className="app-sidebar-label">{config.label}</span>

      <nav className="app-sidebar-nav">
        {config.links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `app-sidebar-link ${isActive ? 'is-active' : ''}`
            }
          >
            {link.label}
            {link.to === '/notifications' && unreadCount > 0 && (
              <span className="app-sidebar-badge"> ({unreadCount})</span>
            )}
          </NavLink>
        ))}
      </nav>
      {/* The footer span that displayed "Citizen workspace" has been completely removed */}
    </aside>
  );
}

export default Sidebar;