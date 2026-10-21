import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getLicence } from '../../api/trafficApi';
import { useNavigate } from 'react-router-dom';
import { getPhotoBlob } from '../../api/citizenApi';
import useBlobUrl from '../../hooks/useBlobUrl';
import DrivingLicenceView from '../../components/documents/DrivingLicenceView';

function ViewLicence() {
  const { data: licence, loading } = useFetch(getLicence, []);
  const photoUrl = useBlobUrl(licence ? getPhotoBlob : null, [Boolean(licence)]);
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
          <DrivingLicenceView data={licence} photoUrl={photoUrl} />

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

export default ViewLicence;