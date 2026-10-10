import { FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const STATUS_CONFIG = {
  VERIFIED: { icon: <FiCheckCircle />, label: 'Verified', variant: 'success' },
  PENDING: { icon: <FiClock />, label: 'Pending', variant: 'warning' },
  REJECTED: { icon: <FiXCircle />, label: 'Rejected', variant: 'error' },
};

function DocumentStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`badge badge-${config.variant}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}

export default DocumentStatusBadge;