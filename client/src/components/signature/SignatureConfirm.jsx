import SignaturePreview from './SignaturePreview';
import Button from '../common/Button';

function SignatureConfirm({ signatureData, onConfirm, onRetry }) {
  return (
    <div className="signature-confirm">
      <h3>Confirm Your Signature</h3>
      <p>Please review your signature before confirming.</p>
      <SignaturePreview signatureData={signatureData} />
      <div className="signature-confirm-actions">
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm Signature
        </Button>
      </div>
    </div>
  );
}

export default SignatureConfirm;