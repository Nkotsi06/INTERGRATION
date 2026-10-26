import { useState } from 'react';
import Button from '../common/Button';
import Checkbox from '../common/Checkbox';
import Alert from '../common/Alert';

export default function FacialReview({ image, onAccept, onRetake, allowOverride = false }) {
  const [confirmed, setConfirmed] = useState({
    noSunglasses: false,
    noGlasses: false,
    noHat: false,
    plainBackground: false,
    sharpAndClear: false,
  });
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [error, setError] = useState(null);

  const allConfirmed =
    confirmed.noSunglasses && confirmed.noGlasses && confirmed.noHat &&
    confirmed.plainBackground && confirmed.sharpAndClear;

  const handleAccept = () => {
    if (!allConfirmed && !(overrideOpen && overrideReason.trim())) {
      setError('Confirm every photo quality check, or provide an override reason.');
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
      <p className="text-muted">
        Inspect the photo directly. Automatic checks cannot reliably identify hats or glasses.
      </p>

      {error && <Alert type="error" message={error} />}

      <div className="facial-review-checks">
        <Checkbox
          label="No sunglasses"
          checked={confirmed.noSunglasses}
          onChange={(e) => setConfirmed({ ...confirmed, noSunglasses: e.target.checked })}
        />
        <Checkbox
          label="No glasses obscuring the eyes"
          checked={confirmed.noGlasses}
          onChange={(e) => setConfirmed({ ...confirmed, noGlasses: e.target.checked })}
        />
        <Checkbox
          label="No hat or head covering"
          checked={confirmed.noHat}
          onChange={(e) => setConfirmed({ ...confirmed, noHat: e.target.checked })}
        />
        <Checkbox
          label="Plain background"
          checked={confirmed.plainBackground}
          onChange={(e) => setConfirmed({ ...confirmed, plainBackground: e.target.checked })}
        />
        <Checkbox
          label="Face is sharp, clear, and fully visible"
          checked={confirmed.sharpAndClear}
          onChange={(e) => setConfirmed({ ...confirmed, sharpAndClear: e.target.checked })}
        />
      </div>

      {allowOverride && (
        <div className="facial-override">
          <button
            type="button"
            className="btn-link"
            onClick={() => setOverrideOpen((v) => !v)}
          >
            <span aria-hidden="true">!</span> Override for a valid reason
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
          Accept photo
        </Button>
      </div>
    </div>
  );
}