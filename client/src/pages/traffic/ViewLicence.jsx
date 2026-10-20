import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getLicence } from '../../api/trafficApi';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';

function ViewLicence() {
  const { data: licence, loading } = useFetch(getLicence, []);
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="My Driving Licence"
      showBack
      backPath="/traffic/dashboard"
      accentColour="#B9770E"
    >
      <h1>View driving licence</h1>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : !licence ? (
        <p className="text-muted">No licence on record.</p>
      ) : (
        <>
          <StatusBadge
            variant={licence.isValid ? 'verified' : 'rejected'}
            label={licence.isValid ? 'Valid' : 'Expired'}
          />

          <div className="card card-flat" style={{ marginTop: 16 }}>
            <div className="form-grid">
              <ReadOnly label="Licence number" value={licence.licenceNumber} />
              <ReadOnly label="Full name" value={licence.fullName} />
              <ReadOnly label="Licence type" value={licence.licenceType} />
              <ReadOnly label="Issue date" value={formatDate(licence.issueDate)} />
              <ReadOnly label="Expiry date" value={formatDate(licence.expiryDate)} />
            </div>
            {licence.signature_data && (
              <div style={{ marginTop: 16 }}>
                <img
                  src={licence.signature_data}
                  alt="Licence holder signature"
                  style={{ width: 180, height: 60, objectFit: 'contain' }}
                />
                <div>Signature of holder</div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <div className="form-actions-primary-group">
              <Button
                variant="secondary"
                onClick={() => navigate('/traffic/dashboard')}
              >
                Back to dashboard
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/traffic/renew')}
              >
                Renew driving licence
              </Button>
            </div>
          </div>
        </>
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

export default ViewLicence;