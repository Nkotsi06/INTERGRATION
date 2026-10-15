import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Table from '../../components/common/Table';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getTaxProfile, getPayments } from '../../api/financeApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

function TaxProfile() {
  const { data: profile, loading } = useFetch(getTaxProfile, []);
  const { data: payments, loading: paymentsLoading } = useFetch(getPayments, []);
  const navigate = useNavigate();

  const columns = [
    { key: 'referenceNumber', label: 'Reference' },
    { key: 'paidAt', label: 'Date', render: (r) => formatDate(r.paidAt) },
    { key: 'amount', label: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'paymentMethod', label: 'Method' },
    { key: 'status', label: 'Status', render: () => <StatusBadge variant="verified" label="Paid" /> },
  ];

  return (
    <PageWrapper
      title="Tax Profile"
      showBack
      backPath="/finance/dashboard"
      accentColour="#117864"
    >
      <h1>Tax profile</h1>

      {loading ? (
        <TableSkeleton rows={2} columns={3} />
      ) : !profile ? (
        <p className="text-muted">No tax profile on record. Register first.</p>
      ) : (
        <>
          <div className="card card-flat" style={{ marginBottom: 24 }}>
            <div className="form-grid">
              <ReadOnly label="Tax ID" value={profile.taxId} />
              <ReadOnly label="Status" value={profile.status} />
              <ReadOnly
                label="Outstanding balance"
                value={formatCurrency(profile.outstandingBalance || 0)}
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginBottom: 24 }}>
            <div className="form-actions-primary-group">
              <Button
                variant="secondary"
                onClick={() => navigate('/finance/tax/clearance')}
              >
                Tax clearance
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/finance/payment')}
              >
                Make payment
              </Button>
            </div>
          </div>

          <h3>Recent payments</h3>
          {paymentsLoading && <TableSkeleton rows={3} columns={5} />}

          {!paymentsLoading && (!payments || payments.length === 0) && (
            <EmptyState
              title="No payments yet"
              message="Payments you make will appear here."
            />
          )}

          {!paymentsLoading && payments && payments.length > 0 && (
            <Table columns={columns} data={payments} />
          )}
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

export default TaxProfile;