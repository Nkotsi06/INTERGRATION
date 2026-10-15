function VerifiedBadge({ label = 'Verified by Home Affairs' }) {
  return (
    <span className="verified-badge">
      <span aria-hidden="true">✓</span>
      <span>{label}</span>
    </span>
  );
}

export default VerifiedBadge;