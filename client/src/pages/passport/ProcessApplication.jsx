import { useState, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Checkbox from '../../components/common/Checkbox';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import SignaturePad from '../../components/signature/SignaturePad';
import useFetch from '../../hooks/useFetch';
import {
  getStaffApplications,
  processApplication,
  markReadyForCollection,
  recordCollection,
} from '../../api/passportApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  SUBMITTED: 'captured',
  UNDER_REVIEW: 'captured',
  APPROVED: 'verified',
  READY_FOR_COLLECTION: 'captured',
  COLLECTED: 'verified',
  REJECTED: 'rejected',
};

function ProcessApplication() {
  const { data, loading, error, refetch } = useFetch(getStaffApplications, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [collectedByName, setCollectedByName] = useState('');
  const [idChecked, setIdChecked] = useState(false);
  const [signature, setSignature] = useState(null);
  const [collectionError, setCollectionError] = useState(null);
  const [collecting, setCollecting] = useState(false);
  const { success, error: showError } = useNotification();

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (dateFilter && a.dateSubmitted < dateFilter) return false;
      return true;
    });
  }, [data, statusFilter, dateFilter]);

  const hasActive = !!(statusFilter || dateFilter);

  const handle = async (id, action) => {
    setActiveRequestId(id);
    try {
      await processApplication(id, { action });
      success(`Application ${action.toLowerCase()}`);
      await refetch();
    } catch (err) {
      showError(err.message || 'Could not process this application.');
    } finally {
      setActiveRequestId(null);
    }
  };

  const handleMarkReady = async (application) => {
    setActiveRequestId(application.id);
    try {
      await markReadyForCollection(application.id);
      success('Passport marked ready for collection');
      await refetch();
    } catch (err) {
      showError(err.message || 'Could not mark this passport ready for collection.');
    } finally {
      setActiveRequestId(null);
    }
  };

  const closeCollectionModal = () => {
    if (collecting) return;
    setSelectedApplication(null);
    setCollectedByName('');
    setIdChecked(false);
    setSignature(null);
    setCollectionError(null);
  };

  const handleRecordCollection = async (event) => {
    event.preventDefault();
    setCollectionError(null);
    if (!collectedByName.trim()) {
      setCollectionError('Enter the name of the person collecting the passport.');
      return;
    }
    if (!idChecked) {
      setCollectionError('Confirm that the citizen’s ID has been verified.');
      return;
    }
    if (!signature) {
      setCollectionError('Capture and save the citizen’s signature.');
      return;
    }

    setCollecting(true);
    try {
      await recordCollection(selectedApplication.id, {
        signature,
        collectedByName: collectedByName.trim(),
        idChecked,
      });
      success('Passport collection recorded');
      setSelectedApplication(null);
      setCollectedByName('');
      setIdChecked(false);
      setSignature(null);
      await refetch();
    } catch (err) {
      setCollectionError(err.message || 'Could not record passport collection.');
    } finally {
      setCollecting(false);
    }
  };

  const columns = [
    { key: 'referenceNumber', label: 'Reference' },
    { key: 'citizenName', label: 'Citizen' },
    { key: 'nationalId', label: 'National ID' },
    { key: 'dateSubmitted', label: 'Submitted', render: (r) => formatDate(r.dateSubmitted) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['SUBMITTED', 'UNDER_REVIEW'].includes(r.status) && (
            <>
              <Button
                variant="success"
                size="small"
                disabled={activeRequestId === r.id}
                onClick={() => handle(r.id, 'APPROVE')}
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                size="small"
                disabled={activeRequestId === r.id}
                onClick={() => handle(r.id, 'REQUEST_INFO')}
              >
                Request info
              </Button>
              <Button
                variant="danger"
                size="small"
                disabled={activeRequestId === r.id}
                onClick={() => handle(r.id, 'REJECT')}
              >
                Reject
              </Button>
            </>
          )}
          {r.status === 'APPROVED' && (
            <Button
              variant="success"
              size="small"
              disabled={activeRequestId === r.id}
              onClick={() => handleMarkReady(r)}
            >
              Mark Ready for Collection
            </Button>
          )}
          {r.status === 'READY_FOR_COLLECTION' && (
            <Button
              variant="primary"
              size="small"
              onClick={() => {
                setCollectionError(null);
                setSelectedApplication(r);
              }}
            >
              Record Collection
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Process Passport Application"
      showBack
      backPath="/passport/staff"
      accentColour="#17A2B8"
    >
      <h1>Process passport application</h1>
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
              <option value="UNDER_REVIEW">Under review</option>
              <option value="APPROVED">Approved</option>
              <option value="READY_FOR_COLLECTION">Ready for collection</option>
              <option value="COLLECTED">Collected</option>
              <option value="REJECTED">Rejected</option>
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

      {loading && <TableSkeleton rows={6} columns={6} />}
      {!loading && error && <Alert type="error" message={error} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title="No applications match"
          message="Change the filters to see more."
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <Table columns={columns} data={filtered} />
      )}

      <Modal
        isOpen={!!selectedApplication}
        onClose={closeCollectionModal}
        title="Record passport collection"
        size="large"
      >
        {selectedApplication && (
          <form onSubmit={handleRecordCollection}>
            {collectionError && <Alert type="error" message={collectionError} />}
            <p>
              Record the collection of passport{' '}
              <strong>{selectedApplication.passportNumber || 'number pending'}</strong>{' '}
              for {selectedApplication.citizenName}.
            </p>
            <Input
              label="Collected by (Name)"
              value={collectedByName}
              onChange={(event) => setCollectedByName(event.target.value)}
              maxLength={200}
              required
            />
            <Checkbox
              label="I have verified the citizen's ID"
              checked={idChecked}
              onChange={(event) => setIdChecked(event.target.checked)}
            />
            <div className="form-section">
              <h3 className="form-section-title">Citizen signature</h3>
              <SignaturePad
                onSave={setSignature}
                onClear={() => setSignature(null)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Button
                variant="secondary"
                type="button"
                onClick={closeCollectionModal}
                disabled={collecting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={collecting || !signature || !idChecked}
              >
                {collecting ? 'Recording…' : 'Record Collection'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
}

export default ProcessApplication;