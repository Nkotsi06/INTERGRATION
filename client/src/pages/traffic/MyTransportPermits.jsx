import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getTransportPermits } from '../../api/trafficApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured',
  UNDER_REVIEW: 'captured',
  APPROVED: 'verified',
  REJECTED: 'rejected',
};

function MyTransportPermits() {
  const { data, loading } = useFetch(getTransportPermits, []);
  const navigate = useNavigate();

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'permit_category', label: 'Category' },
    { key: 'permit_type', label: 'Type' },
    { key: 'valid_from', label: 'From', render: (r) => (r.valid_from ? formatDate(r.valid_from) : '—') },
    { key: 'valid_until', label: 'Until', render: (r) => (r.valid_until ? formatDate(r.valid_until) : '—') },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
  ];

  return (
    <PageWrapper title="Transport Permits" showBack backPath="/traffic/dashboard" accentColour="#B9770E">
      <h1>Transport permits</h1>

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/traffic/permits/new')}>
          Apply for permit
        </Button>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No permits yet" message="Apply for a permit to see it here." />
      ) : (
        <Table columns={columns} data={data} />
      )}
    </PageWrapper>
  );
}

export default MyTransportPermits;