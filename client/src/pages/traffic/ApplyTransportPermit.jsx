import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import DatePicker from '../../components/common/DatePicker';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useFetch from '../../hooks/useFetch';
import { getVehicles, applyTransportPermit } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';

const CATEGORIES = [
  { value: 'A', label: 'Category A — Passenger (small)' },
  { value: 'B', label: 'Category B — Passenger (large)' },
  { value: 'C', label: 'Category C — Goods (light)' },
  { value: 'D', label: 'Category D — Goods (heavy)' },
  { value: 'E', label: 'Category E — Cross-border passenger' },
  { value: 'F', label: 'Category F — Cross-border goods' },
];

const TYPES = [
  { value: 'NEW',          label: 'New permit' },
  { value: 'RENEWAL',      label: 'Renewal' },
  { value: 'SHORT_TERM',   label: 'Short-term' },
  { value: 'SPECIAL_TRIP', label: 'Special trip' },
  { value: 'GOODS',        label: 'Goods transport' },
  { value: 'PASSENGER',    label: 'Passenger transport' },
  { value: 'COMMERCIAL',   label: 'Commercial' },
];

function ApplyTransportPermit() {
  const { data: vehicles } = useFetch(getVehicles, []);
  const [form, setForm] = useState({
    permitCategory: 'A',
    permitType: 'NEW',
    vehicleId: '',
    routeDescription: '',
    validFrom: '',
    validUntil: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.validFrom) return setError('Valid-from date is required.');
    if (!form.validUntil) return setError('Valid-until date is required.');

    setLoading(true);
    try {
      const result = await applyTransportPermit(form);
      success(`Application submitted. Reference: ${result.reference_number}`);
      navigate('/traffic/permits');
    } catch (err) {
      setError(err.message || 'Could not submit the application.');
    } finally {
      setLoading(false);
    }
  };

  const vehicleOptions = (vehicles || []).map((v) => ({
    value: v.id,
    label: `${v.registration_number} — ${v.make || ''} ${v.model || ''}`,
  }));

  return (
    <PageWrapper title="Apply for Transport Permit" showBack backPath="/traffic/permits" accentColour="#B9770E">
      <h1>Apply for transport permit</h1>

      {error && <Alert type="error" message={error} />}

      <div className="form-grid">
        <Select
          label="Permit category"
          value={form.permitCategory}
          onChange={(e) => update('permitCategory', e.target.value)}
          options={CATEGORIES}
          required
        />
        <Select
          label="Permit type"
          value={form.permitType}
          onChange={(e) => update('permitType', e.target.value)}
          options={TYPES}
          required
        />
        <Select
          label="Vehicle (optional)"
          value={form.vehicleId}
          onChange={(e) => update('vehicleId', e.target.value)}
          options={vehicleOptions}
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
        <Input
          label="Route description"
          value={form.routeDescription}
          onChange={(e) => update('routeDescription', e.target.value)}
          placeholder="e.g. Maseru to Maputsoe"
          full
        />
      </div>

      <FormActions
        primaryLabel="Submit application"
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/traffic/permits')}
      />
    </PageWrapper>
  );
}

export default ApplyTransportPermit;