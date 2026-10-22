import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import { getStaffCriminalRecords, processCriminalRecord } from '../../api/policeApi';
import apiClient from '../../api/apiClient';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = {
  PENDING: 'pending',
  ISSUED: 'approved',
  REJECTED: 'rejected',
};

function CriminalRecordView() {
  const { data, loading, error, refetch } = useFetch(getStaffCriminalRecords, [], {
    pollInterval: 30000,
  });
  const [actionError, setActionError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Biometrics modal state
  const [biometricsModalOpen, setBiometricsModalOpen] = useState(false);
  const [biometricsLoading, setBiometricsLoading] = useState(false);
  const [biometricsError, setBiometricsError] = useState(null);
  const [selectedBiometrics, setSelectedBiometrics] = useState(null);
  const [targetCitizen, setTargetCitizen] = useState(null);

  const handleAction = async (row, action) => {
    setActionError(null);
    setProcessingId(row.id);
    try {
      await processCriminalRecord(row.id, { action });
      await refetch();
    } catch (err) {
      setActionError(err.message || 'Could not update the criminal record request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerifyBiometrics = async (row) => {
    const citizenId = row.citizen_id || row.citizenId;
    setTargetCitizen(row);
    setBiometricsError(null);
    setSelectedBiometrics(null);
    setBiometricsModalOpen(true);
    setBiometricsLoading(true);

    try {
      const res = await apiClient.get(`/biometrics/${citizenId}`);
      setSelectedBiometrics(res.data || res);
    } catch (err) {
      setBiometricsError(
        err.response?.data?.message || err.message || 'No biometric records found for this citizen.'
      );
    } finally {
      setBiometricsLoading(false);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    {
      key: 'citizen_name',
      label: 'Citizen',
      render: (row) => row.citizen_name || row.citizen_id || '—',
    },
    { key: 'purpose', label: 'Purpose', render: (row) => row.purpose || '—' },
    {
      key: 'created_at',
      label: 'Requested',
      render: (row) => formatDate(row.created_at),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge variant={STATUS_VARIANT[row.status] || 'pending'} label={row.status} />
      ),
    },
    {
      key: 'biometrics',
      label: 'Biometrics',
      render: (row) => (
        <Button
          variant="secondary"
          size="small"
          onClick={() => handleVerifyBiometrics(row)}
        >
          Verify Biometrics
        </Button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        row.status === 'PENDING' ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button
              variant="primary"
              size="small"
              disabled={processingId === row.id}
              onClick={() => handleAction(row, 'ISSUE')}
            >
              Issue
            </Button>
            <Button
              variant="danger"
              size="small"
              disabled={processingId === row.id}
              onClick={() => handleAction(row, 'REJECT')}
            >
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-muted">Processed</span>
        ),
    },
  ];

  return (
    <PageWrapper title="Manage Criminal Records" showBack backPath="/police/staff" accentColour="#922B21">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Manage Criminal Record Requests</h1>
          <p className="text-muted" style={{ margin: '4px 0 0 0' }}>
            Review citizen requests, verify biometric data against the registry, and issue records.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {actionError && <Alert type="error" message={actionError} />}

      {loading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : error ? null : !data || data.length === 0 ? (
        <EmptyState title="No criminal record requests" message="New requests will appear here." />
      ) : (
        <Table columns={columns} data={data} />
      )}

      {/* Biometrics Verification Modal */}
      {biometricsModalOpen && (
        <Modal
          isOpen={biometricsModalOpen}
          onClose={() => setBiometricsModalOpen(false)}
          title={`Biometric Verification — ${targetCitizen?.citizen_name || targetCitizen?.citizen_id || 'Citizen'}`}
          size="large"
        >
          {biometricsLoading && <p className="text-muted">Fetching biometric records from national database…</p>}

          {biometricsError && (
            <Alert
              type="error"
              message={biometricsError}
            />
          )}

          {!biometricsLoading && !biometricsError && selectedBiometrics && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, marginTop: 12 }}>
              {/* Facial photo display */}
              <div style={{ textAlign: 'center', borderRight: '1px solid #E2E8F0', paddingRight: 16 }}>
                <h4 style={{ marginBottom: 12 }}>Facial Image</h4>
                {selectedBiometrics.facialImage ? (
                  <img
                    src={selectedBiometrics.facialImage}
                    alt="Citizen Facial Capture"
                    style={{
                      width: '100%',
                      maxHeight: 240,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: 180,
                      backgroundColor: '#F1F5F9',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748B',
                    }}
                  >
                    No facial photo enrolled
                  </div>
                )}
                {selectedBiometrics.enrolledAt && (
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 8 }}>
                    Enrolled: {formatDate(selectedBiometrics.enrolledAt)}
                  </p>
                )}
              </div>

              {/* Fingerprints display */}
              <div>
                <h4 style={{ marginBottom: 12 }}>Captured Fingerprints</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {['Left Thumb', 'Left Index', 'Right Thumb', 'Right Index'].map((finger) => {
                    const print = selectedBiometrics.fingerprints?.[finger];
                    const isCaptured = !!print;
                    const isBase64Img = typeof print === 'string' && print.startsWith('data:image');

                    return (
                      <div
                        key={finger}
                        style={{
                          border: '1px solid #E2E8F0',
                          borderRadius: 6,
                          padding: 10,
                          backgroundColor: isCaptured ? '#F8FAFC' : '#F1F5F9',
                          textAlign: 'center',
                        }}
                      >
                        <strong style={{ fontSize: '0.875rem', display: 'block', marginBottom: 6 }}>
                          {finger}
                        </strong>
                        {isBase64Img ? (
                          <img
                            src={print}
                            alt={finger}
                            style={{ height: 60, objectFit: 'contain', margin: '0 auto 6px auto' }}
                          />
                        ) : (
                          <div
                            style={{
                              height: 60,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              color: isCaptured ? '#059669' : '#94A3B8',
                              fontWeight: isCaptured ? '600' : 'normal',
                            }}
                          >
                            {isCaptured ? '✓ Print Captured (Text/Base64)' : 'Not Captured'}
                          </div>
                        )}
                        <StatusBadge
                          variant={isCaptured ? 'approved' : 'rejected'}
                          label={isCaptured ? 'Verified' : 'Missing'}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <Button variant="secondary" onClick={() => setBiometricsModalOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
}

export default CriminalRecordView;

