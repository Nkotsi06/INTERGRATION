import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import SignaturePad from '../../components/signature/SignaturePad';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getStaffApplications, processApplication } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

const SUB_TYPE_LABEL = {
  LEARNERS_LICENCE: "Learner's licence",
  DRIVING_LICENCE: "Driver's licence",
  PUBLIC_DRIVING_PERMIT: 'Public driving permit',
  LICENCE_RENEWAL: 'Licence renewal',
};

function TrafficApplicationProcessing() {
  const { data: applications, loading, refetch } = useFetch(getStaffApplications, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [issuing, setIssuing] = useState(null);
  const [signature, setSignature] = useState(null);
  const [busy, setBusy] = useState(false);
  const { success, error: showError } = useNotification();

  const filtered = useMemo(() => {
    if (!applications) return [];
    return applications.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (dateFilter && a.submitted_at < dateFilter) return false;
      return true;
    });
  }, [applications, statusFilter, dateFilter]);

  const hasActive = !!(statusFilter || dateFilter);

  const handle = async (id, action) => {
    try {
      await processApplication(id, { action });
      success(`Application ${action.toLowerCase()}`);
      refetch();
    } catch (err) {
      showError(err.message || 'Could not process this application.');
    }
  };

  const needsSignature = (app) =>
    app.sub_type === 'DRIVING_LICENCE' || app.sub_type === 'PUBLIC_DRIVING_PERMIT';

  const openIssueModal = (app) => {
    setSignature(null);
    setIssuing(app);
  };

  const handleIssue = async () => {
    if (!issuing) return;
    if (needsSignature(issuing) && !signature) {
      return showError('Citizen must sign before the licence can be issued.');
    }
    setBusy(true);
    try {
      await processApplication(issuing.id, {
        action: 'APPROVE',
        citizenSignature: signature || undefined,
      });
      success('Licence issued');
      setIssuing(null);
      setSignature(null);
      refetch();
    } catch (err) {
      showError(err.message || 'Could not issue the licence.');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    { key: 'sub_type', label: 'Type',
      render: (r) => SUB_TYPE_LABEL[r.sub_type] || r.sub_type || '—' },
    { key: 'submitted_at', label: 'Submitted',
      render: (r) => (r.submitted_at ? formatDate(r.submitted_at) : '—') },
    { key: 'status', label: 'Status',
      render: (r) => <StatusBadge variant="captured" label={r.status} /> },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Button variant="success" size="small"
          onClick={() => (needsSignature(r) ? openIssueModal(r) : handle(r.id, 'APPROVE'))}>
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
    <PageWrapper title="Application Processing" showBack backPath="/traffic/staff" accentColour="#B9770E">
      <h1>Application processing</h1>

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
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <label className="filter-label">From date</label>
            <input type="date" className="filter-date-input" value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)} />
          </div>
        </div>
        {hasActive && (
          <button type="button" className="clear-filters"
            onClick={() => { setStatusFilter(''); setDateFilter(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {loading && <TableSkeleton rows={6} columns={5} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No applications match"
          message="Change the filters to see more results."
        />
      )}

      {!loading && filtered.length > 0 && (
        <Table columns={columns} data={filtered} />
      )}

      {issuing && (
        <Modal isOpen onClose={() => setIssuing(null)}
          title="Citizen signature required"
          size="medium">
          <p className="text-muted">
            Ask the citizen to sign below. This signature will be stored on their driver's licence record.
          </p>
          <SignaturePad onSave={setSignature} onClear={() => setSignature(null)} />
          <div className="form-actions">
            <div className="form-actions-primary-group">
              <Button variant="secondary" onClick={() => setIssuing(null)} disabled={busy}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleIssue}
                loading={busy}
                disabled={!signature}
              >
                Issue licence
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
}

export default TrafficApplicationProcessing;