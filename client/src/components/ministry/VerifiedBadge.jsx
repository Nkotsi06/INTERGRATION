import { FiCheckCircle } from 'react-icons/fi';

function VerifiedBadge({ label = 'Verified by Home Affairs' }) {
  return (
    <span className="verified-badge">
      <FiCheckCircle />
      <span>{label}</span>
    </span>
  );
}

export default VerifiedBadge;