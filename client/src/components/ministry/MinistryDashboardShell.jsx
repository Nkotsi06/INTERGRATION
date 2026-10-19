import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../layout/PageWrapper';
import Card from '../common/Card';
import Alert from '../common/Alert';
import { StatsSkeleton } from '../common/SkeletonLoader';
import { getPublicServices } from '../../api/serviceApi';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';

function MinistryDashboardShell({
  ministryCode,
  title,
  accentColour,
  intro,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { session } = useSession();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicServices(ministryCode);
        if (!cancelled) setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load services.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [ministryCode]);

  // Route to the right page. If a service has a `legacyRoute`
  // (a service code we still serve via a dedicated page), use it.
  // Otherwise go to the generic catalogue apply page.
  const legacyRoutes = {
    // Traffic
    DRIVERS_LICENCE_VIEW: '/traffic/licence',
    DRIVING_LICENCE: '/traffic/licence/driving',
    DRIVING_LICENCE_APPLY: '/traffic/licence/driving',
    LICENCE_RENEWAL: '/traffic/renew',
    DRIVING_TEST_BOOKING: '/traffic/book-test',
    MY_APPOINTMENTS: '/traffic/appointments',
    MY_VEHICLES: '/traffic/vehicles',
    MY_INSPECTIONS: '/traffic/inspections',
    MY_VEHICLE_LICENCES: '/traffic/vehicle-licences',
    MY_TRANSPORT_PERMITS: '/traffic/permits',
    MY_TRAFFIC_APPLICATIONS: '/traffic/applications',
    // Police
    POLICE_REPORT: '/police/report',
    POLICE_CASES: '/police/cases',
    POLICE_CLEARANCE: '/police/clearance',
    // Pensions
    PENSION_LIFE_VERIFY: '/pensions/verify',
    PENSION_INFO: '/pensions/info',
    PENSION_HISTORY: '/pensions/history',
    // Passport
    PASSPORT_APPLY: '/passport/apply',
    PASSPORT_NEW: '/passport/apply',
    PASSPORT_RENEWAL: '/passport/apply?type=renewal',
    PASSPORT_LOST: '/passport/apply?type=lost',
    PASSPORT_URGENT: '/passport/apply?type=urgent',
    PASSPORT_MINOR: '/passport/apply?type=minor',
    PASSPORT_STATUS: '/passport/status',
    // Finance
    TAX_REGISTER: '/finance/tax/register',
    TAX_PROFILE: '/finance/tax/profile',
    TAX_PAYMENT: '/finance/payment',
    TAX_CLEARANCE: '/finance/tax/clearance',
  };

  const handleServiceClick = (service) => {
    if (!session?.identityVerified) {
      navigate('/citizen/verify', {
        state: { targetMinistry: ministryCode },
      });
      return;
    }
    const legacy = legacyRoutes[service.code];
    if (legacy) {
      navigate(legacy);
    } else {
      navigate(`/citizen/services/${service.id}/apply`);
    }
  };

  const applications = services.filter((s) => s.service_type === 'APPLICATION');
  const information = services.filter((s) => s.service_type === 'INFORMATION');

  return (
    <PageWrapper title={title} accentColour={accentColour}>
      <h1>{title}</h1>
      {intro && <p className="text-muted">{intro}</p>}

      {loading && <StatsSkeleton count={4} />}

      {!loading && error && <Alert type="error" message={error} />}

      {!loading && !error && services.length === 0 && (
        <p className="text-muted">
          No services are available from this ministry right now.
        </p>
      )}

      {!loading && !error && applications.length > 0 && (
        <section className="dashboard-section">
          <h2>Apply for a service</h2>
          <div className="services-grid">
            {applications.map((s) => (
              <Card
                key={s.id}
                variant="bordered"
                className="service-card"
                onClick={() => handleServiceClick(s)}
              >
                <div
                  className="service-card-accent"
                  style={{ backgroundColor: accentColour }}
                />
                <div className="service-card-body">
                  <span className="service-card-name">{s.name}</span>
                  {s.description && (
                    <span className="text-muted">{s.description}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {!loading && !error && information.length > 0 && (
        <section className="dashboard-section">
          <h2>Information</h2>
          <div className="services-grid">
            {information.map((s) => (
              <Card
                key={s.id}
                variant="bordered"
                className="service-card"
                onClick={() => handleServiceClick(s)}
              >
                <div className="service-card-body">
                  <span className="service-card-name">{s.name}</span>
                  {s.description && (
                    <span className="text-muted">{s.description}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="form-actions">
        <div className="form-actions-primary-group">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/citizen/dashboard')}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}

export default MinistryDashboardShell;