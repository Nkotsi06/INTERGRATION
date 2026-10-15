import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import {
  getMyCertificates,
  downloadCertificate,
} from '../../api/certificateApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';
import { typeLabel, statusLabel, CERTIFICATE_STATUS } from '../../utils/certificateLabels';

function MyCertificates() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const { error: showError } = useNotification();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyCertificates();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not load your certificates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDownload = async (row) => {
    setDownloadingId(row.id);
    try {
      const blob = await downloadCertificate(row.certificate_type, row.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${row.certificate_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showError('Could not download this certificate.');
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    { key: 'certificate_number', label: 'Certificate number' },
    {
      key: 'certificate_type',
      label: 'Type',
      render: (r) => typeLabel(r.certificate_type),
    },
    {
      key: 'created_at',
      label: 'Applied on',
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
      label: '',
      render: (r) =>
        r.status === 'ISSUED' ? (
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={() => handleDownload(r)}
            disabled={downloadingId === r.id}
          >
            {downloadingId === r.id ? 'Downloading…' : 'Download PDF'}
          </button>
        ) : (
          <span className="text-muted">{statusLabel(r.status)}</span>
        ),
    },
  ];

  return (
    <PageWrapper
      title="My Certificates"
      showBack
      backPath="/citizen/dashboard"
    >
      <h1>My certificates</h1>
      <p className="text-muted">
        Certificates you have applied for through Home Affairs.
      </p>

      {loading && <TableSkeleton rows={4} columns={5} />}
      {!loading && error && <Alert type="error" message={error} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState
          title="No certificates yet"
          message="Apply for a birth, death, marriage, or divorce certificate from the Home Affairs dashboard."
        />
      )}
      {!loading && !error && rows.length > 0 && (
        <Table columns={columns} data={rows} />
      )}
    </PageWrapper>
  );
}

export default MyCertificates;