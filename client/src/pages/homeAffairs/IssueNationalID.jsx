import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import SignaturePad from '../../components/signature/SignaturePad';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { issueNationalId } from '../../api/homeAffairsApi';
import { useNotification } from '../../context/NotificationContext';

function HAIssueNationalID() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [signature, setSignature] = useState(null);
  const [error, setError] = useState(null);
  const { success } = useNotification();

  const handleIssue = async () => {
    if (!signature) return setError('Signature required before issuing.');
    try {
      await issueNationalId(id, { signature });
      success('National ID issued successfully');
      navigate(`/home-affairs/citizen/${id}`);
    } catch (err) {
      setError('Failed to issue ID');
    }
  };

  return (
    <PageWrapper title="Issue National ID" showBack backPath={`/home-affairs/citizen/${id}`}>
      <h2>Issue National ID</h2>
      {error && <Alert type="error" message={error} />}
      <p>Ask the citizen to sign below to authorise issuance.</p>
      <SignaturePad onSave={setSignature} onClear={() => setSignature(null)} />
      <Button variant="primary" onClick={handleIssue} disabled={!signature} style={{ marginTop: '16px' }}>
        Issue National ID
      </Button>
    </PageWrapper>
  );
}

export default HAIssueNationalID;