function LoadingSpinner({ size = 'medium', message }) {
  return (
    <div className={`loading-spinner-container spinner-${size}`}>
      <div className="loading-spinner" />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;