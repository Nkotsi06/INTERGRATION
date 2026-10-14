import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getStaffVat, processVat } from '../../api/financeApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured', APPROVED: 'verified', REJECTED: 'rejected',
};

function StaffVat() {
  const { data, loading, refetch } = useFetch(getStaffVat, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [busy, setBusy] = useState(null);
  const { success, error: showError } = useNotification();

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r) => !statusFilter || r.status === statusFilter);
  }, [data, statusFilter]);

  const handle = async (id, action) => {
    setBusy(id);
    try {
      await processVat(id, { action });
      success(`VAT registration ${action.toLowerCase()}d`);
      refetch();
    } catch (err) {
      showError(err.message || 'Could not process this registration.');
    } finally {
      setBusy(null);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'business_name', label: 'Business' },
    { key: 'nature_of_business', label: 'Nature', render: (r) => r.nature_of_business || '—' },
    { key: 'annual_turnover', label: 'Turnover',
      render: (r) => (r.annual_turnover ? `M ${Number(r.annual_turnover).toFixed(2)}` : '—') },
    { key: 'created_at', label: 'Submitted', render: (r) => formatDate(r.created_at) },
    { key: 'status', label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button variant="success" size="small"
            disabled={busy === r.id || r.status === 'APPROVED'}
            onClick={() => handle(r.id, 'APPROVE')}>
            Approve
          </Button>
          <Button variant="danger" size="small"
            disabled={busy === r.id || r.status === 'REJECTED'}
            onClick={() => handle(r.id, 'REJECT')}>
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="VAT Applications" showBack backPath="/finance/staff" accentColour="#117864">
      <h1>VAT applications</h1>

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
          ? <EmptyState title="No VAT applications" message="Nothing to show." />
          : <Table columns={columns} data={filtered} />}
    </PageWrapper>
  );
}

export default StaffVat;