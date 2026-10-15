import { useNavigate, useLocation } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';

function VerificationSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const targetMinistry = location.state?.targetMinistry;

  const handleAccess = () => {
    if (targetMinistry) {
      const routePrefix = targetMinistry.toLowerCase().replace(/_/g, '-');
      navigate(`/${routePrefix}/dashboard`);
    } else {
      navigate('/citizen/dashboard');
    }
  };

  return (
    <PageWrapper title="Identity verified">
      <div className="verification-result-page">
        <div className="result-card">
          <div className="result-icon success">✓</div>
          <h2>Identity verified</h2>
          <p>
            Your Home Affairs record matched. You can now access the service
            you selected.
          </p>
          <div className="result-actions">
            <Button variant="primary" onClick={handleAccess}>
              Access service
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

export default VerificationSuccess;