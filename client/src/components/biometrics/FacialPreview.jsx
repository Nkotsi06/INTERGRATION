function FacialPreview({ image, label = 'Facial Photo' }) {
  if (!image) return <div className="facial-preview-empty">No photo captured</div>;

  return (
    <div className="facial-preview-item">
      <img src={image} alt={label} />
      <span>{label}</span>
    </div>
  );
}

export default FacialPreview;