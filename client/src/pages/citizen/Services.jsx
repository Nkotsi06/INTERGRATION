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
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicServices(ministry);
        if (!cancelled) {
          if (!Array.isArray(data)) {
            throw new Error('The services response was not in the expected format.');
          }
          setServices(data);
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
  }, [ministry, reloadKey]);

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

  const applicationServices = services.filter(
    (s) => s.serviceType === 'APPLICATION'
  );
  const informationServices = services.filter(
    (s) => s.serviceType !== 'APPLICATION'
  );

  // Helper to get a color for the accent line based on ministry
  const getAccentColor = () => {
    const colors = {
      HOME_AFFAIRS: 'var(--ministry-home-affairs)',
      TRAFFIC: 'var(--ministry-traffic)',
      POLICE: 'var(--ministry-police)',
      FINANCE: 'var(--ministry-finance)',
      PENSIONS: 'var(--ministry-pensions)',
      PASSPORT: 'var(--ministry-passport)',
    };
    return colors[ministry] || 'var(--colour-accent)';
  };

  return (
    <PageWrapper
      title={`${ministryLabel} Services`}
      showBack
      backPath="/citizen/dashboard"
    >
      <h1>{ministryLabel} services</h1>
      <p className="text-muted" style={{ marginBottom: '24px' }}>
        Explore services provided by {ministryLabel}. Applications are reviewed
        by ministry staff.
      </p>

      {loading && <LoadingSpinner message="Loading services…" />}

      {!loading && error && (
        <>
          <Alert type="error" message={error} />
          <Button variant="secondary" onClick={() => setReloadKey((key) => key + 1)}>
            Retry loading services
          </Button>
        </>
      )}

      {!loading && !error && services.length === 0 && (
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
              {/* Added the colored accent line to match dashboard */}
              <div
                className="service-card-accent"
                style={{ backgroundColor: getAccentColor() }}
              />
              
              <div className="service-card-body" style={{ paddingTop: '12px' }}>
                <span className="service-card-name">{service.name}</span>
                {service.description && (
                  <span className="text-muted" style={{ marginBottom: '12px', display: 'block' }}>
                    {service.description}
                  </span>
                )}

                {!loading && !error && informationServices.length > 0 && (
                  <section className="dashboard-section">
                    <h2>Information and other services</h2>
                    <div className="services-grid">
                      {informationServices.map((service) => (
                        <Card
                          key={service.id}
                          variant="bordered"
                          className="service-card"
                        >
                          <div
                            className="service-card-accent"
                            style={{ backgroundColor: getAccentColor() }}
                          />
                          <div className="service-card-body" style={{ paddingTop: '12px' }}>
                            <span className="service-card-name">{service.name}</span>
                            {service.description && (
                              <span className="text-muted" style={{ display: 'block' }}>
                                {service.description}
                              </span>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </section>
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

    </PageWrapper>
  );
}

export default Services;