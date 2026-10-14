import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getMyTaxReturns } from '../../api/financeApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured', UNDER_REVIEW: 'captured',
  APPROVED: 'verified', REJECTED: 'rejected',
};

function MyTaxReturns() {
  const { data, loading } = useFetch(getMyTaxReturns, []);
  const navigate = useNavigate();

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'tax_year', label: 'Year' },
    { key: 'income_declared', label: 'Income',
      render: (r) => `M ${Number(r.income_declared || 0).toFixed(2)}` },
    { key: 'tax_due', label: 'Tax due',
      render: (r) => `M ${Number(r.tax_due || 0).toFixed(2)}` },
    { key: 'created_at', label: 'Submitted', render: (r) => formatDate(r.created_at) },
    { key: 'status', label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
  ];

  return (
    <PageWrapper title="Tax Returns" showBack backPath="/finance/dashboard" accentColour="#117864">
      <h1>My tax returns</h1>
      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/finance/returns/new')}>
          File a new return
        </Button>
      </div>
      {loading ? <p className="text-muted">Loading…</p>
        : !data || data.length === 0
          ? <EmptyState title="No tax returns yet" message="File your first return above." />
          : <Table columns={columns} data={data} />}
    </PageWrapper>
  );
}

export default MyTaxReturns;