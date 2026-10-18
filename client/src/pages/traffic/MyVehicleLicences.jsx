import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getVehicleLicences } from '../../api/trafficApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  PENDING: 'captured',
  ISSUED: 'verified',
  RENEWED: 'verified',
  EXPIRED: 'rejected',
};

function MyVehicleLicences() {
  const { data, loading } = useFetch(getVehicleLicences, []);
  const navigate = useNavigate();

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'licence_number', label: 'Licence number', render: (r) => r.licence_number || '—' },
    { key: 'issue_date', label: 'Issued', render: (r) => (r.issue_date ? formatDate(r.issue_date) : '—') },
    { key: 'expiry_date', label: 'Expires', render: (r) => (r.expiry_date ? formatDate(r.expiry_date) : '—') },
    { key: 'fee_amount', label: 'Fee', render: (r) => `M ${Number(r.fee_amount || 0).toFixed(2)}` },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => ['ISSUED', 'RENEWED', 'EXPIRED'].includes(row.status) ? (
        <Button
          variant="secondary"
          size="small"
          onClick={() => navigate(`/traffic/vehicle-licences/new?renewalId=${row.id}&vehicleId=${row.vehicle_id}`)}
        >
          Renew
        </Button>
      ) : '—',
    },
  ];

  return (
    <PageWrapper title="Vehicle Licensing" showBack backPath="/traffic/dashboard" accentColour="#B9770E">
      <h1>Vehicle licensing</h1>

      <div className="quick-actions">
        <Button variant="primary" onClick={() => navigate('/traffic/vehicle-licences/new')}>
          Apply for vehicle licence
        </Button>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No vehicle licences" message="Apply for a licence to see it here." />
      ) : (
        <Table columns={columns} data={data} />
      )}
    </PageWrapper>
  );
}

export default MyVehicleLicences;