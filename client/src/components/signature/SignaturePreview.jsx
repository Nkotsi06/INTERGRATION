function SignaturePreview({ signatureData, label = 'Signature' }) {
  if (!signatureData) {
    return <div className="signature-preview-empty">No signature captured</div>;
  }

  return (
    <div className="signature-preview">
      <span className="signature-label">{label}</span>
      <img src={signatureData} alt="Signature" className="signature-image" />
    </div>
  );
}

export default SignaturePreview;