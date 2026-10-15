function BiometricStatusBadge({ enrolled }) {
  return enrolled ? (
    <span className="badge badge-success">
      <span aria-hidden="true">✓</span> Biometrics Enrolled
    </span>
  ) : (
    <span className="badge badge-warning">
      <span aria-hidden="true">✕</span> Biometrics Not Enrolled
    </span>
  );
}

export default BiometricStatusBadge;