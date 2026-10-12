import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { useSettings } from '../../context/SettingsContext';
import LanguageToggle from '../header/LanguageToggle';
import Logo from '../header/Logo';

function Header({ title, showBack = false, backPath = -1, accentColour }) {
  const { user, logout } = useAuth();
  const { clearVerification } = useSession();
  const { settings, getMinistryColour } = useSettings();
  const navigate = useNavigate();

  const colour = accentColour || getMinistryColour(user?.ministry) || '#1A5276';
  const isCitizen = user?.role === 'CITIZEN';

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      clearVerification();
      await logout();
      navigate('/login');
    }
  };

  const handleBack = () => navigate(backPath);

  return (
    <header className="app-header" style={{ borderBottomColor: colour }}>
      <div className="header-left">
        {showBack && (
          <button
            className="header-back-btn"
            onClick={handleBack}
            aria-label="Go back"
            type="button"
          >
            <FiArrowLeft />
          </button>
        )}
        <Logo colour={colour} />
        <span className="header-title">{title || settings.systemName}</span>
      </div>

      <div className="header-right">
        <LanguageToggle />

        {user && (
          <>
            {isCitizen && (
              <Link
                to="/citizen/notifications"
                className="header-icon-btn"
                aria-label="Notifications"
              >
                <FiBell />
              </Link>
            )}

            <Link
              to="/help"
              className="header-icon-btn"
              aria-label="Help and support"
              title="Help and support"
            >
              ?
            </Link>

            <span className="header-user">
              {user.fullName || user.username}
            </span>

            <button
              className="header-logout-btn header-logout-text"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;