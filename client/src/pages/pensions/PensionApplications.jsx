import { useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import useFetch from '../../hooks/useFetch';
import {
  getStaffPensionApplications,
  processPensionApplication,
} from '../../api/pensionsApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

function PensionApplications() {
  const { data, loading, error: loadError, refetch } = useFetch(getStaffPensionApplications, []);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState('APPROVE');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const { success, error: showError } = useNotification();
  const rows = data?.rows || [];

  const openAction = (application, selectedAction) => {
    setSelected(application);
    setAction(selectedAction);
    setReason('');
  };

  const closeAction = () => {
    if (busy) return;
    setSelected(null);
  };

  const submitAction = async () => {
    if (!selected) return;
    if (action === 'REJECT' && !reason.trim()) {
      showError('A reason is required when rejecting an application.');
      return;
    }

    setBusy(true);
    try {
      await processPensionApplication(selected.id, {
        action,
        reason: reason.trim(),
      });
      success(action === 'APPROVE' ? 'Pension application approved' : 'Pension application rejected');
      setSelected(null);
      refetch();
    } catch (error) {
      showError(error.message || 'Could not process this pension application.');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'reference_number', label: 'Reference' },
    {
      key: 'citizen',
      label: 'Citizen',
      render: (row) => [row.first_name, row.last_name].filter(Boolean).join(' ') || '—',
    },
    { key: 'national_id', label: 'National ID' },
    {
      key: 'pensionType',
      label: 'Pension type',
      render: (row) => row.data?.formData?.pensionType || '—',
    },
    {
      key: 'submitted_at',
      label: 'Submitted',
      render: (row) => row.submitted_at ? formatDate(row.submitted_at) : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge variant="captured" label={row.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button
            variant="success"
            size="small"
            onClick={() => openAction(row, 'APPROVE')}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => openAction(row, 'REJECT')}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Pension Applications"
      showBack
      backPath="/pensions/staff"
      accentColour="#7D3C98"
    >
      <h1>Pension applications</h1>
      <p className="text-muted">
        Review application details and the live eligibility checks before deciding.
        Amounts are taken from the configured pension rules.
      </p>

      {loadError && <Alert type="error" message={loadError} />}
      {loading && <TableSkeleton rows={6} columns={6} />}
      {!loading && rows.length === 0 && (
        <EmptyState
          title="No pension applications"
          message="Submitted pension applications will appear here."
        />
      )}
      {!loading && rows.length > 0 && <Table columns={columns} data={rows} />}

      {selected && (
        <Modal
          isOpen
          onClose={closeAction}
          title={action === 'APPROVE' ? 'Approve pension application' : 'Reject pension application'}
          size="medium"
        >
          <p>
            <strong>Reference:</strong> {selected.reference_number}
          </p>
          <p>
            <strong>Applicant:</strong>{' '}
            {[selected.first_name, selected.last_name].filter(Boolean).join(' ')}
          </p>
          <p>
            <strong>Requested pension:</strong>{' '}
            {selected.data?.formData?.pensionType || 'Not specified'}
          </p>
          {action === 'APPROVE' ? (
            <Alert
              type="info"
              message="The system will assign a unique pension number automatically when this application is approved."
            />
          ) : (
            <div className="form-field">
              <label className="form-label" htmlFor="pension-rejection-reason">
                Rejection reason <span className="required-mark">*</span>
              </label>
              <textarea
                id="pension-rejection-reason"
                className="form-input"
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          )}
          <Alert
            type="info"
            message="Approval rechecks Finance employment and debt records and the one-pension rule. The configured monthly amount must be positive."
          />
          <div className="form-actions">
            <div className="form-actions-primary-group">
              <Button variant="secondary" onClick={closeAction} disabled={busy}>
                Cancel
              </Button>
              <Button
                variant={action === 'APPROVE' ? 'success' : 'danger'}
                onClick={submitAction}
                loading={busy}
              >
                {action === 'APPROVE' ? 'Approve application' : 'Reject application'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
}

export default PensionApplications;
