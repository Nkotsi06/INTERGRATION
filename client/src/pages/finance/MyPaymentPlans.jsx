import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getMyPaymentPlans } from '../../api/financeApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured', UNDER_REVIEW: 'captured',
  APPROVED: 'verified', REJECTED: 'rejected',
};

function MyPaymentPlans() {
  const { data, loading } = useFetch(getMyPaymentPlans, []);
  const navigate = useNavigate();

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'total_amount', label: 'Total',
      render: (r) => `M ${Number(r.total_amount || 0).toFixed(2)}` },
    { key: 'instalment_amount', label: 'Per instalment',
      render: (r) => `M ${Number(r.instalment_amount || 0).toFixed(2)}` },
    { key: 'number_of_instalments', label: 'Instalments' },
    { key: 'start_date', label: 'Starts', render: (r) => formatDate(r.start_date) },
    { key: 'status', label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
  ];

  return (
    <PageWrapper title="Payment Plans" showBack backPath="/finance/dashboard" accentColour="#117864">
      <h1>Payment plans</h1>
      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/finance/payment-plans/new')}>
          Request a payment plan
        </Button>
      </div>
      {loading ? <p className="text-muted">Loading…</p>
        : !data || data.length === 0
          ? <EmptyState title="No payment plans" message="Request one to see it here." />
          : <Table columns={columns} data={data} />}
    </PageWrapper>
  );
}

export default MyPaymentPlans;