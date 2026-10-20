import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { useSettings } from '../../context/SettingsContext';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import { getProfile } from '../../api/citizenApi';

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
        // 401 handled by interceptor
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
    navigate(`/citizen/services?ministry=${encodeURIComponent(ministry.code)}`);
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

        {/* Changed from ministry-grid to services-grid */}
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
                  {isVerified ? 'Open services' : 'Verification required'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}

export default CitizenDashboard;