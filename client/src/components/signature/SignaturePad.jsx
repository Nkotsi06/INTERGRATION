import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FiTrash2 } from 'react-icons/fi';

function SignaturePad({ onSave, onClear }) {
  const sigPadRef = useRef(null);

  const clear = () => {
    sigPadRef.current.clear();
    if (onClear) onClear();
  };

  const save = () => {
    if (sigPadRef.current.isEmpty()) return;
    const dataUrl = sigPadRef.current.getCanvas().toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="signature-pad">
      <div className="signature-canvas-wrapper">
        <SignatureCanvas
          ref={sigPadRef}
          penColor="#2C3E50"
          canvasProps={{
            className: 'signature-canvas',
            width: 600,
            height: 200,
          }}
        />
      </div>
      <div className="signature-actions">
        <button className="btn btn-secondary" onClick={clear}>
          <FiTrash2 /> Clear
        </button>
        <button className="btn btn-primary" onClick={save}>
          Save Signature
        </button>
      </div>
    </div>
  );
}

export default SignaturePad;