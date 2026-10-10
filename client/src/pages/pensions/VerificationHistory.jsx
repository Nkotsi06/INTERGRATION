import { useState, useMemo } from 'react';
import { FiClock } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import useFetch from '../../hooks/useFetch';
import { getVerificationHistory } from '../../api/pensionsApi';
import { formatDate } from '../../utils/formatters';

function VerificationHistory() {
  const { data, loading } = useFetch(getVerificationHistory, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((v) => {
      if (statusFilter && v.status !== statusFilter) return false;
      if (methodFilter && v.method !== methodFilter) return false;
      if (dateFilter && v.verifiedAt < dateFilter) return false;
      return true;
    });
  }, [data, statusFilter, methodFilter, dateFilter]);

  const hasActive = !!(statusFilter || methodFilter || dateFilter);

  const columns = [
    { key: 'verifiedAt', label: 'Date', render: (r) => formatDate(r.verifiedAt) },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <StatusBadge
          variant={r.status === 'VERIFIED' ? 'verified' : 'rejected'}
          label={r.status === 'VERIFIED' ? 'Successful' : 'Failed'}
        />
      ),
    },
    { key: 'method', label: 'Method' },
  ];

  return (
    <PageWrapper
      title="Verification History"
      showBack
      backPath="/pensions/dashboard"
      accentColour="#7D3C98"
    >
      <h1>Verification history</h1>

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
              <option value="VERIFIED">Successful</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <label className="filter-label">Method</label>
            <select
              className="filter-select"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="ONLINE">Online</option>
              <option value="IN_PERSON">In person</option>
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
              setMethodFilter('');
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
          icon={<FiClock />}
          title="No verifications match"
          message="Change the filters to see more."
        />
      ) : (
        <Table columns={columns} data={filtered} />
      )}
    </PageWrapper>
  );
}

export default VerificationHistory;