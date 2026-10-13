import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import useFetch from '../../hooks/useFetch';
import { getProfile } from '../../api/citizenApi';
import { applyForLearnersLicence } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';

const EXAM_CENTRES = [
  { value: 'MASERU',   label: 'Maseru Testing Centre' },
  { value: 'LERIBE',   label: 'Leribe Testing Centre' },
  { value: 'MAFETENG', label: 'Mafeteng Testing Centre' },
  { value: 'BEREA',    label: 'Berea Testing Centre' },
];

function ApplyLearnersLicence() {
  const { data: profile } = useFetch(getProfile, []);
  const [examCentre, setExamCentre] = useState('MASERU');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const handleSubmit = async () => {
    setError(null);
    if (!examCentre) return setError('Exam centre is required.');

    setLoading(true);
    try {
      const result = await applyForLearnersLicence({ examCentre });
      success(`Application submitted. Reference: ${result.reference_number}`);
      navigate('/traffic/applications');
    } catch (err) {
      setError(err.message || 'Could not submit the application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="Apply for Learner's Licence" showBack backPath="/traffic/dashboard" accentColour="#B9770E">
      <h1>Apply for learner's licence</h1>
      <p className="text-muted">
        Your personal details come from Home Affairs and cannot be edited here.
      </p>

      <CitizenReadOnlyBlock citizen={profile} />

      {error && <Alert type="error" message={error} />}

      <Select
        label="Preferred exam centre"
        value={examCentre}
        onChange={(e) => setExamCentre(e.target.value)}
        options={EXAM_CENTRES}
        required
      />

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