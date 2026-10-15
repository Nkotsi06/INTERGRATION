import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import SignaturePreview from './SignaturePreview';

function SignaturePad({ onSave, onClear }) {
  const sigPadRef = useRef(null);
  const [saved, setSaved] = useState(null);

  const clear = () => {
    if (sigPadRef.current) sigPadRef.current.clear();
    setSaved(null);
    if (onClear) onClear();
  };

  const save = () => {
    if (!sigPadRef.current || sigPadRef.current.isEmpty()) return;
    const dataUrl = sigPadRef.current.getCanvas().toDataURL('image/png');
    setSaved(dataUrl);
    onSave(dataUrl);
  };

  if (saved) {
    return (
      <div className="signature-pad">
        <SignaturePreview signatureData={saved} />
        <div className="signature-actions">
          <button type="button" className="btn btn-secondary" onClick={clear}>
            Clear
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signature-pad">
      <div className="signature-canvas-wrapper">
        <SignatureCanvas
          ref={sigPadRef}
          penColor="#2C3E50"
          canvasProps={{ className: 'signature-canvas', width: 600, height: 200 }}
        />
      </div>
      <div className="signature-actions">
        <button type="button" className="btn btn-secondary" onClick={clear}>
          Clear
        </button>
        <button type="button" className="btn btn-primary" onClick={save}>
          Save Signature
        </button>
      </div>
    </div>
  );
}

export default SignaturePad;