import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import { submitTaxReturn } from '../../api/financeApi';
import { useNotification } from '../../context/NotificationContext';

function SubmitTaxReturn() {
  const [form, setForm] = useState({
    taxYear: String(new Date().getFullYear() - 1),
    incomeDeclared: '', deductions: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.taxYear) return setError('Tax year is required.');
    if (!form.incomeDeclared) return setError('Income is required.');

    setLoading(true);
    try {
      const result = await submitTaxReturn(form);
      success(`Tax return submitted. Reference: ${result.reference_number}`);
      navigate('/finance/returns');
    } catch (err) {
      setError(err.message || 'Could not submit the return.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="File Tax Return" showBack backPath="/finance/returns" accentColour="#117864">
      <h1>File a tax return</h1>
      {error && <Alert type="error" message={error} />}
      <div className="form-grid">
        <Input label="Tax year" value={form.taxYear}
          onChange={(e) => update('taxYear', e.target.value)} required />
        <Input label="Income declared (M)" type="number" value={form.incomeDeclared}
          onChange={(e) => update('incomeDeclared', e.target.value)} required />
        <Input label="Deductions (M)" type="number" value={form.deductions}
          onChange={(e) => update('deductions', e.target.value)} />
      </div>
      <p className="text-muted">Tax is calculated at 20% of taxable income (prototype rate).</p>
      <FormActions primaryLabel="Submit return" primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/finance/returns')} />
    </PageWrapper>
  );
}

export default SubmitTaxReturn;