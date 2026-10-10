import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import SignaturePad from '../../components/signature/SignaturePad';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { issuePassport } from '../../api/passportApi';
import { useNotification } from '../../context/NotificationContext';

function IssuePassport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [signature, setSignature] = useState(null);
  const [error, setError] = useState(null);
  const { success } = useNotification();

  const handleIssue = async () => {
    if (!signature) return setError('Signature required.');
    try {
      await issuePassport(id, { signature });
      success('Passport issued');
      navigate('/passport/staff');
    } catch (err) {
      setError('Failed to issue passport');
    }
  };

  return (
    <PageWrapper title="Issue Passport" showBack backPath="/passport/staff" accentColour="#17A2B8">
      <h2>Issue Passport</h2>
      {error && <Alert type="error" message={error} />}
      <p>Citizen must sign below to authorise issuance.</p>
      <SignaturePad onSave={setSignature} onClear={() => setSignature(null)} />
      <Button variant="primary" onClick={handleIssue} disabled={!signature} style={{ marginTop: '16px' }}>
        Issue Passport
      </Button>
    </PageWrapper>
  );
}

export default IssuePassport;