import { useLocation, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ReferenceNumber from '../../components/ministry/ReferenceNumber';

function ApplicationConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result || {};

  return (
    <PageWrapper title="Application Submitted" accentColour="#17A2B8">
      <div className="result-card">
        <StatusBadge variant="verified" />
        <h2>Application submitted</h2>
        <p>Your application has been received by the Passport Office.</p>

        <ReferenceNumber
          value={result.referenceNumber}
          label="Application reference"
        />

        <div className="form-grid" style={{ width: '100%', marginTop: 16 }}>
          <ReadOnly label="Applicant" value={result.applicantName} />
          <ReadOnly label="Date submitted" value={result.dateSubmitted} />
          <ReadOnly label="Passport type" value={result.passportType} />
          <ReadOnly label="Collection office" value={result.collectionOffice} />
        </div>

        <p className="text-muted">
          Keep your reference number safe. Use it to track your application.
        </p>

        <div className="result-actions">
          <Button variant="secondary" onClick={() => window.print()}>
            Download receipt
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/passport/status')}
          >
            Track application
          </Button>
        </div>
      </div>
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

export default ApplicationConfirmation;