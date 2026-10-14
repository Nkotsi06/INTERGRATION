import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

function FacialPreview({ image, label = 'Facial Photo', meta = null }) {
  if (!image) {
    return (
      <div className="facial-preview-empty" role="status">
        No facial photo captured yet
      </div>
    );
  }

  const overridden = meta?.override?.enabled;
  const confirmed =
    meta?.confirmed?.noSunglasses &&
    meta?.confirmed?.noHat &&
    meta?.confirmed?.plainBackground;

  return (
    <div className="facial-preview-item">
      <img src={image} alt={label} className="facial-image" />

      <div className="facial-preview-status">
        {overridden ? (
          <>
            <FiAlertTriangle aria-hidden="true" />
            <span>Override: {meta.override.reason}</span>
          </>
        ) : confirmed ? (
          <>
            <FiCheckCircle aria-hidden="true" />
            <span>Officer confirmed all checks</span>
          </>
        ) : (
          <>
            <FiAlertTriangle aria-hidden="true" />
            <span>Awaiting officer confirmation</span>
          </>
        )}
      </div>

      <span className="facial-preview-label">{label}</span>
    </div>
  );
}

export default FacialPreview;