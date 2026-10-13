import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import useFetch from '../../hooks/useFetch';
import { getProfile } from '../../api/citizenApi';
import { applyForDrivingLicence } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';

function ApplyDrivingLicence() {
  const { data: profile } = useFetch(getProfile, []);
  const [form, setForm] = useState({
    licenceType: 'ORDINARY',
    testReference: '',
    address: '',
    photoUrl: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.testReference.trim()) return setError('Test reference is required.');
    if (!form.licenceType) return setError('Licence type is required.');

    setLoading(true);
    try {
      const result = await applyForDrivingLicence(form);
      success(`Application submitted. Reference: ${result.reference_number}`);
      navigate('/traffic/applications');
    } catch (err) {
      setError(err.message || 'Could not submit the application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Apply for Driving Licence"
      showBack
      backPath="/traffic/dashboard"
      accentColour="#B9770E"
    >
      <h1>Apply for driving licence</h1>

      <CitizenReadOnlyBlock citizen={profile} />

      {error && <Alert type="error" message={error} />}

      <div className="form-grid">
        <Select
          label="Licence type"
          value={form.licenceType}
          onChange={(e) => update('licenceType', e.target.value)}
          options={[
            { value: 'ORDINARY', label: 'Ordinary' },
            { value: 'PROFESSIONAL', label: 'Professional' },
          ]}
          required
        />
        <Input
          label="Test reference"
          value={form.testReference}
          onChange={(e) => update('testReference', e.target.value)}
          required
          helpText="From your completed theory or practical test"
        />
        <Input
          label="Address"
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
          full
        />
      </div>

      <FormActions
        primaryLabel="Submit application"
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/traffic/dashboard')}
      />
    </PageWrapper>
  );
}

export default ApplyDrivingLicence;