import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getPensionInfo } from '../../api/pensionsApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

function ViewPensionInfo() {
  const { data: p, loading } = useFetch(getPensionInfo, []);
  const navigate = useNavigate();

  return (
    <PageWrapper
      title="Pension Information"
      showBack
      backPath="/pensions/dashboard"
      accentColour="#7D3C98"
    >
      <h1 style={{ fontSize: '22pt' }}>Pension information</h1>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : !p ? (
        <p className="text-muted">No pension record found.</p>
      ) : (
        <>
          <StatusBadge
            variant={p.paymentStatus === 'ACTIVE' ? 'verified' : 'captured'}
            label={`Payment status: ${p.paymentStatus || 'Active'}`}
          />

          <div className="card card-flat" style={{ marginTop: 16, fontSize: '14pt' }}>
            <div className="form-grid">
              <ReadOnly label="Pension type" value={p.pensionType} />
              <ReadOnly label="Pension number" value={p.pensionNumber} />
              <ReadOnly
                label="Monthly amount"
                value={formatCurrency(p.monthlyAmount)}
              />
              <ReadOnly
                label="Next payment date"
                value={formatDate(p.nextPaymentDate)}
              />
            </div>
          </div>

          <div className="form-actions">
            <div className="form-actions-primary-group">
              <Button
                variant="secondary"
                onClick={() => navigate('/pensions/dashboard')}
              >
                Back to dashboard
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/pensions/verify')}
              >
                Perform verification
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

export default ViewPensionInfo;