import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useServiceFee from '../../hooks/useServiceFees';
import { applyForLearnersLicence } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function ApplyLearnersLicence() {
  const { fee, currency } = useServiceFee('TRAFFIC', 'LEARNERS_LICENCE');
  const [form, setForm] = useState({
    examCentre: '',
    method: 'MOBILE_MONEY',
    mobile: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const handleSubmit = async () => {
    setError(null);
    if (!form.examCentre) {
      setError('Please select an exam centre.');
      return;
    }
    if (fee > 0 && form.method === 'MOBILE_MONEY' && !form.mobile.trim()) {
      setError('Please enter your mobile number for payment.');
      return;
    }
    setLoading(true);
    try {
      const result = await applyForLearnersLicence({ ...form, amount: fee });
      success('Application submitted');
      navigate('/traffic/applications', { state: { reference: result.referenceNumber } });
    } catch (err) {
      setError(err.message || 'Could not submit. Please try again.');
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
      <h1>Apply for a learner's licence</h1>
      <p className="text-muted">
        Your personal details come from Home Affairs and cannot be edited here.
      </p>

      {error && <Alert type="error" message={error} />}

      <Select
        label="Exam centre"
        value={form.examCentre}
        onChange={(e) => setForm({ ...form, examCentre: e.target.value })}
        options={[
          { value: 'MASERU', label: 'Maseru' },
          { value: 'LERIBE', label: 'Leribe' },
          { value: 'MAFETENG', label: 'Mafeteng' },
        ]}
        required
      />

      {fee > 0 && (
        <div className="form-section">
          <h3 className="form-section-title">Payment</h3>
          <p className="text-muted">
            Application fee: <strong>{formatCurrency(fee, currency)}</strong>
          </p>
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
        </div>
      )}

      <FormActions
        primaryLabel={
          fee > 0 ? `Pay ${formatCurrency(fee, currency)} and submit` : 'Submit application'
        }
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/traffic/dashboard')}
      />
    </PageWrapper>
  );
}

export default ApplyLearnersLicence;