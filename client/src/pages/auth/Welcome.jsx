import { Link, useNavigate } from 'react-router-dom';
import LanguageToggle from '../../components/header/LanguageToggle';

export default function WelcomePage() {
  const navigate = useNavigate();

  const entryOptions = [
    {
      title: 'Apply for Birth Certificate',
      description: 'For a child aged 0–16, or an adult applying late for themselves. No account is needed to start.',
      path: '/birth-certificate/apply',
    },
    {
      title: 'Sign In',
      description: 'Already have a National ID number? Sign in to continue to your services.',
      path: '/login',
    },
    {
      title: 'Register with existing ID number',
      description: 'Verify your National ID in the registry, choose a username, and receive a temporary password.',
      path: '/register',
    },
  ];

  return (
    <div className="welcome-page-container">
      <header className="welcome-header">
        <div className="header-left">
          {/* Uses the global app-logo class */}
          <img src="/Logo.jpeg" alt="Lesotho Coat of Arms" className="app-logo" />
          <div>
            <h2 style={{ margin: 0, color: '#1A5276', fontSize: '1.2rem' }}>Integrated Government Services</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Government of Lesotho</p>
          </div>
        </div>
        <div className="header-right">
          <LanguageToggle />
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-label">WELCOME TO THE</span>
          <h1 className="hero-title">Integrated Government<br/>Services System</h1>
          <p className="hero-desc">
            Access essential public services, submit applications, track requests, and stay informed — all in one secure digital platform.
          </p>
          <p className="hero-tags">Simple &nbsp;|&nbsp; Secure &nbsp;|&nbsp; Convenient</p>
          <button className="btn-primary-hero" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
        <div className="hero-image">
          <img src="/background.jpg" alt="national flag" />
        </div>
      </section>

      <section className="services-section">
        <h2 className="services-title">Choose how to continue</h2>
        <p className="services-subtitle">
          Start a birth registration, sign in with your National ID, or register an existing ID.
        </p>
        <div className="services-grid-welcome">
          {entryOptions.map((option) => (
            <Link
              key={option.path}
              className="service-card-welcome"
              to={option.path}
            >
              <div className="service-img-placeholder">
                <span>{option.title}</span>
              </div>
              <div className="service-body">
                <h3>{option.title}</h3>
                <p>{option.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}