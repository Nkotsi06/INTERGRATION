import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import useFetch from '../../hooks/useFetch';
import { registerTax } from '../../api/financeApi';
import { getProfile } from '../../api/citizenApi';
import { useNotification } from '../../context/NotificationContext';

function TaxRegistration() {
  const { data: profile } = useFetch(getProfile, []);
  const [form, setForm] = useState({
    employmentStatus: '',
    incomeSource: '',
    taxYear: '',
    employer: '',
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
    if (!form.employmentStatus || !form.incomeSource || !form.taxYear) {
      setError('Please complete every required field.');
      return;
    }
    if (!confirmed) {
      setError('Please confirm the information is correct.');
      return;
    }
    setLoading(true);
    try {
      await registerTax(form);
      success('Tax registration submitted');
      navigate('/finance/tax/profile');
    } catch (err) {
      setError(err.message || 'Could not register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Tax Registration"
      showBack
      backPath="/finance/dashboard"
      accentColour="#117864"
    >
      <h1>Tax registration</h1>
      <p className="text-muted">
        Identity details are verified by Home Affairs and cannot be edited here.
      </p>

      <CitizenReadOnlyBlock citizen={profile} />

      {error && <Alert type="error" message={error} />}

      <div className="form-section">
        <h3 className="form-section-title">Tax details</h3>
        <div className="form-grid">
          <Select
            label="Employment status"
            value={form.employmentStatus}
            onChange={(e) => update('employmentStatus', e.target.value)}
            options={[
              { value: 'EMPLOYED', label: 'Employed' },
              { value: 'SELF_EMPLOYED', label: 'Self-employed' },
              { value: 'UNEMPLOYED', label: 'Unemployed' },
            ]}
            required
          />
          <Input
            label="Income source"
            value={form.incomeSource}
            onChange={(e) => update('incomeSource', e.target.value)}
            placeholder="Salary, business, etc."
            required
          />
          <Input
            label="Tax year"
            value={form.taxYear}
            onChange={(e) => update('taxYear', e.target.value)}
            placeholder="2026"
            required
          />
          <Input
            label="Employer"
            value={form.employer}
            onChange={(e) => update('employer', e.target.value)}
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Declaration</h3>
        <Checkbox
          label="I confirm that my tax registration information is correct."
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
      </div>

      <FormActions
        primaryLabel="Submit registration"
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/finance/dashboard')}
      />
    </PageWrapper>
  );
}

export default TaxRegistration;