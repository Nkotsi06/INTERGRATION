const VARIANTS = {
  awaiting: { label: 'Awaiting Home Affairs', className: 'status-badge-awaiting' },
  captured: { label: 'Details captured', className: 'status-badge-captured' },
  verified: { label: 'Verified', className: 'status-badge-verified' },
  pending: { label: 'Pending', className: 'status-badge-captured' },
  approved: { label: 'Approved', className: 'status-badge-verified' },
  rejected: { label: 'Rejected', className: 'status-badge-awaiting' },
  inReview: { label: 'Under review', className: 'status-badge-captured' },
  draft: { label: 'Draft', className: 'status-badge-awaiting' },
  completed: { label: 'Completed', className: 'status-badge-verified' },
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
      {label || config.label}
    </span>
  );
}

export default StatusBadge;