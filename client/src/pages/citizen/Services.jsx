import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
  const ministry = searchParams.get('ministry') || 'HOME_AFFAIRS';

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
        if (!cancelled) setServices(Array.isArray(data) ? data : []);
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

  return (
    <PageWrapper
      title={`${ministryLabel} Services`}
      showBack
      backPath="/citizen/dashboard"
    >
      <h1>{ministryLabel} services</h1>
      <p className="text-muted">
        Choose a service to apply for. Your application will be reviewed by
        {' '}
        {ministryLabel}
        {' '}
        staff.
      </p>

      {loading && <LoadingSpinner message="Loading services…" />}

      {!loading && error && <Alert type="error" message={error} />}

      {!loading && !error && services.length === 0 && (
        <Alert
          type="info"
          message={`No services are currently available from ${ministryLabel}.`}
        />
      )}

      {!loading && !error && services.length > 0 && (
        <div className="services-grid">
          {services.map((service) => (
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

                {service.service_type === 'INFORMATION' ? (
                  <span className="text-muted">
                    Information only — no application required.
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() =>
                      navigate(`/citizen/services/${service.id}/apply`)
                    }
                  >
                    Apply
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

export default Services;