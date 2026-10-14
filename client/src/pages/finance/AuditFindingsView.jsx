import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getAuditFindings, getAuditStats } from '../../api/financeApi';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  OPEN: 'captured', IN_PROGRESS: 'captured', RESOLVED: 'verified',
};

const SEVERITY_VARIANT = {
  LOW: 'default', MEDIUM: 'warning', HIGH: 'error', CRITICAL: 'error',
};

function AuditFindingsView() {
  const { data: rows, loading } = useFetch(getAuditFindings, []);
  const { data: stats } = useFetch(getAuditStats, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (severityFilter && r.severity !== severityFilter) return false;
      return true;
    });
  }, [rows, statusFilter, severityFilter]);

  const columns = [
    { key: 'finding_number', label: 'Finding #' },
    { key: 'title', label: 'Title' },
    { key: 'ministry_code', label: 'Ministry' },
    { key: 'severity', label: 'Severity',
      render: (r) => <StatusBadge variant={SEVERITY_VARIANT[r.severity] || 'pending'} label={r.severity} /> },
    { key: 'status', label: 'Status',
      render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
    { key: 'due_date', label: 'Due',
      render: (r) => (r.due_date ? formatDate(r.due_date) : '—') },
    { key: 'created_at', label: 'Opened',
      render: (r) => formatDate(r.created_at) },
  ];

  return (
    <PageWrapper title="Internal Audit" showBack backPath="/finance/staff" accentColour="#117864">
      <h1>Internal audit findings</h1>

      <div className="stats-grid">
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{stats?.open_findings ?? 0}</div>
            <div className="stat-label">Open</div>
          </div>
        </Card>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{stats?.in_progress ?? 0}</div>
            <div className="stat-label">In progress</div>
          </div>
        </Card>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{stats?.resolved ?? 0}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </Card>
        <Card variant="bordered" className="stat-card">
          <div className="stat-body">
            <div className="stat-value">{stats?.high_severity ?? 0}</div>
            <div className="stat-label">High severity</div>
          </div>
        </Card>
      </div>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select className="filter-select" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <label className="filter-label">Severity</label>
            <select className="filter-select" value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="">All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <p className="text-muted">Loading…</p>
        : filtered.length === 0
          ? <EmptyState title="No audit findings" message="Nothing to show." />
          : <Table columns={columns} data={filtered} />}
    </PageWrapper>
  );
}

export default AuditFindingsView;