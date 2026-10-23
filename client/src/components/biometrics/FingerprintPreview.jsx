function FingerprintPreview({ fingerprints }) {
  const capturedFingerprints = Object.entries(fingerprints || {}).filter(
    ([, image]) => Boolean(image)
  );

  if (capturedFingerprints.length === 0) {
    return <div className="fingerprint-preview-empty">No fingerprints captured</div>;
  }

  return (
    <div className="fingerprint-preview-grid">
      {capturedFingerprints.map(([label, image]) => (
        <div key={label} className="fingerprint-preview-item">
          <img src={image} alt={label} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default FingerprintPreview;