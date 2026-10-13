import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import DatePicker from '../../components/common/DatePicker';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import useFetch from '../../hooks/useFetch';
import { getProfile } from '../../api/citizenApi';
import { applyForLearnersLicence } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';

const EXAM_CENTRES = [
  { value: 'MASERU',    label: 'Maseru Testing Centre' },
  { value: 'LERIBE',    label: 'Leribe Testing Centre' },
  { value: 'MAFETENG',  label: 'Mafeteng Testing Centre' },
  { value: 'BEREA',     label: 'Berea Testing Centre' },
  { value: 'MAFETENG2', label: 'Mafeteng Annex' },
];

function ApplyLearnersLicence() {
  const { data: profile } = useFetch(getProfile, []);
  const [form, setForm] = useState({
    dateOfBirth: '',
    idNumber: '',
    address: '',
    examCentre: 'MASERU',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.dateOfBirth) return setError('Date of birth is required.');
    if (!form.idNumber.trim()) return setError('National ID number is required.');
    if (!form.examCentre) return setError('Exam centre is required.');

    setLoading(true);
    try {
      const result = await applyForLearnersLicence(form);
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
      title="Apply for Learner's Licence"
      showBack
      backPath="/traffic/dashboard"
      accentColour="#B9770E"
    >
      <h1>Apply for learner's licence</h1>

      <CitizenReadOnlyBlock citizen={profile} />

      {error && <Alert type="error" message={error} />}

      <div className="form-grid">
        <DatePicker
          label="Date of birth"
          value={form.dateOfBirth}
          onChange={(e) => update('dateOfBirth', e.target.value)}
          required
        />
        <Input
          label="National ID number"
          value={form.idNumber}
          onChange={(e) => update('idNumber', e.target.value)}
          required
        />
        <Select
          label="Preferred exam centre"
          value={form.examCentre}
          onChange={(e) => update('examCentre', e.target.value)}
          options={EXAM_CENTRES}
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

export default ApplyLearnersLicence;