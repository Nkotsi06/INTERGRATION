import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import StatusBadge from '../../components/common/StatusBadge';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import useBlobUrl from '../../hooks/useBlobUrl';
import { getProfile, getPhotoBlob, updateContact } from '../../api/citizenApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

function CitizenProfile() {
  const { data: profile, loading, refetch } = useFetch(getProfile, []);
  const photoUrl = useBlobUrl(() => getPhotoBlob(), []);
  const { success, error: showError } = useNotification();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        phone: profile.phone || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setEditing(false);
    setErrors({});
    setForm({
      phone: profile?.phone || '',
      email: profile?.email || '',
    });
  };

  const validate = () => {
    const next = {};
    if (form.phone && !/^[0-9+\-\s()]{6,30}$/.test(form.phone)) {
      next.phone = 'Please enter a valid phone number.';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Please enter a valid email address.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await updateContact({ phone: form.phone, email: form.email });
      success('Contact details updated.');
      setEditing(false);
      refetch();
    } catch (err) {
      showError(err.message || 'Could not save contact details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="My Profile" showBack backPath="/citizen/dashboard">
        <StatsSkeleton count={2} />
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

  const isVerified = profile.isVerified === true;

  return (
    <PageWrapper title="My Profile" showBack backPath="/citizen/dashboard">
      <h1>My Profile</h1>

      <div className="profile-header">
        <Avatar src={photoUrl} name={profile.fullName} size={112} />
        <div className="profile-header-body">
          <h2 className="profile-header-name">{profile.fullName}</h2>
          {isVerified ? (
            <StatusBadge variant="verified" />
          ) : (
            <StatusBadge variant="awaiting" />
          )}
          <p className="profile-header-meta">
            {profile.nationalId ? `National ID: ${profile.nationalId}` : ''}
          </p>
        </div>
      </div>

      {isVerified ? (
        <div className="verification-status verified">
          <span className="verification-status-title">Verified</span>
          <span className="verification-status-subtitle">
            Identity verified by Home Affairs
          </span>
        </div>
      ) : (
        <div className="verification-status pending">
          <span className="verification-status-title">Not yet verified</span>
          <span className="verification-status-subtitle">
            Visit a Home Affairs office to complete your verification.
          </span>
        </div>
      )}

      <div className="form-section">
        <h3 className="form-section-title">Personal information</h3>
        <div className="form-grid">
          <ReadOnlyField label="Full name" value={profile.fullName} />
          <ReadOnlyField label="National ID" value={profile.nationalId} />
          <ReadOnlyField label="Date of birth" value={formatDate(profile.dateOfBirth)} />
          <ReadOnlyField label="Gender" value={profile.gender} />
          <ReadOnlyField label="Place of birth" value={profile.placeOfBirth} />
          <ReadOnlyField label="Nationality" value={profile.nationality || '—'} />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">Contact and address</h3>
          {!editing && (
            <Button variant="secondary" size="small" onClick={handleEdit}>
              Edit contact details
            </Button>
          )}
        </div>

        <div className="form-grid">
          {editing ? (
            <>
              <Input
                label="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                error={errors.phone}
                autoComplete="tel"
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                autoComplete="email"
              />
            </>
          ) : (
            <>
              <ReadOnlyField label="Phone number" value={profile.phone || '—'} />
              <ReadOnlyField label="Email" value={profile.email || '—'} />
            </>
          )}
          <ReadOnlyField label="Address" value={profile.address || '—'} full />
        </div>

        {editing && (
          <div className="form-actions">
            <div className="form-actions-primary-group">
              <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>
                Save changes
              </Button>
            </div>
          </div>
        )}
      </div>

      {profile.updatedAt && (
        <p className="text-muted">
          Last updated by Home Affairs on {formatDate(profile.updatedAt)}.
        </p>
      )}

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