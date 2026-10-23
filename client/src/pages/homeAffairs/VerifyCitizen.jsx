import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Checkbox from '../../components/common/Checkbox';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getCitizenById, verifyCitizen } from '../../api/homeAffairsApi';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

const CHECKS = [
  { key: 'idChecked', label: 'ID document verified' },
  { key: 'birthCertificateChecked', label: 'Birth certificate verified' },
  { key: 'addressConfirmed', label: 'Address confirmed' },
  { key: 'photoMatches', label: 'Photo matches' },
];

function HAVerifyCitizen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success } = useNotification();
  const { data: citizen, loading } = useFetch(
    () => getCitizenById(id),
    [id]
  );

  const [checks, setChecks] = useState({
    idChecked: false,
    birthCertificateChecked: false,
    addressConfirmed: false,
    photoMatches: false,
  });
  const [notes, setNotes] = useState('');
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState(null);

  const allChecked = Object.values(checks).every(Boolean);

  const handleVerify = async () => {
    setServerError(null);
    if (!allChecked) {
      setServerError('Please complete every check before confirming.');
      return;
    }

    setSaving(true);
    try {
      await verifyCitizen(id, { checks, notes });
      setConfirmedAt(new Date().toISOString());
      success('Citizen verified');
    } catch (err) {
      setServerError(
        err.message || 'Could not confirm verification. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate(`/home-affairs/citizen/${id}`);

  if (loading) {
    return (
      <PageWrapper
        title="Verify Citizen"
        showBack
        backPath={`/home-affairs/citizen/${id}`}
        accentColour="#1A5276"
      >
        <p className="text-muted">Loading…</p>
      </PageWrapper>
    );
  }

  if (confirmedAt) {
    return (
      <PageWrapper title="Citizen Verified" accentColour="#1A5276">
        <div className="verification-result-page">
          <div className="result-card">
            <h1>Citizen verified</h1>
            <StatusBadge variant="verified" />
            <p>
              Verified by <strong>{user?.fullName || user?.username}</strong> on{' '}
              {formatDate(confirmedAt)}.
            </p>
            <div className="result-actions">
              <Button
                variant="primary"
                onClick={() => navigate(`/home-affairs/citizen/${id}`)}
              >
                View citizen profile
              </Button>
              <Button
                variant="secondary"
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

  const displayName = citizen
    ? (citizen.fullName ||
       [citizen.firstName, citizen.lastName].filter(Boolean).join(' ').trim())
    : '';

  return (
    <PageWrapper
      title="Verify Citizen"
      showBack
      backPath={`/home-affairs/citizen/${id}`}
      accentColour="#1A5276"
    >
      <h1>Verify citizen</h1>

      <div className="card card-flat" style={{ marginBottom: 24 }}>
        <div className="form-grid">
          <ReadOnly label="Full name" value={displayName} />
          <ReadOnly label="National ID" value={citizen?.nationalId} />
          <ReadOnly
            label="Date of birth"
            value={formatDate(citizen?.dateOfBirth)}
          />
        </div>
      </div>

      {serverError && <Alert type="error" message={serverError} />}

      <h3>Verification checklist</h3>
      {CHECKS.map((c) => (
        <Checkbox
          key={c.key}
          label={c.label}
          checked={checks[c.key]}
          onChange={(e) =>
            setChecks((prev) => ({ ...prev, [c.key]: e.target.checked }))
          }
        />
      ))}

      <div className="form-field" style={{ marginTop: 16 }}>
        <label className="form-label">Notes</label>
        <textarea
          className="form-input"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes for the record"
        />
      </div>

      <div className="form-actions">
        <div className="form-actions-primary-group">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleVerify}
            disabled={!allChecked || saving}
          >
            {saving ? 'Confirming…' : 'Confirm verification'}
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

export default HAVerifyCitizen;