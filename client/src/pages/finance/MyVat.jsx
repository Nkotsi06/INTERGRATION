import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getMyVat } from '../../api/financeApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured', APPROVED: 'verified', REJECTED: 'rejected',
};

function MyVat() {
  const { data, loading } = useFetch(getMyVat, []);
  const navigate = useNavigate();

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'business_name', label: 'Business' },
    { key: 'annual_turnover', label: 'Turnover',
      render: (r) => (r.annual_turnover ? `M ${Number(r.annual_turnover).toFixed(2)}` : '—') },
    { key: 'created_at', label: 'Submitted', render: (r) => formatDate(r.created_at) },
    { key: 'status', label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
  ];

  return (
    <PageWrapper title="VAT Registrations" showBack backPath="/finance/dashboard" accentColour="#117864">
      <h1>My VAT registrations</h1>
      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/finance/vat/new')}>
          Apply for VAT registration
        </Button>
      </div>
      {loading ? <p className="text-muted">Loading…</p>
        : !data || data.length === 0
          ? <EmptyState title="No VAT registrations" message="Apply above to see them here." />
          : <Table columns={columns} data={data} />}
    </PageWrapper>
  );
}

export default MyVat;