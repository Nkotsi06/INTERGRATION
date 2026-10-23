import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { listPayments, recordOfflinePayment } from '../../api/paymentApi';
import { listFees } from '../../api/feeScheduleApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useSettings } from '../../context/SettingsContext';

const PAGE_SIZE = 25;

function PaymentsReceived() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    ministry: searchParams.get('ministry') || '',
    service: '',
    status: '',
    from: '',
    to: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [offlineSaving, setOfflineSaving] = useState(false);
  const [activeFees, setActiveFees] = useState([]);
  const [offlineForm, setOfflineForm] = useState({
    feeId: '',
    nationalId: '',
    applicationReference: '',
    method: 'CASH',
    mobile: '',
  });
  const [offlineReceipt, setOfflineReceipt] = useState(null);
  const { settings } = useSettings();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listPayments({
        ...filters,
        page,
        pageSize: PAGE_SIZE,
      });
      setData({
        rows: result?.rows || [],
        total: result?.total || 0,
        totalAmount: result?.totalAmount || 0,
      });
    } catch (err) {
      setError(err.message || 'Could not load payments.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep the URL in sync so links like /finance/payments?ministry=TRAFFIC work.
  useEffect(() => {
    const next = new URLSearchParams();
    if (filters.ministry) next.set('ministry', filters.ministry);
    setSearchParams(next, { replace: true });
  }, [filters.ministry, setSearchParams]);

  const update = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const openOfflinePayment = async () => {
    setError(null);
    setOfflineReceipt(null);
    try {
      const fees = await listFees({ is_active: true });
      setActiveFees(Array.isArray(fees) ? fees : []);
      setOfflineForm({ feeId: '', nationalId: '', applicationReference: '', method: 'CASH', mobile: '' });
      setOfflineOpen(true);
    } catch (err) {
      setError(err.message || 'Could not load active fees.');
    }
  };

  const saveOfflinePayment = async () => {
    const fee = activeFees.find((item) => item.id === offlineForm.feeId);
    if (!fee) {
      setError('Select an active service fee.');
      return;
    }
    setOfflineSaving(true);
    setError(null);
    try {
      const payment = await recordOfflinePayment({
        ministry: fee.ministry,
        serviceCode: fee.service_code,
        nationalId: offlineForm.nationalId,
        applicationReference: offlineForm.applicationReference,
        method: offlineForm.method,
        mobile: offlineForm.mobile,
      });
      setOfflineOpen(false);
      setOfflineReceipt(payment);
      await load();
    } catch (err) {
      setError(err.message || 'Could not record offline payment.');
    } finally {
      setOfflineSaving(false);
    }
  };

  const hasActive = Object.values(filters).some(Boolean);

  const exportCsv = async () => {
    setExporting(true);
    setError(null);
    try {
      const rows = [];
      let exportPage = 1;
      let total = 0;
      do {
        const result = await listPayments({ ...filters, page: exportPage, pageSize: 200 });
        rows.push(...(result?.rows || []));
        total = result?.total || 0;
        exportPage += 1;
      } while (rows.length < total);
      const columnsToExport = [
        ['Payment ID', 'id'],
        ['Receipt', 'receipt_number'],
        ['Date', 'paid_at'],
        ['Created', 'created_at'],
        ['Ministry', 'ministry'],
        ['Service', 'service'],
        ['Application reference', 'application_reference'],
        ['Gateway/reference', 'reference_number'],
        ['Citizen ID', 'citizen_id'],
        ['Citizen', 'citizen'],
        ['National ID', 'national_id'],
        ['Amount', 'amount'],
        ['Method', 'method'],
        ['Status', 'status'],
        ['Received by', 'received_by'],
        ['Notes', 'notes'],
      ];
      const csvValue = (value) => {
        let text = value === null || value === undefined ? '' : String(value);
        if (/^[=+\-@]/.test(text)) text = `'${text}`;
        return `"${text.replace(/"/g, '""')}"`;
      };
      const csv = [
        columnsToExport.map(([label]) => csvValue(label)).join(','),
        ...rows.map((row) => columnsToExport.map(([, key]) => {
          if (key === 'citizen') return csvValue(`${row.first_name || ''} ${row.last_name || ''}`.trim());
          return csvValue(row[key]);
        }).join(',')),
      ].join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'finance-payments.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Could not export payments.');
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    { key: 'id', label: 'Payment ID' },
    { key: 'receipt_number', label: 'Receipt' },
    { key: 'paid_at', label: 'Date', render: (r) => formatDate(r.paid_at) },
    { key: 'created_at', label: 'Created', render: (r) => formatDate(r.created_at) },
    { key: 'ministry', label: 'Ministry' },
    { key: 'service', label: 'Service', render: (r) => r.service || '—' },
    { key: 'application_reference', label: 'Application reference', render: (r) => r.application_reference || '—' },
    { key: 'reference_number', label: 'Gateway/reference', render: (r) => r.reference_number || '—' },
    { key: 'citizen_id', label: 'Citizen ID', render: (r) => r.citizen_id || '—' },
    {
      key: 'citizen',
      label: 'Citizen',
      render: (r) =>
        r.first_name || r.last_name
          ? `${r.first_name || ''} ${r.last_name || ''}`.trim()
          : '—',
    },
    { key: 'national_id', label: 'National ID', render: (r) => r.national_id || '—' },
    {
      key: 'amount',
      label: 'Amount',
      render: (r) => formatCurrency(r.amount),
    },
    { key: 'method', label: 'Method' },
    { key: 'status', label: 'Status' },
    { key: 'received_by', label: 'Received by', render: (r) => r.received_by || '—' },
    { key: 'notes', label: 'Notes', render: (r) => r.notes || '—' },
  ];

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const startRow = (page - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(page * PAGE_SIZE, data.total);

  return (
    <PageWrapper
      title="Payments received"
      showBack
      backPath="/finance/dashboard"
      accentColour="#117864"
    >
      <h1>Payments received</h1>
      <p className="text-muted">
        Every payment made through any ministry's service.
      </p>
      {offlineReceipt && (
        <section className="offline-payment-receipt" aria-label="Payment receipt">
          <h2>Payment receipt</h2>
          <dl>
            <dt>Receipt number</dt><dd>{offlineReceipt.receipt_number}</dd>
            <dt>Date</dt><dd>{formatDate(offlineReceipt.paid_at)}</dd>
            <dt>Ministry</dt><dd>{offlineReceipt.ministry}</dd>
            <dt>Service</dt><dd>{offlineReceipt.service || '—'}</dd>
            <dt>Application reference</dt><dd>{offlineReceipt.application_reference || '—'}</dd>
            <dt>Amount</dt><dd>{formatCurrency(offlineReceipt.amount)}</dd>
            <dt>Payment method</dt><dd>{offlineReceipt.method}</dd>
          </dl>
          <Button className="no-print" variant="secondary" onClick={() => window.print()}>Print receipt</Button>
        </section>
      )}
      <div className="quick-actions">
        <Button variant="primary" onClick={openOfflinePayment}>Record offline payment</Button>
      </div>

      <div className="filter-bar">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <label className="filter-label">Ministry</label>
            <select
              className="filter-select"
              value={filters.ministry}
              onChange={(e) => update('ministry', e.target.value)}
            >
              <option value="">All ministries</option>
              {(settings.ministries || []).map((ministry) => (
                <option key={ministry.code} value={ministry.code}>{ministry.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown" style={{ minWidth: 180 }}>
            <label className="filter-label">Service</label>
            <input
              type="text"
              className="filter-input"
              value={filters.service}
              onChange={(e) => update('service', e.target.value)}
              placeholder="Filter by service"
            />
          </div>

          <div className="filter-dropdown">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => update('status', e.target.value)}
            >
              <option value="">All</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="filter-dropdown" style={{ minWidth: 220 }}>
            <label className="filter-label">Search</label>
            <input
              type="text"
              className="filter-input"
              value={filters.search}
              onChange={(e) => update('search', e.target.value)}
              placeholder="Receipt or reference"
            />
          </div>

          <div className="filter-date-range">
            <label className="filter-label">Date range</label>
            <div className="date-range-inputs">
              <input
                type="date"
                className="filter-date-input"
                value={filters.from}
                onChange={(e) => update('from', e.target.value)}
              />
              <span className="date-range-sep">to</span>
              <input
                type="date"
                className="filter-date-input"
                value={filters.to}
                onChange={(e) => update('to', e.target.value)}
              />
            </div>
          </div>
        </div>

        {hasActive && (
          <button
            type="button"
            className="clear-filters"
            onClick={() =>
              setFilters({
                ministry: '',
                service: '',
                status: '',
                from: '',
                to: '',
                search: '',
              })
            }
          >
            Clear filters
          </button>
        )}
      </div>

      {loading && <TableSkeleton rows={8} columns={9} />}
      {!loading && error && <Alert type="error" message={error} />}

      {!loading && !error && data.rows.length === 0 && (
        <div className="table-empty">No payments match these filters.</div>
      )}

      {!loading && !error && data.rows.length > 0 && (
        <>
          <div className="quick-actions">
            <span className="text-muted">{data.total} payments · total {formatCurrency(data.totalAmount)}</span>
            <Button variant="secondary" disabled={exporting} onClick={exportCsv}>
              {exporting ? 'Preparing CSV…' : 'Export CSV'}
            </Button>
          </div>
          <Table columns={columns} data={data.rows} />
          <div className="pagination">
            <span className="pagination-summary">
              Showing {startRow} to {endRow} of {data.total}
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
      {offlineOpen && (
        <Modal isOpen onClose={() => setOfflineOpen(false)} title="Record offline payment" size="medium">
          <Select
            label="Service fee"
            value={offlineForm.feeId}
            onChange={(event) => setOfflineForm({ ...offlineForm, feeId: event.target.value })}
            required
            options={activeFees.map((fee) => ({
              value: fee.id,
              label: `${fee.ministry} · ${fee.service_name} · ${formatCurrency(fee.amount)}`,
            }))}
          />
          <Input label="Citizen National ID" value={offlineForm.nationalId} onChange={(event) => setOfflineForm({ ...offlineForm, nationalId: event.target.value })} required />
          <Input label="Application reference (optional)" value={offlineForm.applicationReference} onChange={(event) => setOfflineForm({ ...offlineForm, applicationReference: event.target.value })} />
          <Select
            label="Payment method"
            value={offlineForm.method}
            onChange={(event) => setOfflineForm({ ...offlineForm, method: event.target.value })}
            options={[
              { value: 'CASH', label: 'Cash' },
              { value: 'MOBILE_MONEY', label: 'Mobile Money' },
            ]}
          />
          {offlineForm.method === 'MOBILE_MONEY' && <Input label="Mobile number" value={offlineForm.mobile} onChange={(event) => setOfflineForm({ ...offlineForm, mobile: event.target.value })} required />}
          <FormActions primaryLabel="Record payment and issue receipt" primaryLoading={offlineSaving} onPrimary={saveOfflinePayment} onSecondary={() => setOfflineOpen(false)} />
        </Modal>
      )}
    </PageWrapper>
  );
}

export default PaymentsReceived;
