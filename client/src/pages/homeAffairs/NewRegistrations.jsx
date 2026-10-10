import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
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
      if (fromDate && row.dateRegistered) {
        if (new Date(row.dateRegistered) < new Date(fromDate)) return false;
      }
      if (search) {
        const q = search.trim().toLowerCase();
        const match =
          row.username?.toLowerCase().includes(q) ||
          row.fullName?.toLowerCase().includes(q) ||
          row.nationalId?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [registrations, status, fromDate, search]);

  const hasActive = !!(status || fromDate || search);

  const columns = [
    { key: 'username', label: 'Username' },
    {
      key: 'dateRegistered',
      label: 'Date registered',
      render: (row) => (row.dateRegistered ? formatDate(row.dateRegistered) : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge variant={STATUS_VARIANT[row.status] || 'awaiting'} />
      ),
    },
    {
      key: 'nationalId',
      label: 'National ID',
      render: (row) => row.nationalId || 'Not yet generated',
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
                ? `/home-affairs/citizen/${row.citizenId}`
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

      {loading ? (
        <p className="text-muted">Loading registrations…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FiUsers />}
          title="No registrations found"
          message="Try changing the filters or the search text."
          actionLabel="Clear filters"
          onAction={() => {
            setStatus('');
            setFromDate('');
            setSearch('');
          }}
        />
      ) : (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default NewRegistrations;