import { useState } from 'react';

function FingerprintCapture({ fingerLabel, onCapture, onComplete }) {
  const [capturing, setCapturing] = useState(false);
  const [captured, setCaptured] = useState(null);

  const handleCapture = async () => {
    setCapturing(true);
    try {
      // In production, this integrates with a fingerprint scanner SDK.
      // For prototype, we simulate the capture.
      const mockImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
      setCaptured(mockImage);
      onCapture(fingerLabel, mockImage);
    } finally {
      setCapturing(false);
    }
  };

  const handleRetake = () => {
    setCaptured(null);
  };

  const handleConfirm = () => {
    onComplete(fingerLabel, captured);
  };

  return (
    <div className="fingerprint-capture">
      <h4 className="fingerprint-label">{fingerLabel}</h4>

      {!captured ? (
        <div className="fingerprint-scanner">
          <div className="fingerprint-scanner-placeholder">
            <span>Place finger on scanner</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCapture}
            disabled={capturing}
          >
            {capturing ? 'Capturing...' : 'Capture Fingerprint'}
          </button>
        </div>
      ) : (
        <div className="fingerprint-preview">
          <img src={captured} alt={fingerLabel} className="fingerprint-image" />
          <div className="fingerprint-actions">
            <button className="btn btn-secondary" onClick={handleRetake}>
              Retake
            </button>
            <button className="btn btn-primary" onClick={handleConfirm}>
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FingerprintCapture;