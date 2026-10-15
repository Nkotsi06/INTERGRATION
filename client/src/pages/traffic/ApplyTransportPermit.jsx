import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import DatePicker from '../../components/common/DatePicker';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useServiceFee from '../../hooks/useServiceFees';
import { applyTransportPermit } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function ApplyTransportPermit() {
  const { fee, currency } = useServiceFee('TRAFFIC', 'TRANSPORT_PERMIT');
  const [form, setForm] = useState({
    permitCategory: '',
    permitType: '',
    routeDescription: '',
    validFrom: '',
    validUntil: '',
    method: 'MOBILE_MONEY',
    mobile: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.permitCategory || !form.permitType || !form.validFrom || !form.validUntil) {
      setError('Please complete the permit details.');
      return;
    }
    if (fee > 0 && form.method === 'MOBILE_MONEY' && !form.mobile.trim()) {
      setError('Please enter your mobile number for payment.');
      return;
    }
    setLoading(true);
    try {
      await applyTransportPermit({ ...form, amount: fee });
      success('Application submitted');
      navigate('/traffic/permits');
    } catch (err) {
      setError(err.message || 'Could not submit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Apply for Transport Permit"
      showBack
      backPath="/traffic/permits"
      accentColour="#B9770E"
    >
      <h1>Apply for a transport permit</h1>

      {error && <Alert type="error" message={error} />}

      <Select
        label="Permit category"
        value={form.permitCategory}
        onChange={(e) => update('permitCategory', e.target.value)}
        options={[
          { value: 'PASSENGER', label: 'Passenger transport' },
          { value: 'GOODS', label: 'Goods transport' },
          { value: 'ABNORMAL', label: 'Abnormal loads' },
        ]}
        required
      />

      <Select
        label="Permit type"
        value={form.permitType}
        onChange={(e) => update('permitType', e.target.value)}
        options={[
          { value: 'SHORT_TERM', label: 'Short term' },
          { value: 'ANNUAL', label: 'Annual' },
        ]}
        required
      />

      <Input
        label="Route description"
        value={form.routeDescription}
        onChange={(e) => update('routeDescription', e.target.value)}
        full
      />

      <DatePicker
        label="Valid from"
        value={form.validFrom}
        onChange={(e) => update('validFrom', e.target.value)}
        required
      />

      <DatePicker
        label="Valid until"
        value={form.validUntil}
        onChange={(e) => update('validUntil', e.target.value)}
        required
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
            onChange={(e) => update('method', e.target.value)}
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
              onChange={(e) => update('mobile', e.target.value)}
              required
            />
          )}
        </div>
      )}

      <FormActions
        primaryLabel={
          fee > 0 ? `Pay ${formatCurrency(fee, currency)} and submit` : 'Submit'
        }
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/traffic/permits')}
      />
    </PageWrapper>
  );
}

export default ApplyTransportPermit;