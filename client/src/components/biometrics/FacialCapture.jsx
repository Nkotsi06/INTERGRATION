import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

function FacialCapture({ onCapture, onComplete }) {
  const webcamRef = useRef(null);
  const [captured, setCaptured] = useState(null);

  const handleCapture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCaptured(imageSrc);
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const handleRetake = () => setCaptured(null);

  const handleConfirm = () => onComplete(captured);

  return (
    <div className="facial-capture">
      <h4 className="facial-label">Facial Capture</h4>

      {!captured ? (
        <div className="facial-webcam">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="webcam-view"
          />
          <button className="btn btn-primary" onClick={handleCapture}>
            Capture Photo
          </button>
        </div>
      ) : (
        <div className="facial-preview">
          <img src={captured} alt="Captured face" className="facial-image" />
          <div className="facial-actions">
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

export default FacialCapture;