import { useState } from 'react';
import { FiAlertTriangle, FiCheckSquare } from 'react-icons/fi';
import Button from '../common/Button';
import Checkbox from '../common/Checkbox';
import Alert from '../common/Alert';

export default function FacialReview({ image, onAccept, onRetake, allowOverride = true }) {
  const [confirmed, setConfirmed] = useState({
    noSunglasses: false,
    noHat: false,
    plainBackground: false,
  });
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [error, setError] = useState(null);

  const allConfirmed =
    confirmed.noSunglasses && confirmed.noHat && confirmed.plainBackground;

  const handleAccept = () => {
    if (!allConfirmed && !(overrideOpen && overrideReason.trim())) {
      setError('Confirm all three checks, or provide an override reason.');
      return;
    }
    onAccept({
      confirmed,
      override: overrideOpen
        ? { enabled: true, reason: overrideReason.trim() }
        : { enabled: false },
    });
  };

  return (
    <div className="facial-review">
      <h4 className="facial-label">Confirm the photo</h4>

      <img src={image} alt="Captured face" className="facial-image facial-image-large" />

      {error && <Alert type="error" message={error} />}

      <div className="facial-review-checks">
        <Checkbox
          label="No sunglasses"
          checked={confirmed.noSunglasses}
          onChange={(e) => setConfirmed({ ...confirmed, noSunglasses: e.target.checked })}
        />
        <Checkbox
          label="No hat or head covering"
          checked={confirmed.noHat}
          onChange={(e) => setConfirmed({ ...confirmed, noHat: e.target.checked })}
        />
        <Checkbox
          label="Plain background and face clearly visible"
          checked={confirmed.plainBackground}
          onChange={(e) => setConfirmed({ ...confirmed, plainBackground: e.target.checked })}
        />
      </div>

      {allowOverride && (
        <div className="facial-override">
          <button
            type="button"
            className="btn-link"
            onClick={() => setOverrideOpen((v) => !v)}
          >
            <FiAlertTriangle /> Override for a valid reason
          </button>
          {overrideOpen && (
            <>
              <p className="text-muted">
                Use only for a medical, religious or disability-related reason.
                This will be written to the audit log.
              </p>
              <textarea
                className="form-input"
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="State the reason"
              />
            </>
          )}
        </div>
      )}

      <div className="facial-actions">
        <Button variant="secondary" onClick={onRetake}>Retake</Button>
        <Button
          variant="primary"
          onClick={handleAccept}
          disabled={!allConfirmed && !overrideOpen}
        >
          <FiCheckSquare /> Accept photo
        </Button>
      </div>
    </div>
  );
}