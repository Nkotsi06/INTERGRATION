import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { useSettings } from '../../context/SettingsContext';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import { getProfile } from '../../api/citizenApi';
import { getPublicServices } from '../../api/serviceApi';

function CitizenDashboard() {
  const { user } = useAuth();
  const { session } = useSession();
  const { settings, loading: settingsLoading } = useSettings();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [availableMinistries, setAvailableMinistries] = useState(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState(null);

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

  useEffect(() => {
    if (settingsLoading) return undefined;

    let cancelled = false;
    setLoadingServices(true);
    setServicesError(null);
    Promise.all(
      (settings.ministries || []).map(async (ministry) => {
        const services = await getPublicServices(ministry.code);
        if (!Array.isArray(services)) {
          throw new Error('The services response was not in the expected format.');
        }
        return services.length > 0 ? String(ministry.code).toUpperCase() : null;
      })
    )
      .then((codes) => {
        if (!cancelled) {
          setAvailableMinistries(new Set(codes.filter(Boolean)));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setServicesError(error.message || 'Could not load available services.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingServices(false);
      });
    return () => { cancelled = true; };
  }, [settings.ministries, settingsLoading]);

  const isVerified = !!profile?.isVerified;

  const handleMinistryClick = (ministry) => {
    if (!isVerified || !session?.identityVerified) {
      navigate('/citizen/verify', { state: { targetMinistry: ministry.code } });
      return;
    }
    navigate(`/citizen/services?ministry=${encodeURIComponent(ministry.code)}`);
  };

  const ministries = settings.ministries || [];
  const visibleMinistries = availableMinistries
    ? ministries.filter((ministry) =>
        availableMinistries.has(String(ministry.code || '').toUpperCase())
      )
    : ministries;
  const showSkeleton =
    settingsLoading ||
    loadingServices ||
    (loadingProfile && ministries.length === 0);

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
        {servicesError && <Alert type="error" message={servicesError} />}

        {!showSkeleton && (
          <div className="services-grid">
            {visibleMinistries.map((ministry) => (
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
        )}
      </section>
    </PageWrapper>
  );
}

export default CitizenDashboard;