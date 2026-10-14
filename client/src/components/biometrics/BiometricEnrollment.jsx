import { useState } from 'react';
import FingerprintCapture from './FingerprintCapture';
import FacialInstructions from './FacialInstructions';
import FacialCamera from './FacialCamera';
import FacialReview from './FacialReview';
import Button from '../common/Button';

const FINGERPRINTS = [
  { key: 'left_thumb',  label: 'Left Thumb' },
  { key: 'left_index',  label: 'Left Index' },
  { key: 'right_thumb', label: 'Right Thumb' },
  { key: 'right_index', label: 'Right Index' },
];

function BiometricEnrollment({ onComplete, settings, requireFingerprints = true }) {
  const [fingerprints, setFingerprints] = useState({});
  const [facialImage, setFacialImage] = useState(null);
  const [facialStage, setFacialStage] = useState('instructions'); // instructions | camera | review
  const [facialMeta, setFacialMeta] = useState(null);

  const handleFingerprint = (label, image) => {
    setFingerprints((prev) => ({ ...prev, [label]: image }));
  };

  const handleCameraCapture = (image) => {
    setFacialImage(image);
    setFacialStage('review');
  };

  const handleReviewAccept = (meta) => {
    setFacialMeta(meta);
    setFacialStage('instructions'); // hide camera, keep image
    emitComplete(facialImage, meta);
  };

  const handleReviewRetake = () => {
    setFacialImage(null);
    setFacialMeta(null);
    setFacialStage('camera');
  };

  const emitComplete = (image, meta) => {
    onComplete({
      fingerprints,
      facialImage: image,
      facialMeta: meta || null,
    });
  };

  const allFingerprints = Object.keys(fingerprints).length === FINGERPRINTS.length;
  const facialReady = !!facialImage && !!facialMeta;

  return (
    <div className="biometric-enrollment">
      {requireFingerprints && (
        <div className="fingerprint-grid">
          {FINGERPRINTS.map((fp) => (
            <FingerprintCapture
              key={fp.key}
              fingerLabel={fp.label}
              onCapture={handleFingerprint}
              onComplete={handleFingerprint}
            />
          ))}
        </div>
      )}

      <div className="facial-section">
        {facialStage === 'instructions' && !facialReady && (
          <FacialInstructions
            onStart={() => setFacialStage('camera')}
            onCancel={() => setFacialStage('instructions')}
          />
        )}

        {facialStage === 'camera' && !facialImage && (
          <FacialCamera
            settings={settings}
            onCapture={handleCameraCapture}
            onCancel={() => setFacialStage('instructions')}
          />
        )}

        {facialImage && !facialMeta && (
          <FacialReview
            image={facialImage}
            onAccept={handleReviewAccept}
            onRetake={handleReviewRetake}
            allowOverride={settings?.allowOverride !== false}
          />
        )}

        {facialReady && (
          <div className="facial-captured-summary">
            <img src={facialImage} alt="Captured face" className="facial-image" />
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                setFacialImage(null);
                setFacialMeta(null);
                setFacialStage('camera');
              }}
            >
              Retake photo
            </button>
          </div>
        )}
      </div>

      {requireFingerprints && !allFingerprints && (
        <p className="text-muted">Capture all four fingerprints to continue.</p>
      )}
      {!facialReady && (
        <p className="text-muted">A facial photo is required to save the record.</p>
      )}

      <div className="enrollment-actions">
        <Button
          variant="primary"
          onClick={() => emitComplete(facialImage, facialMeta)}
          disabled={!facialReady || (requireFingerprints && !allFingerprints)}
        >
          Complete enrollment
        </Button>
      </div>
    </div>
  );
}

export default BiometricEnrollment;