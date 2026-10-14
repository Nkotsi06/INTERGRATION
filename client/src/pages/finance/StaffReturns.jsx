import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getStaffTaxReturns, reviewTaxReturn } from '../../api/financeApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured', UNDER_REVIEW: 'captured',
  APPROVED: 'verified', REJECTED: 'rejected',
};

function StaffReturns() {
  const { data, loading, refetch } = useFetch(getStaffTaxReturns, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [busy, setBusy] = useState(null);
  const { success, error: showError } = useNotification();

  const years = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((r) => r.tax_year).filter(Boolean))).sort().reverse();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (yearFilter && r.tax_year !== yearFilter) return false;
      return true;
    });
  }, [data, statusFilter, yearFilter]);

  const handle = async (id, status) => {
    setBusy(id);
    try {
      await reviewTaxReturn(id, { status });
      success(`Return ${status.toLowerCase()}`);
      refetch();
    } catch (err) {
      showError(err.message || 'Could not review this return.');
    } finally {
      setBusy(null);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'tax_year', label: 'Year' },
    { key: 'income_declared', label: 'Income',
      render: (r) => formatCurrency(r.income_declared) },
    { key: 'taxable_income', label: 'Taxable',
      render: (r) => formatCurrency(r.taxable_income) },
    { key: 'tax_due', label: 'Tax due',
      render: (r) => formatCurrency(r.tax_due) },
    { key: 'submitted_at', label: 'Submitted',
      render: (r) => formatDate(r.submitted_at) },
    { key: 'status', label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button variant="success" size="small"
            disabled={busy === r.id || r.status === 'APPROVED'}
            onClick={() => handle(r.id, 'APPROVED')}>
            Approve
          </Button>
          <Button variant="danger" size="small"
            disabled={busy === r.id || r.status === 'REJECTED'}
            onClick={() => handle(r.id, 'REJECTED')}>
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="Tax Returns" showBack backPath="/finance/staff" accentColour="#117864">
      <h1>Tax returns</h1>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select className="filter-select" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <label className="filter-label">Tax year</label>
            <select className="filter-select" value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}>
              <option value="">All</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? <p className="text-muted">Loading…</p>
        : filtered.length === 0
          ? <EmptyState title="No tax returns" message="Nothing to review." />
          : <Table columns={columns} data={filtered} />}
    </PageWrapper>
  );
}

export default StaffReturns;