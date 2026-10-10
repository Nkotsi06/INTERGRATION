import { useState } from 'react';
import FingerprintCapture from './FingerprintCapture';
import Button from '../common/Button';

function BiometricVerification({ citizenId, onVerified, onFailed }) {
  const [captured, setCaptured] = useState(null);

  const handleCapture = (label, image) => setCaptured(image);

  const handleVerify = async () => {
    try {
      // In production, this would call the biometric API
      const isMatch = true; // placeholder
      if (isMatch) onVerified();
      else onFailed();
    } catch (err) {
      onFailed();
    }
  };

  return (
    <div className="biometric-verification">
      <h3>Verify Your Identity</h3>
      <p>Place your finger on the scanner to verify.</p>

      <FingerprintCapture
        fingerLabel="Fingerprint"
        onCapture={handleCapture}
        onComplete={handleCapture}
      />

      <Button variant="primary" onClick={handleVerify} disabled={!captured}>
        Verify Identity
      </Button>
    </div>
  );
}

export default BiometricVerification;