import {
  FiClock,
  FiEdit3,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiCircle,
} from 'react-icons/fi';

const VARIANTS = {
  awaiting: {
    label: 'Awaiting Home Affairs',
    className: 'status-badge-awaiting',
    icon: <FiClock />,
  },
  captured: {
    label: 'Details captured',
    className: 'status-badge-captured',
    icon: <FiEdit3 />,
  },
  verified: {
    label: 'Verified',
    className: 'status-badge-verified',
    icon: <FiCheckCircle />,
  },
  pending: {
    label: 'Pending',
    className: 'status-badge-captured',
    icon: <FiClock />,
  },
  approved: {
    label: 'Approved',
    className: 'status-badge-verified',
    icon: <FiCheckCircle />,
  },
  rejected: {
    label: 'Rejected',
    className: 'status-badge-awaiting',
    icon: <FiXCircle />,
  },
  inReview: {
    label: 'Under review',
    className: 'status-badge-captured',
    icon: <FiAlertCircle />,
  },
  draft: {
    label: 'Draft',
    className: 'status-badge-awaiting',
    icon: <FiCircle />,
  },
  completed: {
    label: 'Completed',
    className: 'status-badge-verified',
    icon: <FiCheckCircle />,
  },
};

function StatusBadge({ variant, label }) {
  const config = VARIANTS[variant];
  if (!config) return null;

  return (
    <span
      className={`status-badge ${config.className}`}
      role="status"
      aria-label={label || config.label}
    >
      <span className="status-badge-icon" aria-hidden="true">
        {config.icon}
      </span>
      <span>{label || config.label}</span>
    </span>
  );
}

export default StatusBadge;