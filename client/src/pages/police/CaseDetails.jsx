import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import StatusBadge from '../../components/common/StatusBadge';
import StatusTimeline from '../../components/ministry/StatusTimeline';
import Button from '../../components/common/Button';
import useFetch from '../../hooks/useFetch';
import { getCaseByNumber } from '../../api/policeApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured',
  UNDER_INVESTIGATION: 'captured',
  UPDATED: 'captured',
  CLOSED: 'verified',
};

function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: c, loading } = useFetch(() => getCaseByNumber(id), [id]);

  if (loading) {
    return (
      <PageWrapper
        title="Case Details"
        showBack
        backPath="/police/cases"
        accentColour="#922B21"
      >
        <p className="text-muted">Loading…</p>
      </PageWrapper>
    );
  }

  if (!c) {
    return (
      <PageWrapper
        title="Case Details"
        showBack
        backPath="/police/cases"
        accentColour="#922B21"
      >
        <p className="text-muted">Case not found.</p>
      </PageWrapper>
    );
  }

  const history = (c.updates || []).map((u) => ({
    status: u.status || 'UPDATED',
    statusLabel: u.status || 'Updated',
    date: formatDate(u.createdAt),
    notes: u.notes,
  }));

  return (
    <PageWrapper
      title="Case Details"
      showBack
      backPath="/police/cases"
      accentColour="#922B21"
    >
      <h1>Case {c.caseNumber}</h1>
      <StatusBadge variant={STATUS_VARIANT[c.status] || 'pending'} label={c.status} />

      <div className="card card-flat" style={{ marginTop: 16 }}>
        <div className="form-grid">
          <ReadOnly label="Case type" value={c.caseType} />
          <ReadOnly label="Date reported" value={formatDate(c.createdAt)} />
          <ReadOnly label="Incident date" value={formatDate(c.incidentDate)} />
          <ReadOnly label="Location" value={c.location} />
          <ReadOnly label="Assigned officer" value={c.officer || '—'} />
        </div>

        <div className="form-field" style={{ marginTop: 16 }}>
          <label className="form-label">Description</label>
          <div className="form-input form-input-readonly" style={{ minHeight: 80 }}>
            {c.description || '—'}
          </div>
        </div>
      </div>

      <h3>Status timeline</h3>
      <StatusTimeline history={history} />

      <div className="form-actions">
        <div className="form-actions-primary-group">
          <Button
            variant="secondary"
            onClick={() => navigate('/police/cases')}
          >
            Back to my cases
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

export default CaseDetails;