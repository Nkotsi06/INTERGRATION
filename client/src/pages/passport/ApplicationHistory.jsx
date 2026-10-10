import { useState, useMemo } from 'react';
import { FiFileText } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import useFetch from '../../hooks/useFetch';
import { getStaffApplications } from '../../api/passportApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  APPROVED: 'verified',
  COMPLETED: 'verified',
  REJECTED: 'rejected',
  SUBMITTED: 'captured',
  UNDER_REVIEW: 'captured',
};

function ApplicationHistory() {
  const { data, loading } = useFetch(getStaffApplications, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (dateFilter && a.dateSubmitted < dateFilter) return false;
      return true;
    });
  }, [data, statusFilter, dateFilter]);

  const hasActive = !!(statusFilter || dateFilter);

  const columns = [
    { key: 'referenceNumber', label: 'Reference' },
    { key: 'citizenName', label: 'Citizen' },
    { key: 'dateSubmitted', label: 'Submitted', render: (r) => formatDate(r.dateSubmitted) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
  ];

  return (
    <PageWrapper
      title="Application History"
      showBack
      backPath="/passport/staff"
      accentColour="#17A2B8"
    >
      <h1>Application history</h1>

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
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
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

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Button variant="secondary" onClick={() => window.print()}>
          Print
        </Button>
        <Button variant="secondary">Export to PDF</Button>
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

export default ApplicationHistory;