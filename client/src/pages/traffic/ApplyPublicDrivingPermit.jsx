import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import useFetch from '../../hooks/useFetch';
import { getProfile } from '../../api/citizenApi';
import { applyForPublicDrivingPermit } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';

function ApplyPublicDrivingPermit() {
  const { data: profile } = useFetch(getProfile, []);
  const [form, setForm] = useState({
    purpose: '',
    testReference: '',
    address: '',
    licenceNumber: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.purpose.trim()) return setError('Purpose is required.');
    if (!form.testReference.trim()) return setError('Test reference is required.');

    setLoading(true);
    try {
      const result = await applyForPublicDrivingPermit(form);
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
      title="Apply for Public Driving Permit"
      showBack
      backPath="/traffic/dashboard"
      accentColour="#B9770E"
    >
      <h1>Apply for public driving permit (PDP)</h1>
      <p className="text-muted">
        Required to drive public transport vehicles in Lesotho.
      </p>

      <CitizenReadOnlyBlock citizen={profile} />

      {error && <Alert type="error" message={error} />}

      <div className="form-grid">
        <Input
          label="Purpose"
          value={form.purpose}
          onChange={(e) => update('purpose', e.target.value)}
          required
          placeholder="e.g. Taxi driver, bus driver"
        />
        <Input
          label="Existing driving licence number"
          value={form.licenceNumber}
          onChange={(e) => update('licenceNumber', e.target.value)}
        />
        <Input
          label="PDP test reference"
          value={form.testReference}
          onChange={(e) => update('testReference', e.target.value)}
          required
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

export default ApplyPublicDrivingPermit;