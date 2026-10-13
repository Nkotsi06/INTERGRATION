import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useFetch from '../../hooks/useFetch';
import { getVehicles, applyVehicleLicence } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';

function ApplyVehicleLicence() {
  const { data: vehicles } = useFetch(getVehicles, []);
  const [vehicleId, setVehicleId] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const handleSubmit = async () => {
    setError(null);
    if (!vehicleId) return setError('Please select a vehicle.');

    setLoading(true);
    try {
      const result = await applyVehicleLicence({ vehicleId, feeAmount: 150.00 });
      success(`Application submitted. Reference: ${result.reference_number}`);
      navigate('/traffic/vehicle-licences');
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
    <PageWrapper title="Apply for Vehicle Licence" showBack backPath="/traffic/vehicle-licences" accentColour="#B9770E">
      <h1>Apply for vehicle licence</h1>

      {error && <Alert type="error" message={error} />}

      <Select
        label="Vehicle"
        value={vehicleId}
        onChange={(e) => setVehicleId(e.target.value)}
        options={vehicleOptions}
        required
      />

      <p className="text-muted">Licence fee: M 150.00 (annual)</p>

      <FormActions
        primaryLabel="Submit application"
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/traffic/vehicle-licences')}
      />
    </PageWrapper>
  );
}

export default ApplyVehicleLicence;