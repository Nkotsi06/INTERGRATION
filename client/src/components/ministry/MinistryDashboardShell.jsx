import { useNavigate } from 'react-router-dom';
import PageWrapper from '../layout/PageWrapper';
import ServiceCard from './ServiceCard';

/**
 * MinistryDashboardShell
 *
 * @param {string} ministryCode  - e.g. 'TRAFFIC'
 * @param {string} title         - e.g. 'Traffic Services'
 * @param {string} accentColour  - hex
 * @param {Array}  services      - [{ code, name, routePrefix, colourHex }]
 */
function MinistryDashboardShell({
  ministryCode,
  title,
  accentColour,
  services,
  intro,
}) {
  const navigate = useNavigate();

  return (
    <PageWrapper title={title} accentColour={accentColour}>
      <div className="verification-status verified">
        <span className="verification-status-title">Identity verified</span>
        <span className="verification-status-subtitle">
          Verified by Home Affairs
        </span>
      </div>

      <h1>{title}</h1>
      {intro && <p className="text-muted">{intro}</p>}

      <div className="services-grid">
        {services.map((s) => (
          <ServiceCard
            key={s.code}
            ministry={s}
            onClick={() => navigate(`/${s.routePrefix}`)}
          />
        ))}
      </div>
    </PageWrapper>
  );
}

export default MinistryDashboardShell;