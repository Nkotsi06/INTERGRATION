import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useServiceFee from '../../hooks/useServiceFees';
import {
  getVehicleById,
  registerVehicle,
  updateVehicle,
} from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useNotification();
  const isEdit = !!id;

  const { fee, currency } = useServiceFee(
    'TRAFFIC',
    isEdit ? 'VEHICLE_UPDATE' : 'VEHICLE_REGISTRATION'
  );

  const [form, setForm] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    year: '',
    colour: '',
    vin: '',
    engineNumber: '',
    origin: 'NEW',
    method: 'MOBILE_MONEY',
    mobile: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return undefined;
    let cancelled = false;
    async function load() {
      try {
        const v = await getVehicleById(id);
        if (cancelled) return;
        setForm((prev) => ({ ...prev, ...v }));
      } catch (err) {
        if (!cancelled) setError('Could not load this vehicle.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, isEdit]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);
    try {
      if (isEdit) {
        await updateVehicle(id, form);
      } else {
        await registerVehicle({ ...form, amount: fee });
      }
      success(isEdit ? 'Vehicle updated' : 'Vehicle registered');
      navigate('/traffic/vehicles');
    } catch (err) {
      setError(err.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Vehicle" showBack backPath="/traffic/vehicles">
        <p className="text-muted">Loading…</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={isEdit ? 'Edit Vehicle' : 'Register Vehicle'}
      showBack
      backPath="/traffic/vehicles"
      accentColour="#B9770E"
    >
      <h1>{isEdit ? 'Edit vehicle' : 'Register vehicle'}</h1>

      {error && <Alert type="error" message={error} />}

      <div className="form-grid">
        <Input
          label="Registration number"
          value={form.registrationNumber}
          onChange={(e) => update('registrationNumber', e.target.value)}
          required
          disabled={isEdit}
        />
        <Input
          label="Make"
          value={form.make}
          onChange={(e) => update('make', e.target.value)}
          required
        />
        <Input
          label="Model"
          value={form.model}
          onChange={(e) => update('model', e.target.value)}
          required
        />
        <Input
          label="Year"
          type="number"
          value={form.year}
          onChange={(e) => update('year', e.target.value)}
        />
        <Input
          label="Colour"
          value={form.colour}
          onChange={(e) => update('colour', e.target.value)}
        />
        <Input
          label="VIN"
          value={form.vin}
          onChange={(e) => update('vin', e.target.value)}
        />
        <Input
          label="Engine number"
          value={form.engineNumber}
          onChange={(e) => update('engineNumber', e.target.value)}
        />
        <Select
          label="Origin"
          value={form.origin}
          onChange={(e) => update('origin', e.target.value)}
          options={[
            { value: 'NEW', label: 'New' },
            { value: 'IMPORTED', label: 'Imported' },
            { value: 'USED_LOCAL', label: 'Used (local)' },
          ]}
        />
      </div>

      {!isEdit && fee > 0 && (
        <div className="form-section">
          <h3 className="form-section-title">Payment</h3>
          <p className="text-muted">
            Registration fee: <strong>{formatCurrency(fee, currency)}</strong>
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
          isEdit
            ? 'Save changes'
            : fee > 0
            ? `Pay ${formatCurrency(fee, currency)} and register`
            : 'Register vehicle'
        }
        primaryLoading={saving}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/traffic/vehicles')}
      />
    </PageWrapper>
  );
}

export default VehicleForm;