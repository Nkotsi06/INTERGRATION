import { useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';

function ServiceCard({ ministry, onClick, locked = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(ministry);
    } else {
      navigate(`/${ministry.routePrefix}/dashboard`);
    }
  };

  return (
    <button
      type="button"
      className={`service-card ${locked ? 'is-locked' : ''}`}
      onClick={handleClick}
      aria-label={`${ministry.name}${locked ? ' (available after verification)' : ''}`}
    >
      <span
        className="service-card-accent"
        style={{ backgroundColor: ministry.colourHex }}
        aria-hidden="true"
      />
      <span className="service-card-body">
        <span className="service-card-name">{ministry.name}</span>
        {locked && (
          <span className="service-card-lock">
            <FiLock aria-hidden="true" /> Available after verification
          </span>
        )}
      </span>
    </button>
  );
}

export default ServiceCard;