import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import DatePicker from '../../components/common/DatePicker';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import { requestPaymentPlan } from '../../api/financeApi';
import { useNotification } from '../../context/NotificationContext';

function RequestPaymentPlan() {
  const [form, setForm] = useState({
    totalAmount: '', numberOfInstalments: '3',
    startDate: '', frequency: 'MONTHLY',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.totalAmount) return setError('Total amount is required.');
    if (!form.numberOfInstalments) return setError('Number of instalments is required.');
    if (!form.startDate) return setError('Start date is required.');

    setLoading(true);
    try {
      const result = await requestPaymentPlan(form);
      success(`Payment plan requested. Reference: ${result.reference_number}`);
      navigate('/finance/payment-plans');
    } catch (err) {
      setError(err.message || 'Could not submit the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="Request Payment Plan" showBack backPath="/finance/payment-plans" accentColour="#117864">
      <h1>Request a payment plan</h1>
      {error && <Alert type="error" message={error} />}
      <div className="form-grid">
        <Input label="Total amount owed (M)" type="number" value={form.totalAmount}
          onChange={(e) => update('totalAmount', e.target.value)} required />
        <Input label="Number of instalments" type="number" min="2" value={form.numberOfInstalments}
          onChange={(e) => update('numberOfInstalments', e.target.value)} required />
        <DatePicker label="First instalment date" value={form.startDate}
          onChange={(e) => update('startDate', e.target.value)} required />
        <Select label="Frequency" value={form.frequency}
          onChange={(e) => update('frequency', e.target.value)}
          options={[
            { value: 'MONTHLY',  label: 'Monthly' },
            { value: 'BIWEEKLY', label: 'Every two weeks' },
            { value: 'WEEKLY',   label: 'Weekly' },
          ]} />
      </div>
      <FormActions primaryLabel="Request plan" primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/finance/payment-plans')} />
    </PageWrapper>
  );
}

export default RequestPaymentPlan;