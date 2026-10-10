import { useState, useMemo } from 'react';
import { FiFileText } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import useFetch from '../../hooks/useFetch';
import { getStaffApplications, processApplication } from '../../api/passportApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured',
  UNDER_REVIEW: 'captured',
  APPROVED: 'verified',
  REJECTED: 'rejected',
  COMPLETED: 'verified',
};

function ProcessApplication() {
  const { data, loading, refetch } = useFetch(getStaffApplications, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const { success, error: showError } = useNotification();

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (dateFilter && a.dateSubmitted < dateFilter) return false;
      return true;
    });
  }, [data, statusFilter, dateFilter]);

  const hasActive = !!(statusFilter || dateFilter);

  const handle = async (id, action) => {
    try {
      await processApplication(id, { action });
      success(`Application ${action.toLowerCase()}`);
      refetch();
    } catch (err) {
      showError('Could not process this application.');
    }
  };

  const columns = [
    { key: 'referenceNumber', label: 'Reference' },
    { key: 'citizenName', label: 'Citizen' },
    { key: 'nationalId', label: 'National ID' },
    { key: 'dateSubmitted', label: 'Submitted', render: (r) => formatDate(r.dateSubmitted) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div style={{ display: 'flex', gap: 4 }}>
        <Button variant="success" size="small" onClick={() => handle(r.id, 'APPROVE')}>
          Approve
        </Button>
        <Button variant="secondary" size="small" onClick={() => handle(r.id, 'REQUEST_INFO')}>
          Request info
        </Button>
        <Button variant="danger" size="small" onClick={() => handle(r.id, 'REJECT')}>
          Reject
        </Button>
      </div>
    ) },
  ];

  return (
    <PageWrapper
      title="Process Passport Application"
      showBack
      backPath="/passport/staff"
      accentColour="#17A2B8"
    >
      <h1>Process passport application</h1>
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
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under review</option>
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
          title="No applications match"
          message="Change the filters to see more."
        />
      ) : (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default ProcessApplication;