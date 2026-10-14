export default function FacialPreview({ image }) {
  if (!image) {
    return <div className="facial-preview-empty">No facial photo captured</div>;
  }
  return (
    <div className="facial-preview">
      <img src={image} alt="Captured face" className="facial-image" />
      <span className="facial-preview-label">Facial photo on record</span>
    </div>
  );
}