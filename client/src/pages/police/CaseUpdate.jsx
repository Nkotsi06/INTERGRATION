import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import { addCaseUpdate, updateCase } from '../../api/policeApi';
import { useNotification } from '../../context/NotificationContext';

function CaseUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useNotification();
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError(null);
    if (!status) {
      setError('Please choose a new status.');
      return;
    }
    setSaving(true);
    try {
      await updateCase(id, { status });
      if (notes.trim()) {
        await addCaseUpdate(id, { notes });
      }
      success('Case updated');
      navigate('/police/manage');
    } catch (err) {
      setError('Could not save the update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper
      title="Update Case"
      showBack
      backPath="/police/manage"
      accentColour="#922B21"
    >
      <h1>Update case</h1>

      {error && <Alert type="error" message={error} />}

      <Select
        label="New status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={[
          { value: 'SUBMITTED', label: 'Submitted' },
          { value: 'UNDER_INVESTIGATION', label: 'Under investigation' },
          { value: 'UPDATED', label: 'Updated' },
          { value: 'CLOSED', label: 'Closed' },
        ]}
        required
      />

      <div className="form-field">
        <label className="form-label">Notes</label>
        <textarea
          className="form-input"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Visible to the citizen in case details"
        />
      </div>

      <FormActions
        primaryLabel="Save update"
        primaryLoading={saving}
        onPrimary={handleSave}
        onSecondary={() => navigate('/police/manage')}
      />
    </PageWrapper>
  );
}

export default CaseUpdate;