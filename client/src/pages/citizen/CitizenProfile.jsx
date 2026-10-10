import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import useFetch from '../../hooks/useFetch';
import { getProfile } from '../../api/citizenApi';
import { formatDate } from '../../utils/formatters';

function CitizenProfile() {
  const { data: profile, loading } = useFetch(getProfile, []);

  if (loading) {
    return (
      <PageWrapper title="My Profile" showBack backPath="/citizen/dashboard">
        <p className="text-muted">Loading profile…</p>
      </PageWrapper>
    );
  }

  if (!profile) {
    return (
      <PageWrapper title="My Profile" showBack backPath="/citizen/dashboard">
        <p className="text-muted">Profile could not be loaded.</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="My Profile" showBack backPath="/citizen/dashboard">
      <h1>My Profile</h1>

      <div className="verification-status verified">
        <span className="verification-status-title">
          <FiCheckCircle aria-hidden="true" /> Verified
        </span>
        <span className="verification-status-subtitle">
          Identity verified by Home Affairs
        </span>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Personal information</h3>

        <div className="form-grid">
          <ReadOnlyField label="Full name" value={profile.fullName} />
          <ReadOnlyField label="National ID" value={profile.nationalId} />
          <ReadOnlyField
            label="Date of birth"
            value={formatDate(profile.dateOfBirth)}
          />
          <ReadOnlyField label="Gender" value={profile.gender} />
          <ReadOnlyField label="Place of birth" value={profile.placeOfBirth} />
          <ReadOnlyField label="Nationality" value="Mosotho" />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Contact and address</h3>

        <div className="form-grid">
          <ReadOnlyField
            label="Phone number"
            value={profile.phone || '—'}
          />
          <ReadOnlyField label="Email" value={profile.email || '—'} />
          <ReadOnlyField
            label="Address"
            value={profile.address || '—'}
            full
          />
        </div>
      </div>

      <p className="text-muted">
        Last updated by Home Affairs
        {profile.updatedAt ? ` on ${formatDate(profile.updatedAt)}` : ''}.
      </p>

      <div className="form-actions">
        <div className="form-actions-primary-group">
          <Link to="/citizen/change-password" className="btn btn-secondary">
            Change password
          </Link>
          <Link to="/help/offices" className="btn btn-primary">
            Need to change something? Visit Home Affairs
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}

function ReadOnlyField({ label, value, full = false }) {
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

export default CitizenProfile;