import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { useSettings } from '../../context/SettingsContext';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import { getProfile } from '../../api/citizenApi';

const MINISTRY_PREFIX = {
  HOME_AFFAIRS: 'home-affairs',
  TRAFFIC: 'traffic',
  POLICE: 'police',
  FINANCE: 'finance',
  PENSIONS: 'pensions',
  PASSPORT: 'passport',
};

function CitizenDashboard() {
  const { user } = useAuth();
  const { session } = useSession();
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
        // 401 handled by the interceptor
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const isVerified = !!profile?.isVerified;

  const handleMinistryClick = (ministry) => {
    if (!isVerified || !session?.identityVerified) {
      navigate('/citizen/verify', { state: { targetMinistry: ministry.code } });
      return;
    }
    const prefix = MINISTRY_PREFIX[ministry.code];
    if (prefix) navigate(`/${prefix}/dashboard`);
  };

  const ministries = settings.ministries || [];
  const showSkeleton = loadingProfile && ministries.length === 0;

  return (
    <PageWrapper title="Citizen Dashboard">
      <h1>Welcome, {user?.fullName?.split(' ')[0] || user?.username}</h1>

      {isVerified ? (
        <div className="verification-status verified">
          <span className="verification-status-title">Identity verified</span>
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
          <span className="verification-status-title">Waiting for Home Affairs</span>
          <span className="verification-status-subtitle">
            Services unlock once your identity is verified.
          </span>
        </div>
      )}

      <section className="dashboard-section">
        <h2>Government services</h2>

        {showSkeleton && <StatsSkeleton count={6} />}

        <div className="services-grid">
          {ministries.map((ministry) => (
            <Card
              key={ministry.code}
              variant="bordered"
              className="service-card"
              onClick={() => handleMinistryClick(ministry)}
            >
              <div
                className="service-card-accent"
                style={{ backgroundColor: ministry.colourHex }}
              />
              <div className="service-card-body">
                <span className="service-card-name">{ministry.name}</span>
                <span className="text-muted">
                  {isVerified
                    ? 'Open services'
                    : 'Verification required'}
                </span>
              </div>
            </Card>
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

      <section className="dashboard-section">
        <h2>Help and support</h2>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/help')}
        >
          Open Help
        </button>
      </section>
    </PageWrapper>
  );
}

export default CitizenDashboard;