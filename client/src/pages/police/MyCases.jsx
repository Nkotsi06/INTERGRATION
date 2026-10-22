import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import StatusTimeline from '../../components/ministry/StatusTimeline';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getMyCases } from '../../api/policeApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'pending',
  UNDER_INVESTIGATION: 'inReview',
  UPDATED: 'inReview',
  CLOSED: 'completed',
};

function MyCases() {
  const { data: cases, loading } = useFetch(getMyCases, [], {
    pollInterval: 30000,
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
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
    { key: 'caseNumber', label: 'Case Number', render: (r) => r.caseNumber || r.case_number || '—' },
    { key: 'caseType', label: 'Type', render: (r) => r.caseType || r.case_type || '—' },
    {
      key: 'createdAt',
      label: 'Date Reported',
      render: (r) => formatDate(r.createdAt || r.created_at),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setSelectedCase(r)}
          >
            View Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="My Cases"
      showBack
      backPath="/police/dashboard"
      accentColour="#922B21"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>My Police Cases</h1>
          <p className="text-muted" style={{ margin: '4px 0 0 0' }}>
            Track the investigation status and progress of all cases you have reported.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/police/report')}>
          Report New Case
        </Button>
      </div>

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
              <option value="UPDATED">Updated</option>
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

      {loading && <TableSkeleton rows={5} columns={5} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No cases found"
          message="You have not reported any cases or no cases match your filters."
        />
      )}

      {!loading && filtered.length > 0 && (
        <Table columns={columns} data={filtered} />
      )}

      {/* Case Details Modal */}
      {selectedCase && (
        <Modal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          title={`Case Details — ${selectedCase.caseNumber || selectedCase.case_number}`}
          size="large"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B' }}>
              Type: {selectedCase.caseType || selectedCase.case_type || 'General Police Report'}
            </span>
            <StatusBadge
              variant={STATUS_VARIANT[selectedCase.status] || 'pending'}
              label={selectedCase.status}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              backgroundColor: '#F8FAFC',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              marginBottom: 20,
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>Date Reported</span>
              <strong>{formatDate(selectedCase.createdAt || selectedCase.created_at)}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>Incident Date</span>
              <strong>{selectedCase.incidentDate || selectedCase.incident_date ? formatDate(selectedCase.incidentDate || selectedCase.incident_date) : 'Not specified'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>Location</span>
              <strong>{selectedCase.location || '—'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>Assigned Officer</span>
              <strong>{selectedCase.officer || selectedCase.assigned_officer || 'Investigating Officer Pending'}</strong>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Full Case Description
            </label>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: 6,
                padding: '12px 16px',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: '#1E293B',
                whiteSpace: 'pre-wrap',
                minHeight: 90,
              }}
            >
              {selectedCase.description || 'No detailed narrative provided.'}
            </div>
          </div>

          {selectedCase.updates && selectedCase.updates.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#334155' }}>Case Timeline & Updates</h4>
              <StatusTimeline
                history={selectedCase.updates.map((u) => ({
                  status: u.status || 'UPDATED',
                  statusLabel: u.status || 'Investigation Update',
                  date: formatDate(u.createdAt || u.created_at),
                  notes: u.notes || u.comment,
                }))}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setSelectedCase(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
}

export default MyCases;
