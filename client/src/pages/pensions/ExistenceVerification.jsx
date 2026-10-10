import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import { verifyExistence, checkDeathCertificate } from '../../api/pensionsApi';
import { useNotification } from '../../context/NotificationContext';

const SECURITY_QUESTION = 'What is your town of birth?';

function ExistenceVerification() {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const handleVerify = async () => {
    setError(null);
    if (!answer.trim()) {
      setError('Please answer the security question.');
      return;
    }

    setLoading(true);
    try {
      const death = await checkDeathCertificate();
      if (death?.found) {
        setError(
          'Our records show a death certificate has been registered. Please visit a pension office.'
        );
        return;
      }

      await verifyExistence({ answer });
      success('Existence verified');
      navigate('/pensions/verify/success');
    } catch (err) {
      setError(
        err.message || 'We could not verify you right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Existence Verification"
      showBack
      backPath="/pensions/dashboard"
      accentColour="#7D3C98"
    >
      <h1 style={{ fontSize: '24pt' }}>Existence verification</h1>
      <p style={{ fontSize: '14pt' }} className="text-muted">
        This confirms you are alive and eligible to receive your pension.
      </p>

      {error && <Alert type="error" message={error} />}

      <div className="form-field" style={{ marginTop: 16 }}>
        <label className="form-label" style={{ fontSize: '14pt' }}>
          Security question
        </label>
        <div className="form-input form-input-readonly" style={{ fontSize: '14pt' }}>
          {SECURITY_QUESTION}
        </div>
      </div>

      <Input
        label="Your answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
      />

      <FormActions
        primaryLabel="Verify now"
        primaryLoading={loading}
        onPrimary={handleVerify}
        onSecondary={() => navigate('/pensions/dashboard')}
      />
    </PageWrapper>
  );
}

export default ExistenceVerification;