import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import { makePayment } from '../../api/financeApi';
import { useNotification } from '../../context/NotificationContext';

function MakePayment() {
  const [form, setForm] = useState({
    amount: '',
    method: 'MOBILE_MONEY',
    mobile: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const handlePay = async () => {
    setError(null);
    if (!form.amount || !form.method) {
      setError('Please complete every field.');
      return;
    }
    setLoading(true);
    try {
      const result = await makePayment(form);
      success(`Payment successful. Reference: ${result.referenceNumber}`);
      navigate('/finance/payment/success', { state: { result } });
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Make Payment"
      showBack
      backPath="/finance/tax/profile"
      accentColour="#117864"
    >
      <h1>Make payment</h1>

      {error && <Alert type="error" message={error} />}

      <Input
        label="Amount (M)"
        type="number"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        required
      />

      <Select
        label="Payment method"
        value={form.method}
        onChange={(e) => setForm({ ...form, method: e.target.value })}
        options={[
          { value: 'MOBILE_MONEY', label: 'Mobile money' },
          { value: 'BANK_TRANSFER', label: 'Bank transfer' },
          { value: 'CARD', label: 'Card' },
        ]}
        required
      />

      {form.method === 'MOBILE_MONEY' && (
        <Input
          label="Mobile number"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          placeholder="+266 5888 2140"
          required
        />
      )}

      <FormActions
        primaryLabel={`Pay M ${form.amount || '0.00'}`}
        primaryLoading={loading}
        onPrimary={handlePay}
        onSecondary={() => navigate('/finance/tax/profile')}
      />
    </PageWrapper>
  );
}

export default MakePayment;