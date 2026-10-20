import { useState, useRef } from 'react';

function FingerprintCapture({ fingerLabel, onCapture, onComplete }) {
  const [captured, setCaptured] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setCaptured(base64String);
      onCapture(fingerLabel, base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCaptured(null);
    onCapture(fingerLabel, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fingerprint-capture">
      <h4 className="fingerprint-label">{fingerLabel}</h4>

      {!captured ? (
        <div className="fingerprint-scanner">
          <div className="fingerprint-scanner-placeholder">
            <span>Scan via iFING App & Save</span>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current.click()}
          >
            Upload Fingerprint Image
          </button>
        </div>
      ) : (
        <div className="fingerprint-preview">
          <img src={captured} alt={fingerLabel} className="fingerprint-image" />
          <div className="fingerprint-actions">
            <button className="btn btn-secondary" onClick={handleRetake}>
              Retake
            </button>
            <button className="btn btn-primary" onClick={() => onComplete(fingerLabel, captured)}>
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FingerprintCapture;