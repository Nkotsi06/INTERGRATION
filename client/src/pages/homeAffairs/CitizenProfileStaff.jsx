import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import useBlobUrl from '../../hooks/useBlobUrl';
import {
  getCitizenById,
  getCitizenPhotoBlob,
} from '../../api/homeAffairsApi';
import { formatDate } from '../../utils/formatters';

/* GROUP C — helper */
function labelForEmployerType(code) {
  const map = {
    GOVERNMENT: 'Government',
    PRIVATE: 'Private sector',
    SELF_EMPLOYED: 'Self-employed',
    NGO: 'NGO',
    OTHER: 'Other',
  };
  return map[code] || code;
}

function HACitizenProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: citizen, loading } = useFetch(
    () => getCitizenById(id),
    [id]
  );
  const photoUrl = useBlobUrl(
    () => getCitizenPhotoBlob(id),
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
        <StatsSkeleton count={2} />
      </PageWrapper>
    );
  }

  if (!citizen) {
    return (
      <PageWrapper
        title="Citizen Profile"
        showBack
        backPath="/home-affairs/search"
        accentColour="#1A5276"
      >
        <p className="text-muted">Citizen not found.</p>
      </PageWrapper>
    );
  }

  const isVerified = !!citizen.is_verified;
  const nationalId = citizen.national_id;
  const fullName =
    `${citizen.first_name || ''} ${citizen.last_name || ''}`.trim();

  const statusVariant = isVerified
    ? 'verified'
    : nationalId
    ? 'captured'
    : 'awaiting';

  return (
    <PageWrapper
      title="Citizen Profile"
      showBack
      backPath="/home-affairs/search"
      accentColour="#1A5276"
    >
      <div className="profile-header">
        <Avatar src={photoUrl} name={fullName} size={112} />
        <div className="profile-header-body">
          <h1 className="profile-header-name">{fullName}</h1>
          <StatusBadge variant={statusVariant} />
          <p className="profile-header-meta">
            {nationalId ? `National ID: ${nationalId}` : ''}
          </p>
          {isVerified && citizen.verified_at && (
            <p className="profile-header-meta">
              Verified on {formatDate(citizen.verified_at)}
            </p>
          )}
        </div>
      </div>

      <div className="card card-flat" style={{ marginTop: 16 }}>
        <div className="form-grid">
          <ReadOnly label="National ID" value={nationalId || '—'} />
          <ReadOnly
            label="Date of birth"
            value={formatDate(citizen.date_of_birth)}
          />
          <ReadOnly label="Gender" value={citizen.gender} />
          <ReadOnly label="Place of birth" value={citizen.place_of_birth} />
          <ReadOnly
            label="Nationality"
            value={citizen.nationality || 'Mosotho'}
          />
          <ReadOnly label="Phone" value={citizen.phone} />
          <ReadOnly label="Email" value={citizen.email} />
          <ReadOnly label="Address" value={citizen.address} full />
        </div>
      </div>

      {/* GROUP C — Employment history */}
      {citizen.employmentHistory && citizen.employmentHistory.length > 0 && (
        <div className="card card-flat" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Employment history</h3>
          <ul className="employment-history-list">
            {citizen.employmentHistory.map((row) => (
              <li key={row.id}>
                <strong>{row.employer_name}</strong>
                <span className="text-muted"> · {labelForEmployerType(row.employer_type)}</span>
                {row.position_title && (
                  <span className="text-muted"> · {row.position_title}</span>
                )}
                <div className="text-muted">
                  {row.start_date} → {row.is_current ? 'Present' : row.end_date || '—'}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-actions">
        <div className="form-actions-primary-group">
          {!isVerified && (
            <Button
              variant="success"
              onClick={() => navigate(`/home-affairs/verify/${id}`)}
            >
              Verify citizen
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() =>
              navigate(`/home-affairs/registrations/${citizen.registrationId}`)
            }
            disabled={!citizen.registrationId}
            title={
              citizen.registrationId
                ? 'Edit this citizen record'
                : 'Registration link unavailable'
            }
          >
            Edit record
          </Button>

          <Button variant="secondary" onClick={() => window.print()}>
            Print profile
          </Button>

          <Button
            variant="ghost"
            onClick={() =>
              navigate(`/home-affairs/citizen/${id}/documents`)
            }
          >
            View documents
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