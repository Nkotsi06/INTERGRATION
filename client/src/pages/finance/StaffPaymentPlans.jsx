import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getStaffPaymentPlans, processPaymentPlan } from '../../api/financeApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured', UNDER_REVIEW: 'captured',
  APPROVED: 'verified', REJECTED: 'rejected',
};

function StaffPaymentPlans() {
  const { data, loading, refetch } = useFetch(getStaffPaymentPlans, []);
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
      await processPaymentPlan(id, { action });
      success(`Payment plan ${action.toLowerCase()}d`);
      refetch();
    } catch (err) {
      showError(err.message || 'Could not process the plan.');
    } finally {
      setBusy(null);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'total_amount', label: 'Total',
      render: (r) => formatCurrency(r.total_amount) },
    { key: 'instalment_amount', label: 'Per instalment',
      render: (r) => formatCurrency(r.instalment_amount) },
    { key: 'number_of_instalments', label: 'Instalments' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'start_date', label: 'Starts',
      render: (r) => formatDate(r.start_date) },
    { key: 'status', label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
    {
      key: 'actions',
      label: '',
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
    <PageWrapper title="Payment Plans" showBack backPath="/finance/staff" accentColour="#117864">
      <h1>Payment plans</h1>

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
          ? <EmptyState title="No payment plans" message="Nothing to approve." />
          : <Table columns={columns} data={filtered} />}
    </PageWrapper>
  );
}

export default StaffPaymentPlans;