import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import StepIndicator from '../../components/common/StepIndicator';
import FormActions from '../../components/common/FormActions';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import SignaturePad from '../../components/signature/SignaturePad';
import useFetch from '../../hooks/useFetch';
import useServiceFee from '../../hooks/useServiceFees';
import { getLicence, renewLicence } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate, formatCurrency } from '../../utils/formatters';

function RenewLicence() {
  const { data: licence, loading } = useFetch(getLicence, []);
  const { fee, currency } = useServiceFee('TRAFFIC', 'LICENCE_RENEWAL');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    method: 'MOBILE_MONEY',
    mobile: '',
    signature: null,
  });
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const navigate = useNavigate();
  const { success } = useNotification();

  const handlePay = async () => {
    setError(null);
    if (!form.signature) {
      setError('Please provide your signature before renewing your licence.');
      return;
    }
    if (form.method === 'MOBILE_MONEY' && !form.mobile.trim()) {
      setError('Please enter your mobile number for the payment prompt.');
      return;
    }

    setProcessing(true);
    try {
      const result = await renewLicence({
        amount: fee,
        method: form.method,
        mobile: form.mobile,
      });
      setConfirmation(result);
      setStep(3);
      success('Renewal submitted successfully');
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <PageWrapper
      title="Renew Driving Licence"
      showBack
      backPath="/traffic/dashboard"
      accentColour="#B9770E"
    >
      <h1>Renew driving licence</h1>

      <StepIndicator
        current={step}
        total={3}
        labels={['Review info', 'Payment', 'Confirmation']}
      />

      {step === 1 && (
        <>
          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : (
            <>
            {!licence && (
              <Alert
                type="warning"
                message="No driving licence is on record for your verified citizen profile."
              />
            )}
            <div className="card card-flat">
              <h3>Review your information</h3>
              <p className="text-muted">
                These details come from Home Affairs and cannot be edited here.
              </p>
              <div className="form-grid">
                <ReadOnly label="Full name" value={licence?.fullName} />
                <ReadOnly label="National ID" value={licence?.nationalId} />
                <ReadOnly label="Licence number" value={licence?.licenceNumber} />
                <ReadOnly label="Expiry date" value={formatDate(licence?.expiryDate)} />
              </div>
            </div>
            </>
          )}

          <FormActions
            primaryLabel="Continue to payment"
            primaryDisabled={loading || !licence}
            onPrimary={() => setStep(2)}
            onSecondary={() => navigate('/traffic/dashboard')}
          />
        </>
      )}

      {step === 2 && (
        <>
          {error && <Alert type="error" message={error} />}

          <div className="card card-flat">
            <h3>Payment</h3>
            <p className="text-muted">
              Renewal fee: <strong>{formatCurrency(fee, currency)}</strong>
            </p>

            <Select
              label="Payment method"
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              options={[
                { value: 'MOBILE_MONEY', label: 'Mobile money' },
                { value: 'BANK_TRANSFER', label: 'Bank transfer' },
                { value: 'CARD', label: 'Card' },
              ]}
              required
            />

            {form.method === 'MOBILE_MONEY' && (
              <Input
                label="Mobile number"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="+266 5888 2140"
                required
              />
            )}
            <div className="form-section">
              <h3 className="form-section-title">Signature</h3>
              <p className="text-muted">
                Sign to authorise your driving licence renewal.
              </p>
              <SignaturePad
                onSave={(signature) => setForm((previous) => ({ ...previous, signature }))}
                onClear={() => setForm((previous) => ({ ...previous, signature: null }))}
              />
            </div>
          </div>

          <FormActions
            primaryLabel={`Pay ${formatCurrency(fee, currency)}`}
            primaryLoading={processing}
            onPrimary={handlePay}
            onSecondary={() => setStep(1)}
          />
        </>
      )}

      {step === 3 && confirmation && (
        <div className="result-card">
          <h2>Renewal submitted</h2>
          <p>Your reference number is:</p>
          <div className="reference-number">
            <span className="reference-value">{confirmation.referenceNumber}</span>
          </div>
          {confirmation.receiptNumber && (
            <p className="text-muted">
              Payment receipt: <strong>{confirmation.receiptNumber}</strong>
            </p>
          )}
          <div className="result-actions">
            <Button variant="secondary" onClick={() => window.print()}>
              Print receipt
            </Button>
            <Button variant="primary" onClick={() => navigate('/traffic/licence')}>
              View driving licence
            </Button>
          </div>
        </div>
      )}
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

export default RenewLicence;