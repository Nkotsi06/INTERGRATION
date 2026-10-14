import { FiX, FiAlertCircle } from 'react-icons/fi';
import Button from '../common/Button';

const RULES = [
  { key: 'sunglasses', label: 'Remove sunglasses' },
  { key: 'hat',        label: 'Remove your hat or cap' },
  { key: 'still',      label: 'Face the camera and stand still' },
  { key: 'background', label: 'Use a plain, light background with good light' },
];

export default function FacialInstructions({ onStart, onCancel, disabled, error }) {
  return (
    <div className="facial-instructions">
      <h4 className="facial-label">Before we take your photo</h4>

      <ul className="facial-rules">
        {RULES.map((r) => (
          <li key={r.key} className="facial-rule">
            <span className="facial-rule-icon" aria-hidden="true">•</span>
            <span>{r.label}</span>
          </li>
        ))}
      </ul>

      <div className="facial-consent" role="note">
        <FiAlertCircle aria-hidden="true" />
        <p>
          Your face photo is a biometric record. It will be seen only by Home
          Affairs staff and you. Nothing is sent to the server until an officer
          saves the record.
        </p>
      </div>

      {error && (
        <div className="facial-error" role="alert">
          {error}
        </div>
      )}

      <div className="facial-actions">
        <Button variant="secondary" onClick={onCancel} disabled={disabled}>
          <FiX /> Cancel
        </Button>
        <Button variant="primary" onClick={onStart} disabled={disabled}>
          Start camera
        </Button>
      </div>
    </div>
  );
}