import { FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const ICONS = {
  success: <FiCheckCircle />,
  pending: <FiClock />,
  error: <FiXCircle />,
  warning: <FiAlertCircle />,
};

function Badge({ variant = 'default', icon, children }) {
  return (
    <span className={`badge badge-${variant}`}>
      {icon && <span className="badge-icon">{ICONS[icon] || icon}</span>}
      {children}
    </span>
  );
}

export default Badge;