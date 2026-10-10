import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFolder } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import useFetch from '../../hooks/useFetch';
import { getStaffCases } from '../../api/policeApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured',
  UNDER_INVESTIGATION: 'captured',
  UPDATED: 'captured',
  CLOSED: 'verified',
};

function ManageCases() {
  const { data: cases, loading } = useFetch(getStaffCases, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!cases) return [];
    return cases.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (dateFilter && c.createdAt < dateFilter) return false;
      return true;
    });
  }, [cases, statusFilter, dateFilter]);

  const hasActive = !!(statusFilter || dateFilter);

  const columns = [
    { key: 'caseNumber', label: 'Case number' },
    { key: 'citizenName', label: 'Citizen' },
    { key: 'caseType', label: 'Type' },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <Button
          variant="secondary"
          size="small"
          onClick={() => navigate(`/police/update/${r.id}`)}
        >
          Update
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Manage Cases"
      showBack
      backPath="/police/staff"
      accentColour="#922B21"
    >
      <h1>Manage cases</h1>
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
              <option value="UNDER_INVESTIGATION">Under investigation</option>
              <option value="CLOSED">Closed</option>
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
          icon={<FiFolder />}
          title="No cases match"
          message="Change the filters to see more."
        />
      ) : (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default ManageCases;