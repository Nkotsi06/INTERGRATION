import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getStaffBusinesses, approveBusiness } from '../../api/financeApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured', APPROVED: 'verified', REJECTED: 'rejected',
};

function StaffBusinesses() {
  const { data, loading, refetch } = useFetch(getStaffBusinesses, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [busy, setBusy] = useState(null);
  const { success, error: showError } = useNotification();

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r) => !statusFilter || r.status === statusFilter);
  }, [data, statusFilter]);

  const handleApprove = async (id) => {
    setBusy(id);
    try {
      await approveBusiness(id);
      success('Business approved');
      refetch();
    } catch (err) {
      showError(err.message || 'Could not approve this business.');
    } finally {
      setBusy(null);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'business_name', label: 'Business' },
    { key: 'trading_name', label: 'Trading as', render: (r) => r.trading_name || '—' },
    { key: 'business_type', label: 'Type' },
    { key: 'phone', label: 'Phone', render: (r) => r.phone || '—' },
    { key: 'created_at', label: 'Submitted', render: (r) => formatDate(r.created_at) },
    { key: 'status', label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button variant="success" size="small"
          disabled={busy === r.id || r.status === 'APPROVED'}
          onClick={() => handleApprove(r.id)}>
          Approve
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper title="Business Registrations" showBack backPath="/finance/staff" accentColour="#117864">
      <h1>Business registrations</h1>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select className="filter-select" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <p className="text-muted">Loading…</p>
        : filtered.length === 0
          ? <EmptyState title="No business registrations" message="Nothing to review." />
          : <Table columns={columns} data={filtered} />}
    </PageWrapper>
  );
}

export default StaffBusinesses;