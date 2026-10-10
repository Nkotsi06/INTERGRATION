import { useLocation, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ReferenceNumber from '../../components/ministry/ReferenceNumber';
import { formatCurrency } from '../../utils/formatters';

function PaymentConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result || {};

  return (
    <PageWrapper
      title="Payment Confirmation"
      accentColour="#117864"
    >
      <div className="result-card">
        <StatusBadge variant="verified" />
        <h2>Payment successful</h2>
        <p>Your tax payment has been received.</p>

        <ReferenceNumber value={result.referenceNumber} label="Reference" />

        <div className="form-grid" style={{ width: '100%', marginTop: 16 }}>
          <ReadOnly label="Amount paid" value={formatCurrency(result.amount)} />
          <ReadOnly label="New balance" value={formatCurrency(result.newBalance)} />
          <ReadOnly label="Date" value={result.date} />
          <ReadOnly label="Method" value={result.method || 'Mobile money'} />
        </div>

        <div className="result-actions">
          <Button variant="secondary" onClick={() => window.print()}>
            Download receipt
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/finance/tax/profile')}
          >
            View tax profile
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

export default PaymentConfirmation;