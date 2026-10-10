import { useState, useMemo } from 'react';
import { FiFileText } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import useFetch from '../../hooks/useFetch';
import { getStaffRegistrations, processRegistration } from '../../api/financeApi';
import { useNotification } from '../../context/NotificationContext';

function ProcessTaxRegistration() {
  const { data: registrations, loading, refetch } = useFetch(getStaffRegistrations, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { success, error: showError } = useNotification();

  const filtered = useMemo(() => {
    if (!registrations) return [];
    return registrations.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (dateFilter && r.createdAt < dateFilter) return false;
      return true;
    });
  }, [registrations, statusFilter, dateFilter]);

  const hasActive = !!(statusFilter || dateFilter);

  const handle = async (id, action) => {
    try {
      await processRegistration(id, { action });
      success(`Registration ${action.toLowerCase()}`);
      refetch();
    } catch (err) {
      showError('Could not process this registration.');
    }
  };

  const columns = [
    { key: 'referenceNumber', label: 'Reference' },
    { key: 'citizenName', label: 'Citizen' },
    { key: 'nationalId', label: 'National ID' },
    { key: 'incomeSource', label: 'Income source' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge variant="captured" label={r.status} /> },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div style={{ display: 'flex', gap: 4 }}>
        <Button variant="success" size="small" onClick={() => handle(r.id, 'APPROVE')}>
          Approve
        </Button>
        <Button variant="danger" size="small" onClick={() => handle(r.id, 'REJECT')}>
          Reject
        </Button>
      </div>
    ) },
  ];

  return (
    <PageWrapper
      title="Process Tax Registration"
      showBack
      backPath="/finance/staff"
      accentColour="#117864"
    >
      <h1>Process tax registration</h1>
      <p className="text-muted">
        Only citizens verified by Home Affairs appear here.
      </p>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <label className="filter-label">From date</label>
            <input
              type="date"
              className="filter-date-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
        {hasActive && (
          <button
            type="button"
            className="clear-filters"
            onClick={() => {
              setStatusFilter('');
              setDateFilter('');
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiFileText />}
          title="No registrations match"
          message="Change the filters to see more."
        />
      ) : (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default ProcessTaxRegistration;