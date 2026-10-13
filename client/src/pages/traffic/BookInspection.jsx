import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import DatePicker from '../../components/common/DatePicker';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useFetch from '../../hooks/useFetch';
import { getVehicles, bookInspection } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';

function BookInspection() {
  const { data: vehicles } = useFetch(getVehicles, []);
  const [form, setForm] = useState({
    vehicleId: '',
    inspectionType: 'ROADWORTHINESS',
    inspectionDate: '',
    timeSlot: '09:00',
    location: 'MASERU',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.vehicleId) return setError('Please select a vehicle.');
    if (!form.inspectionDate) return setError('Please choose a date.');

    setLoading(true);
    try {
      await bookInspection(form);
      success('Inspection booked');
      navigate('/traffic/inspections');
    } catch (err) {
      setError(err.message || 'Could not book the inspection.');
    } finally {
      setLoading(false);
    }
  };

  const vehicleOptions = (vehicles || []).map((v) => ({
    value: v.id,
    label: `${v.registration_number} — ${v.make || ''} ${v.model || ''}`,
  }));

  return (
    <PageWrapper title="Book Vehicle Inspection" showBack backPath="/traffic/inspections" accentColour="#B9770E">
      <h1>Book vehicle inspection</h1>

      {error && <Alert type="error" message={error} />}

      <div className="form-grid">
        <Select
          label="Vehicle"
          value={form.vehicleId}
          onChange={(e) => update('vehicleId', e.target.value)}
          options={vehicleOptions}
          required
        />
        <Select
          label="Inspection type"
          value={form.inspectionType}
          onChange={(e) => update('inspectionType', e.target.value)}
          options={[
            { value: 'ROADWORTHINESS', label: 'Roadworthiness' },
            { value: 'FITNESS',        label: 'Certificate of fitness' },
            { value: 'RENEWAL',        label: 'Renewal inspection' },
          ]}
          required
        />
        <DatePicker
          label="Preferred date"
          value={form.inspectionDate}
          onChange={(e) => update('inspectionDate', e.target.value)}
          required
        />
        <Select
          label="Time slot"
          value={form.timeSlot}
          onChange={(e) => update('timeSlot', e.target.value)}
          options={[
            { value: '09:00', label: '09:00 — 09:30' },
            { value: '10:00', label: '10:00 — 10:30' },
            { value: '11:00', label: '11:00 — 11:30' },
            { value: '14:00', label: '14:00 — 14:30' },
          ]}
        />
        <Select
          label="Location"
          value={form.location}
          onChange={(e) => update('location', e.target.value)}
          options={[
            { value: 'MASERU',   label: 'Maseru Testing Centre' },
            { value: 'LERIBE',   label: 'Leribe Testing Centre' },
            { value: 'MAFETENG', label: 'Mafeteng Testing Centre' },
          ]}
        />
      </div>

      <FormActions
        primaryLabel="Book inspection"
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/traffic/inspections')}
      />
    </PageWrapper>
  );
}

export default BookInspection;