function FingerprintPreview({ fingerprints }) {
  if (!fingerprints || Object.keys(fingerprints).length === 0) {
    return <div className="fingerprint-preview-empty">No fingerprints captured</div>;
  }

  return (
    <div className="fingerprint-preview-grid">
      {Object.entries(fingerprints).map(([label, image]) => (
        <div key={label} className="fingerprint-preview-item">
          <img src={image} alt={label} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default FingerprintPreview;