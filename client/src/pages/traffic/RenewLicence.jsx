import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import ProgressIndicator from '../../components/common/ProgressIndicator';
import FormActions from '../../components/common/FormActions';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import useFetch from '../../hooks/useFetch';
import { getLicence, renewLicence } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

function RenewLicence() {
  const { data: licence, loading } = useFetch(getLicence, []);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ amount: '250.00', method: 'MOBILE_MONEY', mobile: '' });
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const navigate = useNavigate();
  const { success } = useNotification();

  const handlePay = async () => {
    setError(null);
    if (!form.mobile.trim()) {
      setError('Please enter your mobile number for the payment prompt.');
      return;
    }

    setProcessing(true);
    try {
      const result = await renewLicence(form);
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

      <ProgressIndicator
        currentStep={step}
        totalSteps={3}
        labels={['Review info', 'Payment', 'Confirmation']}
      />

      {step === 1 && (
        <>
          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : (
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
          )}

          <FormActions
            primaryLabel="Continue to payment"
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
            <p className="text-muted">Renewal fee: M 250.00</p>

            <Input
              label="Mobile number"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              placeholder="+266 5888 2140"
              required
            />
          </div>

          <FormActions
            primaryLabel="Pay M 250.00"
            primaryLoading={processing}
            onPrimary={handlePay}
            onSecondary={() => setStep(1)}
          />
        </>
      )}

      {step === 3 && confirmation && (
        <div className="result-card">
          <StatusBadge variant="verified" />
          <h2>Renewal submitted</h2>
          <p>Your reference number is:</p>
          <div className="reference-number">
            <span className="reference-value">{confirmation.referenceNumber}</span>
          </div>
          <div className="result-actions">
            <Button variant="secondary" onClick={() => window.print()}>
              Download receipt
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