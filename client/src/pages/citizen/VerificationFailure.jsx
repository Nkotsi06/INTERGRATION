import { useNavigate, useLocation } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';

function VerificationFailure() {
  const navigate = useNavigate();
  const location = useLocation();
  const reason = location.state?.reason;

  const isWrongPassword = reason === 'wrong_password';

  const title = isWrongPassword
    ? 'Password not recognised'
    : 'Verification failed';

  const message = isWrongPassword
    ? 'The password you entered does not match your account. Try again.'
    : 'We could not complete the check. Please try again in a moment.';

  return (
    <PageWrapper title={title}>
      <div className="verification-result-page">
        <div className="result-card">
          <div className="result-icon error">
            <FiXCircle />
          </div>
          <h2>{title}</h2>
          <p>{message}</p>
          <div className="result-actions">
            <Button
              variant="primary"
              onClick={() => navigate('/citizen/verify')}
            >
              Try again
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/citizen/dashboard')}
            >
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default VerificationFailure;