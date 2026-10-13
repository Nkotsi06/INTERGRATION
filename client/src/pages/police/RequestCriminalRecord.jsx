import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import useFetch from '../../hooks/useFetch';
import { getProfile } from '../../api/citizenApi';
import { requestCriminalRecord } from '../../api/policeApi';
import { useNotification } from '../../context/NotificationContext';

function RequestCriminalRecord() {
  const { data: profile } = useFetch(getProfile, []);
  const [form, setForm] = useState({ purpose: '' });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const handleSubmit = async () => {
    setError(null);
    if (!form.purpose.trim()) return setError('Please provide a purpose.');
    if (!confirmed) return setError('Please confirm the information is accurate.');

    setLoading(true);
    try {
      const result = await requestCriminalRecord({ purpose: form.purpose.trim() });
      success(`Request submitted. Reference: ${result.reference_number}`);
      navigate('/police/criminal-records');
    } catch (err) {
      setError(err.message || 'Could not submit the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Request Criminal Record"
      showBack
      backPath="/police/dashboard"
      accentColour="#922B21"
    >
      <h1>Request criminal record</h1>
      <p className="text-muted">
        Apply for a certificate stating your criminal record status.
      </p>

      <CitizenReadOnlyBlock citizen={profile} />

      {error && <Alert type="error" message={error} />}

      <Input
        label="Purpose"
        value={form.purpose}
        onChange={(e) => setForm({ ...form, purpose: e.target.value })}
        placeholder="Employment, visa, etc."
        required
        full
      />

      <Checkbox
        label="I confirm that the information provided is accurate."
        checked={confirmed}
        onChange={(e) => setConfirmed(e.target.checked)}
      />

      <FormActions
        primaryLabel="Submit request"
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/police/dashboard')}
      />
    </PageWrapper>
  );
}

export default RequestCriminalRecord;