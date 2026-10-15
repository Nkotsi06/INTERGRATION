import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import LanguageToggle from '../header/LanguageToggle';
import Logo from '../header/Logo';

function Header({ title, showBack = false, backPath = -1, accentColour }) {
  const { user, logout } = useAuth();
  const { settings, getMinistryColour } = useSettings();
  const navigate = useNavigate();

  const colour = accentColour || getMinistryColour(user?.ministry) || '#1A5276';

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
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
            type="button"
            className="header-back-btn"
            onClick={handleBack}
            aria-label="Go back"
          >
            Back
          </button>
        )}
        <Logo size={40} />
        <span className="header-title">{title || settings.systemName}</span>
      </div>

      <div className="header-right">
        <LanguageToggle />

        {user && (
          <>
            <Link to="/help" className="header-icon-btn" aria-label="Help and support">
              Help
            </Link>

            <span className="header-user">
              {user.fullName || user.username}
            </span>

            <button
              type="button"
              className="header-logout-btn header-logout-text"
              onClick={handleLogout}
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