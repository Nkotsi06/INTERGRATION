import { useState } from 'react';
import FingerprintCapture from './FingerprintCapture';
import FacialCapture from './FacialCapture';
import Button from '../common/Button';

const FINGERPRINTS = [
  { key: 'left_thumb', label: 'Left Thumb' },
  { key: 'left_index', label: 'Left Index' },
  { key: 'right_thumb', label: 'Right Thumb' },
  { key: 'right_index', label: 'Right Index' },
];

function BiometricEnrollment({ onComplete }) {
  const [fingerprints, setFingerprints] = useState({});
  const [facialImage, setFacialImage] = useState(null);

  const handleCapture = (label, image) => {
    setFingerprints((prev) => ({ ...prev, [label]: image }));
  };

  const handleFaceCapture = (image) => setFacialImage(image);

  const handleComplete = () => {
    onComplete({ fingerprints, facialImage });
  };

  const allCaptured =
    Object.keys(fingerprints).length === FINGERPRINTS.length && facialImage;

  return (
    <div className="biometric-enrollment">
      <div className="fingerprint-grid">
        {FINGERPRINTS.map((fp) => (
          <FingerprintCapture
            key={fp.key}
            fingerLabel={fp.label}
            onCapture={handleCapture}
            onComplete={handleCapture}
          />
        ))}
      </div>

      <div className="facial-section">
        <FacialCapture
          onCapture={handleFaceCapture}
          onComplete={handleFaceCapture}
        />
      </div>

      <div className="enrollment-actions">
        <Button
          variant="primary"
          onClick={handleComplete}
          disabled={!allCaptured}
        >
          Complete enrollment
        </Button>
      </div>
    </div>
  );
}

export default BiometricEnrollment;