import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import LanguageToggle from '../header/LanguageToggle';
import Logo from '../header/Logo';
import { FiArrowLeft, FiLogOut } from '../../utils/actionIcons';

function Header({ title, showBack = false, backPath = -1, accentColour }) {
  const { user, logout } = useAuth();
  const { settings, getMinistryColour } = useSettings();
  const navigate = useNavigate();

  // A ministry colour comes from the database. Admin has no ministry.
  // Citizens with no ministry use the neutral accent. Only when a
  // ministry has no colour is the fallback used.
  const ministryColour = getMinistryColour(user?.ministry);
  const colour = accentColour || ministryColour || 'var(--colour-accent)';

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
            <FiArrowLeft className="ui-icon" aria-hidden="true" focusable="false" />
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
            <span className="header-user">
              {user.fullName || user.username}
            </span>

            <button
              type="button"
              className="header-logout-btn header-logout-text"
              onClick={handleLogout}
            >
              <FiLogOut className="ui-icon" aria-hidden="true" focusable="false" />
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
