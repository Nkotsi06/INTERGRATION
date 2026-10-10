import { useParams, useNavigate } from 'react-router-dom';
import {
  FiEdit,
  FiPrinter,
  FiCheckCircle,
  FiFileText,
} from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getCitizenById } from '../../api/homeAffairsApi';
import { formatDate } from '../../utils/formatters';

function HACitizenProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: citizen, loading } = useFetch(
    () => getCitizenById(id),
    [id]
  );

  if (loading) {
    return (
      <PageWrapper
        title="Citizen Profile"
        showBack
        backPath="/home-affairs/search"
        accentColour="#1A5276"
      >
        <p className="text-muted">Loading…</p>
      </PageWrapper>
    );
  }

  const statusVariant = citizen?.isVerified
    ? 'verified'
    : citizen?.nationalId
    ? 'captured'
    : 'awaiting';

  return (
    <PageWrapper
      title="Citizen Profile"
      showBack
      backPath="/home-affairs/search"
      accentColour="#1A5276"
    >
      <h1>{citizen?.fullName}</h1>
      <StatusBadge variant={statusVariant} />

      <div className="card card-flat" style={{ marginTop: 16 }}>
        <div className="form-grid">
          <ReadOnly label="National ID" value={citizen?.nationalId || '—'} />
          <ReadOnly label="Username" value={citizen?.username} />
          <ReadOnly
            label="Date of birth"
            value={formatDate(citizen?.dateOfBirth)}
          />
          <ReadOnly label="Gender" value={citizen?.gender} />
          <ReadOnly label="Place of birth" value={citizen?.placeOfBirth} />
          <ReadOnly label="Nationality" value={citizen?.nationality || 'Mosotho'} />
          <ReadOnly label="Phone" value={citizen?.phone} />
          <ReadOnly label="Email" value={citizen?.email} />
          <ReadOnly
            label="Address"
            value={[citizen?.village, citizen?.district]
              .filter(Boolean)
              .join(', ')}
            full
          />
        </div>
      </div>

      <h3>Documents</h3>
      {(citizen?.documents || []).length === 0 ? (
        <p className="text-muted">No documents on file.</p>
      ) : (
        <ul>
          {citizen.documents.map((doc) => (
            <li key={doc.id}>
              {doc.name} — {doc.status}
            </li>
          ))}
        </ul>
      )}

      <h3>Edit history</h3>
      {(citizen?.editHistory || []).length === 0 ? (
        <p className="text-muted">No edits have been made yet.</p>
      ) : (
        <ul>
          {citizen.editHistory.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.field}</strong> — {entry.from} → {entry.to} by{' '}
              {entry.by} on {formatDate(entry.at)}
            </li>
          ))}
        </ul>
      )}

      <div className="form-actions">
        <div className="form-actions-primary-group">
          {!citizen?.isVerified && (
            <Button
              variant="success"
              onClick={() => navigate(`/home-affairs/verify/${id}`)}
            >
              <FiCheckCircle /> Verify citizen
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() =>
              navigate(`/home-affairs/registrations/${citizen?.registrationId || id}`)
            }
          >
            <FiEdit /> Edit record
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <FiPrinter /> Print profile
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              navigate(`/home-affairs/citizen/${id}/documents`)
            }
          >
            <FiFileText /> View applications
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}

function ReadOnly({ label, value, full = false }) {
  return (
    <div
      className="form-field"
      style={full ? { gridColumn: '1 / -1' } : undefined}
    >
      <label className="form-label">{label}</label>
      <div className="form-input form-input-readonly">{value || '—'}</div>
    </div>
  );
}

export default HACitizenProfile;