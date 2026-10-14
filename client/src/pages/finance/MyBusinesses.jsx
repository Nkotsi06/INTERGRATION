import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getMyBusinesses } from '../../api/financeApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured', APPROVED: 'verified', REJECTED: 'rejected',
};

function MyBusinesses() {
  const { data, loading } = useFetch(getMyBusinesses, []);
  const navigate = useNavigate();

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'business_name', label: 'Business' },
    { key: 'business_type', label: 'Type' },
    { key: 'created_at', label: 'Submitted', render: (r) => formatDate(r.created_at) },
    { key: 'status', label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
  ];

  return (
    <PageWrapper title="Business Registrations" showBack backPath="/finance/dashboard" accentColour="#117864">
      <h1>My businesses</h1>
      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/finance/businesses/new')}>
          Register a business
        </Button>
      </div>
      {loading ? <p className="text-muted">Loading…</p>
        : !data || data.length === 0
          ? <EmptyState title="No businesses registered" message="Register above to see them here." />
          : <Table columns={columns} data={data} />}
    </PageWrapper>
  );
}

export default MyBusinesses;