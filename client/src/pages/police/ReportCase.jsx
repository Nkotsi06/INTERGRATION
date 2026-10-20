import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import DatePicker from '../../components/common/DatePicker';
import Checkbox from '../../components/common/Checkbox';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import { reportCase } from '../../api/policeApi';
import { useNotification } from '../../context/NotificationContext';

function ReportCase() {
  const [form, setForm] = useState({
    caseType: '',
    incidentDate: '',
    location: '',
    description: '',
  });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.caseType || !form.incidentDate || !form.location || !form.description) {
      setError('Please complete every field.');
      return;
    }
    if (!confirmed) {
      setError('Please confirm the information is accurate.');
      return;
    }

    setLoading(true);
    try {
      const result = await reportCase(form);
      success(`Case submitted. Reference: ${result.caseNumber}`);
      navigate('/police/cases');
    } catch (err) {
      setError(err.message || 'Could not submit the case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Report a Case"
      showBack
      backPath="/police/dashboard"
      accentColour="#922B21"
    >
      <h1>Report a case</h1>
      <p className="text-muted">
        For emergencies, call 123. This form is for non-emergency reports.
      </p>

      {error && <Alert type="error" message={error} />}

      <div className="form-section">
        <h3 className="form-section-title">Incident details</h3>
        <div className="form-grid">
          <Select
            label="Case type"
            value={form.caseType}
            onChange={(e) => update('caseType', e.target.value)}
            options={[
              { value: 'THEFT', label: 'Theft' },
              { value: 'ASSAULT', label: 'Assault' },
              { value: 'FRAUD', label: 'Fraud' },
              { value: 'MISSING_PERSON', label: 'Missing person' },
              { value: 'OTHER', label: 'Other' },
            ]}
            required
          />
          <DatePicker
            label="Incident date"
            value={form.incidentDate}
            onChange={(e) => update('incidentDate', e.target.value)}
            required
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
            required
            full
          />
        </div>

        <div className="form-field" style={{ marginTop: 16 }}>
          <label className="form-label">
            Description <span className="required-mark">*</span>
          </label>
          <textarea
            className="form-input"
            rows={4}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Describe what happened"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Declaration</h3>
        <Checkbox
          label="I confirm that the information provided is accurate."
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
      </div>

      <FormActions
        primaryLabel="Submit case"
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/police/dashboard')}
      />
    </PageWrapper>
  );
}

export default ReportCase;