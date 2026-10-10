import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';

function PensionVerificationSuccess() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-GB');
  const next = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB');

  return (
    <PageWrapper title="Verification Successful" accentColour="#7D3C98">
      <div className="verification-result-page">
        <div className="result-card" style={{ fontSize: '14pt' }}>
          <StatusBadge variant="verified" />
          <h2>Existence verified</h2>
          <p>Your pension eligibility is confirmed.</p>

          <div className="form-grid" style={{ width: '100%' }}>
            <ReadOnly label="Verification date" value={today} />
            <ReadOnly label="Next due date" value={next} />
          </div>

          <div className="result-actions">
            <Button
              variant="primary"
              onClick={() => navigate('/pensions/history')}
            >
              View verification history
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/pensions/dashboard')}
            >
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div className="form-input form-input-readonly">{value}</div>
    </div>
  );
}

export default PensionVerificationSuccess;