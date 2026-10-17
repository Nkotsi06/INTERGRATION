import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getPensionInfo } from '../../api/pensionsApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

function ViewPensionInfo() {
  const { data, loading } = useFetch(getPensionInfo, []);
  const navigate = useNavigate();

  const record = data?.record || null;
  const eligibility = data?.eligibility || null;

  return (
    <PageWrapper
      title="Pension Information"
      showBack
      backPath="/pensions/dashboard"
      accentColour="#7D3C98"
    >
      <h1 style={{ fontSize: '22pt' }}>Pension information</h1>

      {eligibility && (
        <div
          className={`verification-status ${
            eligibility.eligible ? 'verified' : 'pending'
          }`}
          style={{ marginBottom: 16 }}
        >
          <span className="verification-status-title">
            {eligibility.eligible
              ? `You qualify — ${labelForCategory(eligibility.category)}`
              : 'Not eligible at this time'}
          </span>
          <span className="verification-status-subtitle">
            {eligibility.message}
          </span>
          {eligibility.currentAge != null && (
            <span className="verification-status-subtitle">
              Current age: {eligibility.currentAge}. Minimum age: {eligibility.minimumAge}.
            </span>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : !record ? (
        <p className="text-muted">No pension record found.</p>
      ) : (
        <>
          <StatusBadge
            variant={record.payment_status === 'ACTIVE' ? 'verified' : 'captured'}
            label={`Payment status: ${record.payment_status || 'Active'}`}
          />
          <div className="card card-flat" style={{ marginTop: 16, fontSize: '14pt' }}>
            <div className="form-grid">
              <ReadOnly label="Pension type" value={record.pension_type} />
              <ReadOnly label="Pension number" value={record.pension_number} />
              <ReadOnly label="Monthly amount" value={formatCurrency(record.monthly_amount)} />
              <ReadOnly label="Next payment date" value={formatDate(record.next_payment_date)} />
            </div>
          </div>
        </>
      )}

      <div className="form-actions">
        <div className="form-actions-primary-group">
          <Button variant="secondary" onClick={() => navigate('/pensions/dashboard')}>
            Back to dashboard
          </Button>
          {eligibility?.eligible && (
            <Button variant="primary" onClick={() => navigate('/pensions/verify')}>
              Perform verification
            </Button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

function labelForCategory(code) {
  if (code === 'OLD_AGE') return 'Old Age Pension';
  if (code === 'CIVIL_SERVICE') return 'Civil Service Pension';
  return 'pension';
}

function ReadOnly({ label, value }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div className="form-input form-input-readonly">{value || '—'}</div>
    </div>
  );
}

export default ViewPensionInfo;