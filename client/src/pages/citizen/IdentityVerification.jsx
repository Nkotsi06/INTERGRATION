import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { confirmIdentity } from '../../api/verificationApi';
import PageWrapper from '../../components/layout/PageWrapper';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

function IdentityVerification() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { verifyIdentity } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const targetMinistry = location.state?.targetMinistry;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!password) {
      setError('Please enter your password to continue.');
      return;
    }

    setLoading(true);
    try {
      const result = await confirmIdentity(password);

      if (result.success) {
        verifyIdentity(result.citizenId);
        navigate('/citizen/verify/success', {
          state: { targetMinistry },
        });
        return;
      }

      if (result.reason === 'not_verified') {
        navigate('/citizen/verify/pending', {
          state: { targetMinistry },
        });
        return;
      }

      navigate('/citizen/verify/failure', {
        state: { reason: result.reason },
      });
    } catch (err) {
      const status = err?.status;
      if (status === 401) {
        navigate('/citizen/verify/failure', {
          state: { reason: 'wrong_password' },
        });
        return;
      }
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Confirm it's you"
      showBack
      backPath="/citizen/dashboard"
    >
      <div className="verification-page">
        <div className="verification-card">
          <h2>Confirm it&apos;s you</h2>
          <p className="verification-explanation">
            For your security, enter your password again to continue. We will
            check your Home Affairs record automatically.
          </p>

          {error && <Alert type="error" message={error} />}

          <form onSubmit={handleSubmit} noValidate>
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Checking…' : 'Continue'}
            </Button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}

export default IdentityVerification;