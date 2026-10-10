import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo } from 'react-icons/fi';

const ICONS = {
  success: <FiCheckCircle />,
  warning: <FiAlertTriangle />,
  error: <FiXCircle />,
  info: <FiInfo />,
};

function Alert({ type = 'info', title, message, onClose }) {
  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-icon">{ICONS[type]}</div>
      <div className="alert-content">
        {title && <strong className="alert-title">{title}</strong>}
        {message && <p className="alert-message">{message}</p>}
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close alert">
          <FiXCircle />
        </button>
      )}
    </div>
  );
}

export default Alert;