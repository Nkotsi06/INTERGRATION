import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useServiceFee from '../../hooks/useServiceFees';
import { applyForPublicDrivingPermit } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function ApplyPublicDrivingPermit() {
  const { fee, currency } = useServiceFee('TRAFFIC', 'PUBLIC_DRIVING_PERMIT');
  const [form, setForm] = useState({
    purpose: '',
    testReference: '',
    licenceNumber: '',
    method: 'MOBILE_MONEY',
    mobile: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const handleSubmit = async () => {
    setError(null);
    if (!form.purpose || !form.testReference) {
      setError('Purpose and test reference are required.');
      return;
    }
    if (fee > 0 && form.method === 'MOBILE_MONEY' && !form.mobile.trim()) {
      setError('Please enter your mobile number for payment.');
      return;
    }
    setLoading(true);
    try {
      const result = await applyForPublicDrivingPermit({ ...form, amount: fee });
      success('Application submitted');
      navigate('/traffic/applications', { state: { reference: result.referenceNumber } });
    } catch (err) {
      setError(err.message || 'Could not submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Apply for a Public Driving Permit"
      showBack
      backPath="/traffic/dashboard"
      accentColour="#B9770E"
    >
      <h1>Apply for a public driving permit</h1>

      {error && <Alert type="error" message={error} />}

      <Input
        label="Purpose"
        value={form.purpose}
        onChange={(e) => setForm({ ...form, purpose: e.target.value })}
        placeholder="Passenger transport, goods, etc."
        required
      />

      <Input
        label="Test reference number"
        value={form.testReference}
        onChange={(e) => setForm({ ...form, testReference: e.target.value })}
        required
      />

      <Input
        label="Existing licence number"
        value={form.licenceNumber}
        onChange={(e) => setForm({ ...form, licenceNumber: e.target.value })}
      />

      {fee > 0 && (
        <div className="form-section">
          <h3 className="form-section-title">Payment</h3>
          <p className="text-muted">
            Permit fee: <strong>{formatCurrency(fee, currency)}</strong>
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
              required
            />
          )}
        </div>
      )}

      <FormActions
        primaryLabel={
          fee > 0 ? `Pay ${formatCurrency(fee, currency)} and submit` : 'Submit application'
        }
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/traffic/dashboard')}
      />
    </PageWrapper>
  );
}

export default ApplyPublicDrivingPermit;