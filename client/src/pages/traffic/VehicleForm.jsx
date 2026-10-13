import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useFetch from '../../hooks/useFetch';
import { registerVehicle, updateVehicle, getVehicles } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';

const emptyForm = {
  registrationNumber: '',
  make: '',
  model: '',
  year: '',
  colour: '',
  vin: '',
  engineNumber: '',
};

function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useNotification();
  const isEdit = !!id;

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const vehicles = await getVehicles();
        if (cancelled) return;
        const found = (vehicles || []).find((v) => v.id === id);
        if (found) {
          setForm({
            registrationNumber: found.registration_number || '',
            make: found.make || '',
            model: found.model || '',
            year: found.year || '',
            colour: found.colour || '',
            vin: found.vin || '',
            engineNumber: found.engine_number || '',
          });
        }
      } catch (err) {
        setError('Could not load the vehicle.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isEdit]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setError(null);
    if (!form.registrationNumber.trim()) return setError('Registration number is required.');
    if (!form.make.trim()) return setError('Make is required.');
    if (!form.model.trim()) return setError('Model is required.');

    setSaving(true);
    try {
      if (isEdit) {
        await updateVehicle(id, {
          make: form.make.trim(),
          model: form.model.trim(),
          year: form.year ? parseInt(form.year, 10) : null,
          colour: form.colour.trim() || null,
          vin: form.vin.trim() || null,
          engine_number: form.engineNumber.trim() || null,
        });
        success('Vehicle updated');
      } else {
        await registerVehicle({
          registrationNumber: form.registrationNumber.trim(),
          make: form.make.trim(),
          model: form.model.trim(),
          year: form.year ? parseInt(form.year, 10) : null,
          colour: form.colour.trim() || null,
          vin: form.vin.trim() || null,
          engineNumber: form.engineNumber.trim() || null,
        });
        success('Vehicle registered');
      }
      navigate('/traffic/vehicles');
    } catch (err) {
      setError(err.message || 'Could not save the vehicle.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Vehicle" showBack backPath="/traffic/vehicles" accentColour="#B9770E">
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
          helpText={isEdit ? 'Cannot be changed' : 'e.g. A1234'}
        />
        <Input label="Make" value={form.make} onChange={(e) => update('make', e.target.value)} required />
        <Input label="Model" value={form.model} onChange={(e) => update('model', e.target.value)} required />
        <Input label="Year" type="number" value={form.year} onChange={(e) => update('year', e.target.value)} />
        <Input label="Colour" value={form.colour} onChange={(e) => update('colour', e.target.value)} />
        <Input label="VIN" value={form.vin} onChange={(e) => update('vin', e.target.value)} />
        <Input label="Engine number" value={form.engineNumber} onChange={(e) => update('engineNumber', e.target.value)} full />
      </div>

      <FormActions
        primaryLabel={isEdit ? 'Save changes' : 'Register vehicle'}
        primaryLoading={saving}
        onPrimary={handleSave}
        onSecondary={() => navigate('/traffic/vehicles')}
      />
    </PageWrapper>
  );
}

export default VehicleForm;