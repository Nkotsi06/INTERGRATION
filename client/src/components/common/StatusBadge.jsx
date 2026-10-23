import { getStatusIcon } from '../../utils/actionIcons';

const VARIANTS = {
  // Existing
  awaiting:       { label: 'Awaiting Home Affairs', className: 'status-badge-awaiting' },
  captured:       { label: 'Details captured',      className: 'status-badge-captured' },
  verified:       { label: 'Verified',              className: 'status-badge-verified' },
  pending:        { label: 'Pending',               className: 'status-badge-captured' },
  approved:       { label: 'Approved',              className: 'status-badge-verified' },
  rejected:       { label: 'Rejected',              className: 'status-badge-awaiting' },
  inReview:       { label: 'Under review',          className: 'status-badge-captured' },
  draft:          { label: 'Draft',                 className: 'status-badge-awaiting' },
  completed:      { label: 'Completed',             className: 'status-badge-verified' },

  // NEW — used by Home Affairs application queue and detail pages
  submitted:            { label: 'Submitted',            className: 'status-badge-captured' },
  under_review:         { label: 'Under review',         className: 'status-badge-captured' },
  in_production:        { label: 'In production',        className: 'status-badge-captured' },
  ready_for_collection: { label: 'Ready for collection', className: 'status-badge-captured' },
  collected:            { label: 'Collected',            className: 'status-badge-verified' },
  issued:               { label: 'Issued',               className: 'status-badge-verified' },

  // NEW — used by audit findings severity / status
  open:         { label: 'Open',         className: 'status-badge-captured' },
  in_progress:  { label: 'In progress',  className: 'status-badge-captured' },
  resolved:     { label: 'Resolved',     className: 'status-badge-verified' },
  error:        { label: 'Critical',     className: 'status-badge-awaiting' },
  warning:      { label: 'Warning',      className: 'status-badge-captured' },
  default:      { label: '—',            className: 'status-badge-awaiting' },
};

function StatusBadge({ variant, label }) {
  const config = VARIANTS[variant];
  if (!config) return null;
  const Icon = getStatusIcon(variant);

  return (
    <span
      className={`status-badge ${config.className}`}
      role="status"
      aria-label={label || config.label}
    >
      <Icon className="ui-icon" aria-hidden="true" focusable="false" />
      {label || config.label}
    </span>
  );
}

export default StatusBadge;