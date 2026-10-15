import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getRegistrations } from '../../api/homeAffairsApi';
import { formatDate } from '../../utils/formatters';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'AWAITING', label: 'Awaiting Home Affairs' },
  { value: 'CAPTURED', label: 'Details captured' },
  { value: 'VERIFIED', label: 'Verified' },
];

const STATUS_VARIANT = {
  AWAITING: 'awaiting',
  CAPTURED: 'captured',
  VERIFIED: 'verified',
};

function NewRegistrations() {
  const { data: registrations, loading } = useFetch(getRegistrations, []);
  const navigate = useNavigate();

  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!registrations) return [];
    return registrations.filter((row) => {
      if (status && row.status !== status) return false;
      if (fromDate && row.date_registered) {
        if (new Date(row.date_registered) < new Date(fromDate)) return false;
      }
      if (search) {
        const q = search.trim().toLowerCase();
        const match =
          row.username?.toLowerCase().includes(q) ||
          row.full_name?.toLowerCase().includes(q) ||
          row.national_id?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [registrations, status, fromDate, search]);

  const hasActive = !!(status || fromDate || search);

  const columns = [
    { key: 'username', label: 'Username' },
    {
      key: 'date_registered',
      label: 'Date registered',
      render: (row) =>
        row.date_registered ? formatDate(row.date_registered) : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge variant={STATUS_VARIANT[row.status] || 'awaiting'} />
      ),
    },
    {
      key: 'national_id',
      label: 'National ID',
      render: (row) => row.national_id || 'Not yet generated',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button
          variant="secondary"
          size="small"
          onClick={() =>
            navigate(
              row.status === 'VERIFIED'
                ? `/home-affairs/citizen/${row.citizen_id}`
                : `/home-affairs/registrations/${row.id}`
            )
          }
        >
          Open
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper
      title="New Registrations"
      showBack
      backPath="/home-affairs/dashboard"
      accentColour="#1A5276"
    >
      <h1>New registrations</h1>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown">
            <label className="filter-label">Date registered</label>
            <input
              type="date"
              className="filter-date-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="filter-dropdown" style={{ minWidth: 220 }}>
            <label className="filter-label">Search username or ID</label>
            <input
              type="text"
              className="filter-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. teboho.nko"
            />
          </div>
        </div>

        {hasActive && (
          <button
            type="button"
            className="clear-filters"
            onClick={() => {
              setStatus('');
              setFromDate('');
              setSearch('');
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && <TableSkeleton rows={6} columns={5} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No registrations found"
          message="Try changing the filters or the search text."
          actionLabel="Clear filters"
          onAction={() => {
            setStatus('');
            setFromDate('');
            setSearch('');
          }}
        />
      )}

      {!loading && filtered.length > 0 && (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default NewRegistrations;