import { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { getApplications, deleteApplication } from '../../api/citizenApi';
import {
  getTrafficApplicationByRef,
  submitTrafficInformationResponse,
} from '../../api/trafficApi';
import { formatDate } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';

const STATUS_VARIANT = {
  SUBMITTED: 'pending',
  UNDER_REVIEW: 'inReview',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'approved',
  DRAFT: 'draft',
  READY_FOR_COLLECTION: 'approved',
  COLLECTED: 'completed',
  IN_PRODUCTION: 'inReview',
  INFO_REQUESTED: 'pending',
};

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [trafficRequest, setTrafficRequest] = useState(null);
  const [trafficResponse, setTrafficResponse] = useState('');
  const [loadingTrafficRequest, setLoadingTrafficRequest] = useState(false);
  const [submittingTrafficResponse, setSubmittingTrafficResponse] = useState(false);
  const [filterValues, setFilterValues] = useState({ status: '', service: '' });
  const { success, error: showError } = useNotification();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteApplication(deleteTarget.id);
      const deletedId = deleteTarget.id;
      setApplications((apps) => apps.filter((a) => a.id !== deletedId));
      success('Application deleted successfully.');
      setDeleteTarget(null);
    } catch (err) {
      showError(err.message || 'Could not delete application.');
    } finally {
      setDeleting(false);
    }
  };

  const openTrafficRequest = async (application) => {
    setLoadingTrafficRequest(true);
    try {
      const details = await getTrafficApplicationByRef(application.reference_number);
      setTrafficRequest(details);
      setTrafficResponse('');
    } catch (err) {
      showError(err.message || 'Could not load the application information request.');
    } finally {
      setLoadingTrafficRequest(false);
    }
  };

  const submitTrafficResponse = async (event) => {
    event.preventDefault();
    if (!trafficRequest) return;
    setSubmittingTrafficResponse(true);
    try {
      await submitTrafficInformationResponse(
        trafficRequest.reference_number,
        trafficResponse
      );
      success('Your response has been sent to Traffic staff.');
      setTrafficRequest(null);
      setTrafficResponse('');
      await load();
    } catch (err) {
      showError(err.message || 'Could not submit your response.');
    } finally {
      setSubmittingTrafficResponse(false);
    }
  };

  const filtered = useMemo(() => {
    if (!applications) return [];
    return applications.filter((app) => {
      if (filterValues.status && app.status !== filterValues.status) return false;
      if (filterValues.service && app.service !== filterValues.service) return false;
      return true;
    });
  }, [applications, filterValues]);

  const columns = [
    { key: 'reference_number', label: 'Reference', render: (r) => r.reference_number || r.referenceNumber || '—' },
    { key: 'service', label: 'Ministry' },
    {
      key: 'serviceName',
      label: 'Service',
      render: (r) => r.data?.serviceName || r.sub_type || r.service || '—',
    },
    {
      key: 'dateSubmitted',
      label: 'Submitted',
      render: (r) => formatDate(r.submitted_at || r.submittedAt),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge
          variant={STATUS_VARIANT[row.status] || 'pending'}
          label={row.status ? row.status.replace(/_/g, ' ') : 'Pending'}
        />
      ),
    },
    {
      key: 'collection',
      label: 'Collection Branch',
      render: (r) => r.data?.formData?.branchName || '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {row.service === 'TRAFFIC' && row.status === 'INFO_REQUESTED' && (
          <Button
            variant="primary"
            size="small"
            onClick={() => openTrafficRequest(row)}
            loading={loadingTrafficRequest}
          >
            View request
          </Button>
        )}
        <Button
          variant="danger"
          size="small"
          onClick={() => setDeleteTarget(row)}
        >
          Delete
        </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="My Applications" showBack backPath="/citizen/dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>My Applications</h1>
          <p className="text-muted" style={{ margin: '4px 0 0 0' }}>
            Track and manage all your government service applications.
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={filterValues.status}
              onChange={(e) => setFilterValues((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INFO_REQUESTED">Information Requested</option>
              <option value="APPROVED">Approved</option>
              <option value="READY_FOR_COLLECTION">Ready for Collection</option>
              <option value="COLLECTED">Collected</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <label className="filter-label">Ministry</label>
            <select
              className="filter-select"
              value={filterValues.service}
              onChange={(e) => setFilterValues((prev) => ({ ...prev, service: e.target.value }))}
            >
              <option value="">All</option>
              <option value="HOME_AFFAIRS">Home Affairs</option>
              <option value="PASSPORT">Passport</option>
              <option value="TRAFFIC">Traffic</option>
              <option value="FINANCE">Finance</option>
              <option value="POLICE">Police</option>
            </select>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {loading && <TableSkeleton rows={5} columns={7} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No applications found"
          message="You have not applied for any services yet or no applications match your filters."
        />
      )}

      {!loading && filtered.length > 0 && (
        <Table columns={columns} data={filtered} />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Application?"
        message={`Are you sure you want to delete application ${deleteTarget?.reference_number || deleteTarget?.referenceNumber || ''}? This will permanently remove it and all uploaded documents.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
      {trafficRequest && (
        <Modal
          isOpen
          onClose={() => !submittingTrafficResponse && setTrafficRequest(null)}
          title={`Information requested: ${trafficRequest.reference_number}`}
          size="medium"
        >
          <div className="form-section">
            <h3 className="form-section-title">
              {trafficRequest.data?.serviceName || trafficRequest.sub_type || 'Traffic application'}
            </h3>
            {(trafficRequest.history || [])
              .filter((entry) => entry.notes?.startsWith('Information requested:') ||
                entry.notes?.startsWith('Citizen information response:'))
              .map((entry) => (
                <p key={entry.id}>
                  <strong>{entry.notes.startsWith('Information requested:')
                    ? 'Traffic staff requested'
                    : 'Your response'}:</strong>{' '}
                  {entry.notes.replace(/^(Information requested:|Citizen information response:)\s*/, '')}
                  <br />
                  <small>{formatDate(entry.changed_at)}</small>
                </p>
              ))}
          </div>
          {trafficRequest.status === 'INFO_REQUESTED' ? (
            <form onSubmit={submitTrafficResponse}>
              <label htmlFor="traffic-information-response">Your response</label>
              <textarea
                id="traffic-information-response"
                value={trafficResponse}
                onChange={(event) => setTrafficResponse(event.target.value)}
                maxLength={4000}
                rows={5}
                required
                style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
              />
              <div className="form-actions">
                <Button variant="secondary" type="button" onClick={() => setTrafficRequest(null)} disabled={submittingTrafficResponse}>
                  Close
                </Button>
                <Button variant="primary" type="submit" loading={submittingTrafficResponse}>
                  Submit response
                </Button>
              </div>
            </form>
          ) : (
            <Button variant="secondary" onClick={() => setTrafficRequest(null)}>Close</Button>
          )}
        </Modal>
      )}
    </PageWrapper>
  );
}

export default MyApplications;
