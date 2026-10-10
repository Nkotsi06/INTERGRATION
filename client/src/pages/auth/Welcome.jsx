import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import Footer from '../../components/layout/Footer';
import Logo from '../../components/header/Logo';
import LanguageToggle from '../../components/header/LanguageToggle';

function Welcome() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  return (
    <div className="welcome-page">
      <header className="welcome-header">
        <Logo />
        <div className="welcome-header-right">
          <LanguageToggle />
        </div>
      </header>

      <main className="welcome-main">
        <div className="welcome-card">
          <Logo />
          <h1 className="welcome-title">{settings.systemName}</h1>
          <p className="welcome-tagline">
            Access government services easily and securely, in one place.
          </p>

          <div className="welcome-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>

          <div className="auth-links-secondary">
            <Link to="/staff/login">Staff login</Link>
            <span className="auth-links-sep">|</span>
            <Link to="/admin/login">Admin login</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Welcome;