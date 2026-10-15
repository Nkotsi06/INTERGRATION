import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useServiceFee from '../../hooks/useServiceFees';
import { getVehicles, applyVehicleLicence } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function ApplyVehicleLicence() {
  const { fee, currency } = useServiceFee('TRAFFIC', 'VEHICLE_LICENCE');
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    vehicleId: '',
    method: 'MOBILE_MONEY',
    mobile: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  useEffect(() => {
    let cancelled = false;
    getVehicles()
      .then((v) => { if (!cancelled) setVehicles(Array.isArray(v) ? v : []); })
      .catch(() => { /* silent */ });
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!form.vehicleId) {
      setError('Please choose a vehicle.');
      return;
    }
    if (fee > 0 && form.method === 'MOBILE_MONEY' && !form.mobile.trim()) {
      setError('Please enter your mobile number for payment.');
      return;
    }
    setLoading(true);
    try {
      await applyVehicleLicence({
        vehicleId: form.vehicleId,
        feeAmount: fee,
        method: form.method,
        mobile: form.mobile,
        amount: fee,
      });
      success('Application submitted');
      navigate('/traffic/vehicle-licences');
    } catch (err) {
      setError(err.message || 'Could not submit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Apply for Vehicle Licence"
      showBack
      backPath="/traffic/vehicle-licences"
      accentColour="#B9770E"
    >
      <h1>Apply for a vehicle licence</h1>

      {error && <Alert type="error" message={error} />}

      <Select
        label="Vehicle"
        value={form.vehicleId}
        onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
        options={vehicles.map((v) => ({
          value: v.id,
          label: `${v.registration_number} — ${v.make || ''} ${v.model || ''}`.trim(),
        }))}
        required
      />

      {fee > 0 && (
        <div className="form-section">
          <h3 className="form-section-title">Payment</h3>
          <p className="text-muted">
            Licence fee: <strong>{formatCurrency(fee, currency)}</strong>
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
          fee > 0 ? `Pay ${formatCurrency(fee, currency)} and submit` : 'Submit'
        }
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/traffic/vehicle-licences')}
      />
    </PageWrapper>
  );
}

export default ApplyVehicleLicence;