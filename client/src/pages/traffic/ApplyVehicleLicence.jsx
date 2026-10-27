import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useServiceFee from '../../hooks/useServiceFees';
import { getVehicles, applyVehicleLicence, renewVehicleLicence } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function ApplyVehicleLicence() {
  const {
    fee,
    currency,
    loading: feeLoading,
    error: feeError,
  } = useServiceFee('TRAFFIC', 'MY_VEHICLE_LICENCES');
  const [searchParams] = useSearchParams();
  const renewalId = searchParams.get('renewalId');
  const renewalVehicleId = searchParams.get('vehicleId');
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
      .then((v) => {
        if (cancelled) return;
        const rows = Array.isArray(v) ? v : [];
        setVehicles(rows);
        if (renewalId) {
          const vehicle = rows.find((row) => row.id === renewalVehicleId);
          if (vehicle) setForm((prev) => ({ ...prev, vehicleId: vehicle.id }));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load your vehicles.');
      });
    return () => { cancelled = true; };
  }, [renewalId, renewalVehicleId]);

  const handleSubmit = async () => {
    setError(null);
    if (!form.vehicleId) {
      setError('Please choose a vehicle.');
      return;
    }
    if (feeError) {
      setError(feeError);
      return;
    }
    if (fee > 0 && form.method === 'MOBILE_MONEY' &&
        !/^[0-9+\-\s()]{6,30}$/.test(form.mobile.trim())) {
      setError('Please enter a valid mobile number for payment.');
      return;
    }
    setLoading(true);
    try {
      const request = {
        vehicleId: form.vehicleId,
        method: form.method,
        mobile: form.mobile,
      };
      if (renewalId) {
        await renewVehicleLicence(renewalId, request);
      } else {
        await applyVehicleLicence(request);
      }
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
      title={renewalId ? 'Renew Vehicle Licence' : 'Apply for Vehicle Licence'}
      showBack
      backPath="/traffic/vehicle-licences"
      accentColour="#B9770E"
    >
      <h1>{renewalId ? 'Renew vehicle licence' : 'Apply for a vehicle licence'}</h1>

      {error && <Alert type="error" message={error} />}
      {feeError && <Alert type="error" message={feeError} />}

      <Select
        label="Vehicle"
        value={form.vehicleId}
        onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
        disabled={!!renewalId}
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
          fee > 0
            ? `Pay ${formatCurrency(fee, currency)} and ${renewalId ? 'renew' : 'submit'}`
            : renewalId ? 'Submit renewal' : 'Submit'
        }
        primaryLoading={loading}
        primaryDisabled={feeLoading || !!feeError}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/traffic/vehicle-licences')}
      />
    </PageWrapper>
  );
}

export default ApplyVehicleLicence;