import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import PageWrapper from '../../components/layout/PageWrapper';
import ServiceCard from '../../components/ministry/ServiceCard';
import { getProfile } from '../../api/citizenApi';

function CitizenDashboard() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getProfile();
        if (!cancelled) setProfile(data);
      } catch {
        // 401 handled by interceptor
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isVerified = !!profile?.isVerified;

  // No password prompt, no verification detour. Clicking a service
  // goes directly to that ministry's dashboard. The ministry itself
  // decides which actions are available to an unverified citizen.
  const handleServiceClick = (ministry) => {
    const routePrefix = ministry.code.toLowerCase().replace(/_/g, '-');
    navigate(
      ministry.code === 'HOME_AFFAIRS'
        ? '/citizen/verify'
        : `/${routePrefix}/dashboard`
    );
  };

  return (
    <PageWrapper title="Citizen Dashboard">
      <h1>Welcome, {user?.fullName?.split(' ')[0] || user?.username}</h1>

      {isVerified ? (
        <div className="verification-status verified">
          <span className="verification-status-title">
            <FiCheckCircle aria-hidden="true" /> Identity verified
          </span>
          <span className="verification-status-subtitle">
            Verified by Home Affairs
          </span>
          {profile?.nationalId && (
            <span className="verification-status-id">
              National ID: {profile.nationalId}
            </span>
          )}
        </div>
      ) : (
        <div className="verification-status pending">
          <span className="verification-status-title">
            <FiClock aria-hidden="true" /> Waiting for Home Affairs
          </span>
          <span className="verification-status-subtitle">
            Your details are being captured. Some services may be limited
            until you are verified.
          </span>
        </div>
      )}

      <section className="dashboard-section">
        <h2>Services</h2>
        <div className="services-grid">
          {settings.ministries?.map((ministry) => (
            <ServiceCard
              key={ministry.code}
              ministry={ministry}
              locked={false}
              onClick={() => handleServiceClick(ministry)}
            />
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2>My applications</h2>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/citizen/applications')}
        >
          View all applications
        </button>
      </section>

      {loadingProfile && <span className="text-muted">Loading profile…</span>}
    </PageWrapper>
  );
}

export default CitizenDashboard;