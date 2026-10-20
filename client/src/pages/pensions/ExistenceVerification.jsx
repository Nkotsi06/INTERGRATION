import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getEligibility, verifyExistence } from '../../api/pensionsApi';
import { getProfile } from '../../api/citizenApi';
import { useNotification } from '../../context/NotificationContext';

const SECURITY_QUESTION = 'What is your town of birth?';

function ExistenceVerification() {
  const { data: eligibility, loading, error } = useFetch(getEligibility, []);
  const { data: profile, loading: profileLoading, error: profileError } =
    useFetch(getProfile, []);
  const [answer, setAnswer] = useState('');
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const canProceed = !loading && !error && eligibility?.eligible === true;

  const handleVerify = async () => {
    setFormError(null);
    if (!answer.trim()) {
      setFormError('Please answer the security question.');
      return;
    }
    setSubmitting(true);
    try {
      await verifyExistence({ answer });
      success('Existence verified');
      navigate('/pensions/verify/success');
    } catch (err) {
      setFormError(err.message || 'We could not verify you right now. Please try again.');
    } finally {
      setSubmitting(false);
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

      {loading && <StatsSkeleton count={1} />}

      {error && <Alert type="error" message={error} />}

      {!loading && !error && eligibility && !eligibility.eligible && (
        <Alert
          type="warning"
          title="Verification unavailable"
          message={eligibility.message}
        />
      )}

      {formError && <Alert type="error" message={formError} />}

      {canProceed && (
        <>
          <div className="card card-flat">
            <h3>Your citizen details</h3>
            {profileLoading ? (
              <p className="text-muted">Loading your details…</p>
            ) : profileError ? (
              <Alert type="error" message={profileError} />
            ) : (
              <div className="form-grid">
                <ReadOnly label="Full name" value={profile?.fullName} />
                <ReadOnly label="National ID" value={profile?.nationalId} />
                <ReadOnly
                  label="Date of birth"
                  value={profile?.dateOfBirth
                    ? String(profile.dateOfBirth).slice(0, 10)
                    : null}
                />
              </div>
            )}
          </div>
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
            primaryLoading={submitting}
            onPrimary={handleVerify}
            onSecondary={() => navigate('/pensions/dashboard')}
          />
        </>
      )}

      {!canProceed && !loading && !error && (
        <FormActions
          primaryLabel="Back to dashboard"
          onPrimary={() => navigate('/pensions/dashboard')}
        />
      )}
    </PageWrapper>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div className="form-input form-input-readonly">{value || '—'}</div>
    </div>
  );
}

export default ExistenceVerification;