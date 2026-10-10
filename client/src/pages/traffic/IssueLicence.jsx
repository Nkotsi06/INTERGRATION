import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import SignaturePad from '../../components/signature/SignaturePad';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { issueLicence } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';

function IssueLicence() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [signature, setSignature] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const { success } = useNotification();

  const handleIssue = async () => {
    setError(null);
    if (!signature) {
      setError('Signature is required before issuing the licence.');
      return;
    }
    setSaving(true);
    try {
      await issueLicence(id, { signature });
      success('Licence issued');
      navigate('/traffic/staff');
    } catch (err) {
      setError('Could not issue the licence. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper
      title="Issue Licence"
      showBack
      backPath="/traffic/staff"
      accentColour="#B9770E"
    >
      <h1>Issue licence</h1>
      <p className="text-muted">Ask the citizen to sign below.</p>

      {error && <Alert type="error" message={error} />}

      <SignaturePad onSave={setSignature} onClear={() => setSignature(null)} />

      <div className="form-actions">
        <div className="form-actions-primary-group">
          <Button variant="secondary" onClick={() => navigate('/traffic/staff')}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleIssue}
            disabled={!signature || saving}
          >
            {saving ? 'Issuing…' : 'Issue licence'}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}

export default IssueLicence;