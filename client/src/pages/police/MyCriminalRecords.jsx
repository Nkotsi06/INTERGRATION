import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getMyCriminalRecords } from '../../api/policeApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  PENDING: 'captured',
  ISSUED: 'verified',
  REJECTED: 'rejected',
};

function MyCriminalRecords() {
  const { data, loading } = useFetch(getMyCriminalRecords, []);
  const navigate = useNavigate();

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'created_at', label: 'Requested', render: (r) => formatDate(r.created_at) },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} />,
    },
    {
      key: 'valid_until',
      label: 'Valid until',
      render: (r) => (r.valid_until ? formatDate(r.valid_until) : '—'),
    },
  ];

  return (
    <PageWrapper
      title="My Criminal Records"
      showBack
      backPath="/police/dashboard"
      accentColour="#922B21"
    >
      <h1>My criminal records</h1>

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/police/criminal-records/new')}>
          Request new record
        </Button>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No requests yet" message="Click 'Request new record' to submit one." />
      ) : (
        <Table columns={columns} data={data} />
      )}
    </PageWrapper>
  );
}

export default MyCriminalRecords;