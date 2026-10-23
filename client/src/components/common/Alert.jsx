import { getAlertIcon, FiX } from '../../utils/actionIcons';

function Alert({ type = 'info', title, message, onClose }) {
  const Icon = getAlertIcon(type);

  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon className="alert-icon" aria-hidden="true" focusable="false" />
      <div className="alert-content">
        {title && <strong className="alert-title">{title}</strong>}
        {message && <p className="alert-message">{message}</p>}
      </div>
      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          <FiX aria-hidden="true" focusable="false" />
          <span className="sr-only">Close alert</span>
        </button>
      )}
    </div>
  );
}

export default Alert;