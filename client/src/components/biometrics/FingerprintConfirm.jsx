import FingerprintPreview from './FingerprintPreview';
import Button from '../common/Button';

function FingerprintConfirm({ fingerprints, onConfirm, onRetry }) {
  return (
    <div className="fingerprint-confirm">
      <h3>Confirm Fingerprints</h3>
      <p>Review the captured fingerprints before confirming.</p>
      <FingerprintPreview fingerprints={fingerprints} />
      <div className="fingerprint-confirm-actions">
        <Button variant="secondary" onClick={onRetry}>
          Retake All
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm Fingerprints
        </Button>
      </div>
    </div>
  );
}

export default FingerprintConfirm;