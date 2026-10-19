import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { getPublicServices } from '../../api/serviceApi';

const MINISTRY_LABELS = {
  HOME_AFFAIRS: 'Home Affairs',
  TRAFFIC: 'Traffic',
  POLICE: 'Police',
  FINANCE: 'Finance',
  PENSIONS: 'Pensions',
  PASSPORT: 'Passport',
};

function Services() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ministry = (searchParams.get('ministry') || 'HOME_AFFAIRS').toUpperCase();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicServices(ministry);
        if (!cancelled) {
          setServices(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              'Could not load services. Please try again in a moment.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ministry]);

  const ministryLabel = MINISTRY_LABELS[ministry] || ministry;
  const legacyRoutes = {
    PASSPORT_APPLY: '/passport/apply',
    PASSPORT_NEW: '/passport/apply',
    PASSPORT_RENEWAL: '/passport/apply?type=renewal',
    PASSPORT_LOST: '/passport/apply?type=lost',
    PASSPORT_URGENT: '/passport/apply?type=urgent',
    PASSPORT_MINOR: '/passport/apply?type=minor',
    DRIVING_LICENCE: '/traffic/licence/driving',
    LICENCE_RENEWAL: '/traffic/renew',
    MY_VEHICLES: '/traffic/vehicles',
    MY_VEHICLE_LICENCES: '/traffic/vehicle-licences',
    MY_TRANSPORT_PERMITS: '/traffic/permits',
  };

  // Only APPLICATION services appear as cards. Information services
  // (immigration, citizenship, refugee, livestock, document verify)
  // are read through the Help and Support section instead, per the
  // master prompt: information is not on the citizen dashboard.
  const applicationServices = services.filter(
    (s) => s.service_type === 'APPLICATION'
  );

  return (
    <PageWrapper
      title={`${ministryLabel} Services`}
      showBack
      backPath="/citizen/dashboard"
    >
      <h1>{ministryLabel} services</h1>
      <p className="text-muted">
        Choose a service to apply for. Your application will be reviewed by{' '}
        {ministryLabel} staff.
      </p>

      {loading && <LoadingSpinner message="Loading services…" />}

      {!loading && error && <Alert type="error" message={error} />}

      {!loading && !error && applicationServices.length === 0 && (
        <EmptyState
          title={`No services available from ${ministryLabel}`}
          message="This ministry has no services enabled at the moment. Please check back later, or choose a different ministry from your dashboard."
          actionLabel="Back to dashboard"
          onAction={() => navigate('/citizen/dashboard')}
        />
      )}

      {!loading && !error && applicationServices.length > 0 && (
        <div className="services-grid">
          {applicationServices.map((service) => (
            <Card
              key={service.id}
              variant="bordered"
              className="service-card"
            >
              <div className="service-card-body">
                <span className="service-card-name">{service.name}</span>
                {service.description && (
                  <span className="text-muted">{service.description}</span>
                )}
                <Button
                  variant="primary"
                  onClick={() =>
                    navigate(
                      legacyRoutes[service.code] ||
                        `/citizen/services/${service.id}/apply`
                    )
                  }
                >
                  Apply
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Information services (if any) are read through Help. */}
      {!loading && !error && (
        <p className="text-muted" style={{ marginTop: 24 }}>
          Need information on immigration, citizenship, refugee services,
          livestock registration, or document verification?{' '}
          <a href="/help">Visit Help and Support</a>.
        </p>
      )}
    </PageWrapper>
  );
}

export default Services;