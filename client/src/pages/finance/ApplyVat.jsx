import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import useFetch from '../../hooks/useFetch';
import { getProfile } from '../../api/citizenApi';
import { applyForVat } from '../../api/financeApi';
import { useNotification } from '../../context/NotificationContext';

function ApplyVat() {
  const { data: profile } = useFetch(getProfile, []);
  const [form, setForm] = useState({
    businessName: '', tradingName: '', businessAddress: '',
    natureOfBusiness: '', annualTurnover: '', tin: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.businessName.trim()) return setError('Business name is required.');

    setLoading(true);
    try {
      const result = await applyForVat(form);
      success(`VAT registration submitted. Reference: ${result.reference_number}`);
      navigate('/finance/vat');
    } catch (err) {
      setError(err.message || 'Could not submit the registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="VAT Registration" showBack backPath="/finance/dashboard" accentColour="#117864">
      <h1>VAT registration</h1>
      <CitizenReadOnlyBlock citizen={profile} />
      {error && <Alert type="error" message={error} />}
      <div className="form-grid">
        <Input label="Business name" value={form.businessName}
          onChange={(e) => update('businessName', e.target.value)} required />
        <Input label="Trading name" value={form.tradingName}
          onChange={(e) => update('tradingName', e.target.value)} />
        <Input label="Nature of business" value={form.natureOfBusiness}
          onChange={(e) => update('natureOfBusiness', e.target.value)} />
        <Input label="Annual turnover (M)" type="number" value={form.annualTurnover}
          onChange={(e) => update('annualTurnover', e.target.value)} />
        <Input label="Existing TIN (if any)" value={form.tin}
          onChange={(e) => update('tin', e.target.value)} />
        <Input label="Business address" value={form.businessAddress}
          onChange={(e) => update('businessAddress', e.target.value)} full />
      </div>
      <FormActions primaryLabel="Submit application" primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/finance/dashboard')} />
    </PageWrapper>
  );
}

export default ApplyVat;