import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import {
  listCertificates,
  issueCertificate,
  rejectCertificate,
} from '../../api/certificateApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_STATUS,
  typeLabel,
} from '../../utils/certificateLabels';

const PAGE_SIZE = 25;

function HACertificates() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ type: '', status: '', from: '', to: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pendingIssue, setPendingIssue] = useState(null);
  const [pendingReject, setPendingReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [acting, setActing] = useState(false);
  const { success, error: showError } = useNotification();

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await listCertificates({
        type: filters.type || undefined,
        status: filters.status || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not load certificates.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.status, filters.from, filters.to]);

  useEffect(() => {
    const timer = window.setInterval(() => load(true), 30000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.status, filters.from, filters.to]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const startRow = rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(page * PAGE_SIZE, rows.length);

  const handleIssueConfirm = async () => {
    if (!pendingIssue) return;
    setActing(true);
    try {
      await issueCertificate(pendingIssue.certificate_type, pendingIssue.id);
      success('Certificate issued.');
      setPendingIssue(null);
      load();
    } catch (err) {
      showError(err.message || 'Could not issue this certificate.');
    } finally {
      setActing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!pendingReject) return;
    setActing(true);
    try {
      await rejectCertificate(
        pendingReject.certificate_type,
        pendingReject.id,
        rejectReason
      );
      success('Certificate rejected.');
      setPendingReject(null);
      setRejectReason('');
      load();
    } catch (err) {
      showError(err.message || 'Could not reject this certificate.');
    } finally {
      setActing(false);
    }
  };

  const columns = [
    { key: 'certificate_number', label: 'Certificate' },
    {
      key: 'certificate_type',
      label: 'Type',
      render: (r) => typeLabel(r.certificate_type),
    },
    {
      key: 'applicant',
      label: 'Applicant',
      render: (r) => {
        if (r.certificate_type === 'BIRTH') return r.child_full_name || '—';
        if (r.certificate_type === 'DEATH') return r.deceased_full_name || '—';
        if (r.certificate_type === 'MARRIAGE') return r.spouse1_full_name || '—';
        if (r.certificate_type === 'DIVORCE') return r.spouse1_full_name || '—';
        return '—';
      },
    },
    {
      key: 'created_at',
      label: 'Applied',
      render: (r) => formatDate(r.created_at),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const cfg = CERTIFICATE_STATUS[r.status] || CERTIFICATE_STATUS.PENDING;
        return <StatusBadge variant={cfg.variant} label={cfg.label} />;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) =>
        r.status === 'PENDING' ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() =>
                navigate(
                  `/home-affairs/certificates/${r.certificate_type}/${r.id}/edit`
                )
              }
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-success btn-small"
              onClick={() => setPendingIssue(r)}
            >
              Issue
            </button>
            <button
              type="button"
              className="btn btn-danger btn-small"
              onClick={() => setPendingReject(r)}
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
  ];

  const hasActive = !!(filters.type || filters.status || filters.from || filters.to);

  return (
    <PageWrapper
      title="Certificates"
      showBack
      backPath="/home-affairs/dashboard"
      accentColour="#1A5276"
    >
      <h1>Certificates</h1>
      <p className="text-muted">
        Review, edit, and issue birth, death, marriage, and divorce certificates.
      </p>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Type</label>
            <select
              className="filter-select"
              value={filters.type}
              onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="">All</option>
              {CERTIFICATE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="ISSUED">Issued</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="filter-date-range">
            <label className="filter-label">Date range</label>
            <div className="date-range-inputs">
              <input
                type="date"
                className="filter-date-input"
                value={filters.from}
                onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
              />
              <span className="date-range-sep">to</span>
              <input
                type="date"
                className="filter-date-input"
                value={filters.to}
                onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {hasActive && (
          <button
            type="button"
            className="clear-filters"
            onClick={() => setFilters({ type: '', status: '', from: '', to: '' })}
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && <TableSkeleton rows={6} columns={5} />}
      {!loading && error && <Alert type="error" message={error} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState
          title="No certificates match"
          message="Change the filters to see more."
        />
      )}
      {!loading && !error && rows.length > 0 && (
        <>
          <Table columns={columns} data={pagedRows} />
          <div className="pagination">
            <span className="pagination-summary">
              Showing {startRow} to {endRow} of {rows.length}
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="btn btn-secondary btn-small"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={!!pendingIssue}
        onClose={() => setPendingIssue(null)}
        onConfirm={handleIssueConfirm}
        title="Issue this certificate?"
        message={
          pendingIssue
            ? `${typeLabel(pendingIssue.certificate_type)} for ${
                pendingIssue.child_full_name ||
                pendingIssue.deceased_full_name ||
                pendingIssue.spouse1_full_name ||
                'applicant'
              } will be issued.`
            : ''
        }
        confirmLabel="Issue"
        variant="primary"
        loading={acting}
      />

      {pendingReject && (
        <Modal
          isOpen
          onClose={() => setPendingReject(null)}
          title="Reject certificate"
          size="medium"
        >
          <p className="text-muted">
            Please provide a reason. The citizen will see this message.
          </p>
          <Input
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
          />
          <FormActions
            primaryLabel="Reject certificate"
            primaryVariant="danger"
            primaryLoading={acting}
            primaryDisabled={!rejectReason.trim()}
            onPrimary={handleRejectConfirm}
            onSecondary={() => {
              setPendingReject(null);
              setRejectReason('');
            }}
          />
        </Modal>
      )}
    </PageWrapper>
  );
}

export default HACertificates;