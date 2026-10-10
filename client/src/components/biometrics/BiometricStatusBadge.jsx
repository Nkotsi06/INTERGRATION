import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

function BiometricStatusBadge({ enrolled }) {
  return enrolled ? (
    <span className="badge badge-success">
      <FiCheckCircle /> Biometrics Enrolled
    </span>
  ) : (
    <span className="badge badge-warning">
      <FiXCircle /> Biometrics Not Enrolled
    </span>
  );
}

export default BiometricStatusBadge;