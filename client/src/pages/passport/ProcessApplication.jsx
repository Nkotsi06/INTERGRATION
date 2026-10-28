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
  const { data, loading, error, refetch } = useFetch(getStaffApplications, [], {
    pollInterval: 30000,
  });
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

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingApplication, setReviewingApplication] = useState(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (dateFilter && a.dateSubmitted < dateFilter) return false;
      return true;
    });
  }, [data, statusFilter, dateFilter]);

  const hasActive = !!(statusFilter || dateFilter);

  const handle = async (id, action, details = {}) => {
    setActiveRequestId(id);
    try {
      await processApplication(id, { action, ...details });
      success(`Application ${action.toLowerCase()}`);
      await refetch();
      setReviewModalOpen(false);
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

  const openReviewModal = (application) => {
    setReviewingApplication(application);
    setReviewModalOpen(true);
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
    { key: 'collectionBranch', label: 'Collection branch' },
    { key: 'dateSubmitted', label: 'Submitted', render: (r) => formatDate(r.dateSubmitted) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge variant={STATUS_VARIANT[r.status] || 'pending'} label={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['SUBMITTED', 'UNDER_REVIEW'].includes(r.status) && (
            <Button variant="primary" size="small" onClick={() => openReviewModal(r)}>
              Review
            </Button>
          )}
          {r.status === 'APPROVED' && (
            <Button variant="success" size="small" disabled={activeRequestId === r.id} onClick={() => handleMarkReady(r)}>
              Mark Ready
            </Button>
          )}
          {r.status === 'READY_FOR_COLLECTION' && (
            <Button variant="primary" size="small" onClick={() => { setCollectionError(null); setSelectedApplication(r); }}>
              Record Collection
            </Button>
          )}
        </div>
      ),
    },
  ];
  
  const isMinorApplication = reviewingApplication?.data?.serviceCode === 'PASSPORT_MINOR';

  return (
    <PageWrapper title="Process Passport Application" showBack backPath="/passport/staff" accentColour="#17A2B8">
      <h1>Process passport application</h1>
      <p className="text-muted">Only citizens verified by Home Affairs appear here.</p>
      
      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
            <input type="date" className="filter-date-input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
        </div>
        {hasActive && (<button type="button" className="clear-filters" onClick={() => { setStatusFilter(''); setDateFilter(''); }}>Clear filters</button>)}
      </div>

      {loading && <TableSkeleton rows={6} columns={6} />}
      {!loading && error && <Alert type="error" message={error} />}
      {!loading && !error && filtered.length === 0 && <EmptyState title="No applications match" message="Change the filters to see more." />}
      {!loading && !error && filtered.length > 0 && <Table columns={columns} data={filtered} />}

      {/* Review Modal */}
      {reviewModalOpen && reviewingApplication && (
        <Modal isOpen onClose={() => setReviewModalOpen(false)} title={`Review Application: ${reviewingApplication.referenceNumber}`} size="large">
          <h4>Applicant Details</h4>
          <div className="form-grid">
            <ReadOnly label="Name" value={reviewingApplication.citizenName} />
            <ReadOnly label="National ID" value={reviewingApplication.nationalId} />
            <ReadOnly label="Service Type" value={reviewingApplication.data?.serviceName || 'Passport'} />
          </div>
          
          {isMinorApplication && (
            <>
              <hr/>
              <h4>Minor's Details</h4>
              <div className="form-grid">
                <ReadOnly label="Child's Name" value={reviewingApplication.data.formData.childFullName} />
                <ReadOnly label="Child's DOB" value={formatDate(reviewingApplication.data.formData.childDateOfBirth)} />
                <ReadOnly label="Guardian's Name" value={reviewingApplication.data.formData.guardianFullName} />
                <ReadOnly label="Guardian's National ID" value={reviewingApplication.data.formData.guardianNationalId} />
              </div>
              <h4>Passport Photograph</h4>
              {reviewingApplication.data.formData.childPhoto ? (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <img src={reviewingApplication.data.formData.childPhoto} alt="Minor's Passport Photograph" style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
              ) : (
                <Alert type="warning" message="No photograph was submitted with this application." />
              )}
            </>
          )}

          <hr/>
          <h4>Processing Actions</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="success" disabled={activeRequestId === reviewingApplication.id} onClick={() => handle(reviewingApplication.id, 'APPROVE')}>
              Approve Application
            </Button>
            <Button variant="secondary" disabled={activeRequestId === reviewingApplication.id} onClick={() => handle(reviewingApplication.id, 'REQUEST_INFO', { details: 'Please replace the passport photograph with a new one.' })}>
              Request Photo Replacement
            </Button>
            <Button variant="danger" disabled={activeRequestId === reviewingApplication.id} onClick={() => handle(reviewingApplication.id, 'REJECT', { reason: 'Application rejected by Passport staff.' })}>
              Reject Application
            </Button>
          </div>
        </Modal>
      )}

      {/* Collection Modal */}
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

function ReadOnly({ label, value }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div className="form-input form-input-readonly">{value || '—'}</div>
    </div>
  );
}

export default ProcessApplication;