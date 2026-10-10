import { useNavigate, useLocation, useParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';

function RecordSaved() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const citizen = location.state?.citizen || {};

  const nationalId = citizen.nationalId || '—';
  const fullName = citizen.fullName || '—';
  const citizenId = citizen.citizenId || citizen.id || id;

  return (
    <PageWrapper title="Record Saved" accentColour="#1A5276">
      <div className="verification-result-page">
        <div className="result-card">
          <h1>Record saved</h1>
          <p>National ID generated. The citizen can now be verified.</p>

          <div className="id-block">
            <span className="id-block-label">National ID</span>
            <span className="id-block-value">{nationalId}</span>
            <span className="id-block-name">{fullName}</span>
          </div>

          <div className="result-actions">
            <Button
              variant="secondary"
              onClick={() => window.print()}
            >
              Print ID slip
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                navigate(`/home-affairs/verify/${citizenId}`)
              }
            >
              Continue to verification
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/home-affairs/registrations')}
            >
              Back to registrations
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default RecordSaved;