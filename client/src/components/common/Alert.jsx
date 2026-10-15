function Alert({ type = 'info', title, message, onClose }) {
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
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
          Close
        </button>
      )}
    </div>
  );
}

export default Alert;