import { useCallback, useEffect, useMemo, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { StatsSkeleton } from '../../components/common/SkeletonLoader';
import {
  getCitizenFinanceDashboard,
  getEmploymentProof,
  payApplicationFee,
  submitEmploymentDeclaration,
} from '../../api/financeApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

const EMPTY_DASHBOARD = {
  unpaidApplications: [],
  payments: [],
  debts: [],
  employment: [],
  fees: [],
};

function FinanceDashboard() {
  const [data, setData] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState({
    query: '',
    ministry: '',
    status: '',
  });
  const [paymentTarget, setPaymentTarget] = useState('');
  const [mobile, setMobile] = useState('');
  const [paying, setPaying] = useState(false);
  const [employment, setEmployment] = useState({
    employerName: '',
    positionTitle: '',
    employmentType: 'GOVERNMENT',
    startDate: '',
    endDate: '',
    proof: null,
  });
  const [submittingEmployment, setSubmittingEmployment] = useState(false);
  const [notice, setNotice] = useState(null);
  const [printingPayment, setPrintingPayment] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCitizenFinanceDashboard();
      setData({
        unpaidApplications: result.unpaidApplications || [],
        payments: result.payments || [],
        debts: result.debts || [],
        employment: result.employment || [],
        fees: result.fees || [],
      });
    } catch (err) {
      setError(err.message || 'Could not load Finance services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!printingPayment) return undefined;
    const timer = window.setTimeout(() => window.print(), 0);
    return () => window.clearTimeout(timer);
  }, [printingPayment]);

  const totalDue = useMemo(
    () => data.unpaidApplications.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [data.unpaidApplications]
  );
  const outstandingDebts = useMemo(
    () => data.debts.filter((debt) => debt.status === 'OUTSTANDING'),
    [data.debts]
  );
  const totalDebt = outstandingDebts.reduce((sum, debt) => sum + Number(debt.amount || 0), 0);
  const latestPayment = data.payments[0];
  const lastEmployment = data.employment[0];
  const ministries = [...new Set(data.payments.map((payment) => payment.ministry).filter(Boolean))];
  const filteredPayments = data.payments.filter((payment) => {
    const query = paymentFilter.query.trim().toLowerCase();
    const matchesQuery = !query || [
      payment.receiptNumber,
      payment.referenceNumber,
      payment.applicationReference,
      payment.service,
    ].some((value) => String(value || '').toLowerCase().includes(query));
    return matchesQuery &&
      (!paymentFilter.ministry || payment.ministry === paymentFilter.ministry) &&
      (!paymentFilter.status || payment.status === paymentFilter.status);
  });

  const pay = async () => {
    setPaying(true);
    setError(null);
    setNotice(null);
    try {
      const receipt = await payApplicationFee({
        applicationReference: paymentTarget,
        method: 'MOBILE_MONEY',
        mobile,
      });
      setNotice(`Payment completed. Receipt ${receipt.receiptNumber}.`);
      setPaymentTarget('');
      setMobile('');
      await load();
    } catch (err) {
      setError(err.message || 'Payment could not be completed.');
    } finally {
      setPaying(false);
    }
  };

  const submitEmployment = async () => {
    setSubmittingEmployment(true);
    setError(null);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.append('employerName', employment.employerName);
      formData.append('positionTitle', employment.positionTitle);
      formData.append('employmentType', employment.employmentType);
      formData.append('startDate', employment.startDate);
      if (employment.endDate) formData.append('endDate', employment.endDate);
      if (employment.proof) formData.append('proof', employment.proof);
      await submitEmploymentDeclaration(formData);
      setEmployment({
        employerName: '',
        positionTitle: '',
        employmentType: 'GOVERNMENT',
        startDate: '',
        endDate: '',
        proof: null,
      });
      setNotice('Employment details and proof submitted for review.');
      await load();
    } catch (err) {
      setError(err.message || 'Could not submit your employment details.');
    } finally {
      setSubmittingEmployment(false);
    }
  };

  const downloadProof = async (declaration) => {
    try {
      const blob = await getEmploymentProof(declaration.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = declaration.proofFileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Could not download employment proof.');
    }
  };

  const serviceCards = [
    {
      key: 'pay',
      title: 'Pay for a service',
      detail: data.unpaidApplications.length
        ? `${data.unpaidApplications.length} unpaid application${data.unpaidApplications.length === 1 ? '' : 's'} · ${formatCurrency(totalDue)} due`
        : 'No unpaid service fees',
    },
    {
      key: 'history',
      title: 'Payment history and receipts',
      detail: latestPayment
        ? `Last payment ${formatCurrency(latestPayment.amount)} · ${formatDate(latestPayment.paidAt)}`
        : 'No payments recorded',
    },
    {
      key: 'employment',
      title: 'My employment details',
      detail: lastEmployment
        ? `Latest declaration: ${lastEmployment.status}`
        : 'Declare employment and upload proof',
    },
    {
      key: 'debts',
      title: 'Amounts I owe government',
      detail: `${outstandingDebts.length} outstanding · ${formatCurrency(totalDebt)}`,
    },
    {
      key: 'fees',
      title: 'Service fees',
      detail: `${data.fees.length} current fee${data.fees.length === 1 ? '' : 's'}`,
    },
  ];

  return (
    <PageWrapper title="Finance services" accentColour="#117864">
      <h1>Finance services</h1>
      <p className="text-muted">
        Pay government service fees, view your payment records, and check your declared employment and government debts.
      </p>

      {loading && <StatsSkeleton count={5} />}
      {!loading && error && (
        <>
          <Alert type="error" message={error} />
          <Button variant="secondary" onClick={load}>Retry</Button>
        </>
      )}
      {!loading && notice && <Alert type="success" message={notice} />}

      {!loading && !error && (
        <>
          <div className="services-grid finance-citizen-grid">
            {serviceCards.map((service) => (
              <Card
                key={service.key}
                variant="bordered"
                className="service-card finance-citizen-card"
                onClick={() => setActiveSection(activeSection === service.key ? null : service.key)}
              >
                <div className="service-card-accent" style={{ backgroundColor: '#117864' }} />
                <div className="service-card-body">
                  <span className="service-card-name">{service.title}</span>
                  <span className="text-muted">{service.detail}</span>
                  <span className="finance-card-action">View details</span>
                </div>
              </Card>
            ))}
          </div>

          {activeSection === 'pay' && (
            <section className="dashboard-section finance-detail-section">
              <h2>Unpaid service fees</h2>
              {data.unpaidApplications.length === 0 ? (
                <p className="text-muted">There are no unpaid fees for your applications.</p>
              ) : (
                <>
                  <div className="finance-invoice-list">
                    {data.unpaidApplications.map((invoice) => (
                      <label className="finance-invoice" key={invoice.applicationReference}>
                        <input
                          type="radio"
                          name="finance-invoice"
                          checked={paymentTarget === invoice.applicationReference}
                          onChange={() => setPaymentTarget(invoice.applicationReference)}
                        />
                        <span>
                          <strong>{invoice.serviceName || invoice.serviceCode || invoice.ministry}</strong>
                          <small>{invoice.ministry} · {invoice.applicationReference}</small>
                        </span>
                        <strong>{formatCurrency(invoice.amount, invoice.currency)}</strong>
                      </label>
                    ))}
                  </div>
                  <div className="form-grid finance-pay-form">
                    <Input
                      label="Mobile money number"
                      value={mobile}
                      onChange={(event) => setMobile(event.target.value)}
                      required
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={pay}
                    loading={paying}
                    disabled={!paymentTarget || !mobile.trim()}
                  >
                    Pay selected fee
                  </Button>
                  <p className="text-muted">Payments are simulated mobile-money transactions.</p>
                </>
              )}
            </section>
          )}

          {activeSection === 'history' && (
            <section className="dashboard-section finance-detail-section">
              <h2>Payment history and receipts</h2>
              <div className="filter-bar">
                <div className="filter-controls">
                  <Input
                    label="Search payments"
                    value={paymentFilter.query}
                    onChange={(event) => setPaymentFilter({ ...paymentFilter, query: event.target.value })}
                    placeholder="Receipt or application reference"
                  />
                  <Select
                    label="Ministry"
                    value={paymentFilter.ministry}
                    onChange={(event) => setPaymentFilter({ ...paymentFilter, ministry: event.target.value })}
                    options={[
                      { value: '', label: 'All ministries' },
                      ...ministries.map((ministry) => ({ value: ministry, label: ministry })),
                    ]}
                  />
                  <Select
                    label="Payment status"
                    value={paymentFilter.status}
                    onChange={(event) => setPaymentFilter({ ...paymentFilter, status: event.target.value })}
                    options={[
                      { value: '', label: 'All statuses' },
                      ...[...new Set(data.payments.map((payment) => payment.status).filter(Boolean))]
                        .map((status) => ({ value: status, label: status })),
                    ]}
                  />
                </div>
              </div>
              {filteredPayments.length === 0 ? (
                <p className="text-muted">No payments match your filters.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr><th>Receipt</th><th>Service</th><th>Ministry</th><th>Amount</th><th>Status</th><th>Date</th><th /></tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{payment.receiptNumber}</td>
                          <td>{payment.service || '—'}</td>
                          <td>{payment.ministry}</td>
                          <td>{formatCurrency(payment.amount, payment.currency)}</td>
                          <td>{payment.status}</td>
                          <td>{formatDate(payment.paidAt)}</td>
                          <td><Button size="small" variant="secondary" onClick={() => setPrintingPayment(payment)}>Print receipt</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="citizen-finance-print-receipt">
                {printingPayment && (
                  <article className="print-container">
                    <h2>Payment receipt</h2>
                    <p>Receipt number: {printingPayment.receiptNumber}</p>
                    <p>Service: {printingPayment.service || '—'} ({printingPayment.ministry})</p>
                    <p>Application: {printingPayment.applicationReference || '—'}</p>
                    <p>Amount: {formatCurrency(printingPayment.amount, printingPayment.currency)}</p>
                    <p>Status: {printingPayment.status}</p>
                    <p>Paid: {formatDate(printingPayment.paidAt)}</p>
                  </article>
                )}
              </div>
            </section>
          )}

          {activeSection === 'employment' && (
            <section className="dashboard-section finance-detail-section">
              <h2>My employment details</h2>
              {data.employment.length > 0 && (
                <div className="finance-employment-list">
                  {data.employment.map((declaration) => (
                    <Card key={declaration.id} variant="flat" className="finance-employment-item">
                      <strong>{declaration.employerName} · {declaration.positionTitle}</strong>
                      <span>{declaration.employmentType} · Submitted {formatDate(declaration.createdAt)}</span>
                      <span>Status: {declaration.status}</span>
                      <span>
                        Proof:{' '}
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => downloadProof(declaration)}
                        >
                          Download {declaration.proofFileName}
                        </button>
                      </span>
                      {declaration.reviewNotes && <span>{declaration.reviewNotes}</span>}
                    </Card>
                  ))}
                </div>
              )}
              <h3>Submit an employment declaration</h3>
              <div className="form-grid">
                <Input label="Employer" value={employment.employerName} onChange={(event) => setEmployment({ ...employment, employerName: event.target.value })} required />
                <Input label="Position / job title" value={employment.positionTitle} onChange={(event) => setEmployment({ ...employment, positionTitle: event.target.value })} required />
                <Select label="Employment type" value={employment.employmentType} onChange={(event) => setEmployment({ ...employment, employmentType: event.target.value })} options={[
                  { value: 'GOVERNMENT', label: 'Government' },
                  { value: 'PRIVATE', label: 'Private sector' },
                  { value: 'SELF_EMPLOYED', label: 'Self-employed' },
                  { value: 'NGO', label: 'NGO' },
                  { value: 'OTHER', label: 'Other' },
                ]} required />
                <Input label="Start date" type="date" value={employment.startDate} onChange={(event) => setEmployment({ ...employment, startDate: event.target.value })} required />
                <Input label="End date (optional)" type="date" value={employment.endDate} onChange={(event) => setEmployment({ ...employment, endDate: event.target.value })} />
                <label className="form-field">
                  <span className="form-label">Proof of employment</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setEmployment({ ...employment, proof: event.target.files?.[0] || null })} required />
                </label>
              </div>
              <Button
                variant="primary"
                loading={submittingEmployment}
                disabled={!employment.employerName.trim() || !employment.positionTitle.trim() || !employment.startDate || !employment.proof}
                onClick={submitEmployment}
              >
                Submit declaration
              </Button>
            </section>
          )}

          {activeSection === 'debts' && (
            <section className="dashboard-section finance-detail-section">
              <h2>Amounts I owe government</h2>
              {data.debts.length === 0 ? (
                <p className="text-muted">No government debts are recorded for your National ID.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead><tr><th>Debt</th><th>Amount</th><th>Status</th><th>Recorded</th><th>Cleared</th></tr></thead>
                    <tbody>{data.debts.map((debt) => (
                      <tr key={debt.id}>
                        <td>{debt.debtType}</td><td>{formatCurrency(debt.amount)}</td>
                        <td>{debt.status === 'OUTSTANDING' ? 'Outstanding' : 'Cleared'}</td>
                        <td>{formatDate(debt.createdAt)}</td><td>{debt.dateCleared ? formatDate(debt.dateCleared) : '—'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeSection === 'fees' && (
            <section className="dashboard-section finance-detail-section">
              <h2>Current service fees</h2>
              {data.fees.length === 0 ? (
                <p className="text-muted">No active service fees are configured.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead><tr><th>Ministry</th><th>Service</th><th>Fee</th></tr></thead>
                    <tbody>{data.fees.map((fee) => (
                      <tr key={fee.id}><td>{fee.ministry}</td><td>{fee.serviceName}</td><td>{formatCurrency(fee.amount, fee.currency)}</td></tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </PageWrapper>
  );
}

export default FinanceDashboard;
