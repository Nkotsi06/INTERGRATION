const STATUS_CONFIG = {
  VERIFIED: { symbol: '✓', label: 'Verified', variant: 'success' },
  PENDING: { symbol: '…', label: 'Pending', variant: 'warning' },
  REJECTED: { symbol: '✕', label: 'Rejected', variant: 'error' },
};

function DocumentStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`badge badge-${config.variant}`}>
      <span aria-hidden="true">{config.symbol}</span>
      <span>{config.label}</span>
    </span>
  );
}

export default DocumentStatusBadge;