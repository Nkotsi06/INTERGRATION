import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';

function VerificationPending() {
  const navigate = useNavigate();

  return (
    <PageWrapper title="Still awaiting verification">
      <div className="verification-result-page">
        <div className="result-card">
          <div className="result-icon warning">…</div>
          <h2>Home Affairs has not verified you yet</h2>
          <p>
            Your details are still being captured. You will be able to use this
            service once Home Affairs verifies you.
          </p>
          <div className="result-actions">
            <Button
              variant="primary"
              onClick={() => navigate('/citizen/dashboard')}
            >
              Back to dashboard
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/help/offices')}
            >
              Where is my nearest office
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default VerificationPending;