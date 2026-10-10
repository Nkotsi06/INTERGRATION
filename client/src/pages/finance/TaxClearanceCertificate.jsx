import { QRCodeSVG } from 'qrcode.react';
import { FiDownload } from 'react-icons/fi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useFetch from '../../hooks/useFetch';
import { getTaxClearance } from '../../api/financeApi';

function TaxClearanceCertificate() {
  const { data: cert, loading } = useFetch(getTaxClearance, []);

  return (
    <PageWrapper
      title="Tax Clearance Certificate"
      showBack
      backPath="/finance/tax/profile"
      accentColour="#117864"
    >
      <h1>Tax clearance certificate</h1>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : !cert ? (
        <p className="text-muted">
          No certificate available yet. Clear any outstanding balance first.
        </p>
      ) : (
        <div className="card card-flat">
          <StatusBadge variant="verified" label="Valid" />

          <div className="form-grid" style={{ marginTop: 16 }}>
            <ReadOnly label="Certificate ID" value={cert.certificateId} />
            <ReadOnly label="TIN" value={cert.tin} />
            <ReadOnly label="Legal name" value={cert.legalName} />
            <ReadOnly label="Trading name" value={cert.tradingName} />
            <ReadOnly label="Nature of business" value={cert.natureOfBusiness} />
            <ReadOnly label="Date issued" value={cert.dateIssued} />
            <ReadOnly label="Valid until" value={cert.validUntil} />
            <ReadOnly label="Address" value={cert.address} full />
          </div>

          {cert.verificationUrl && (
            <div style={{ marginTop: 16 }}>
              <QRCodeSVG value={cert.verificationUrl} size={120} />
              <p className="text-muted" style={{ marginTop: 8 }}>
                Scan to verify this certificate online.
              </p>
            </div>
          )}

          <div className="form-actions">
            <div className="form-actions-primary-group">
              <Button variant="secondary" onClick={() => window.print()}>
                Print
              </Button>
              <Button variant="primary">
                <FiDownload /> Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

function ReadOnly({ label, value, full = false }) {
  return (
    <div
      className="form-field"
      style={full ? { gridColumn: '1 / -1' } : undefined}
    >
      <label className="form-label">{label}</label>
      <div className="form-input form-input-readonly">{value || '—'}</div>
    </div>
  );
}

export default TaxClearanceCertificate;