import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import useFetch from '../../hooks/useFetch';
import { getProfile } from '../../api/citizenApi';
import { registerBusiness } from '../../api/financeApi';
import { useNotification } from '../../context/NotificationContext';

const TYPES = [
  { value: 'SOLE_PROPRIETOR', label: 'Sole proprietor' },
  { value: 'PARTNERSHIP',     label: 'Partnership' },
  { value: 'COMPANY',         label: 'Company' },
  { value: 'COOPERATIVE',     label: 'Cooperative' },
];

function RegisterBusiness() {
  const { data: profile } = useFetch(getProfile, []);
  const [form, setForm] = useState({
    businessName: '', tradingName: '', businessType: 'SOLE_PROPRIETOR',
    registrationNumber: '', address: '', phone: '', email: '', tin: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.businessName.trim()) return setError('Business name is required.');
    if (!form.businessType) return setError('Business type is required.');

    setLoading(true);
    try {
      const result = await registerBusiness(form);
      success(`Business registration submitted. Reference: ${result.reference_number}`);
      navigate('/finance/businesses');
    } catch (err) {
      setError(err.message || 'Could not submit the registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="Register Business" showBack backPath="/finance/businesses" accentColour="#117864">
      <h1>Register a business</h1>
      <CitizenReadOnlyBlock citizen={profile} />
      {error && <Alert type="error" message={error} />}
      <div className="form-grid">
        <Input label="Business name" value={form.businessName}
          onChange={(e) => update('businessName', e.target.value)} required />
        <Input label="Trading name" value={form.tradingName}
          onChange={(e) => update('tradingName', e.target.value)} />
        <Select label="Business type" value={form.businessType}
          onChange={(e) => update('businessType', e.target.value)} options={TYPES} required />
        <Input label="Existing registration number (if any)" value={form.registrationNumber}
          onChange={(e) => update('registrationNumber', e.target.value)} />
        <Input label="Phone" value={form.phone}
          onChange={(e) => update('phone', e.target.value)} />
        <Input label="Email" type="email" value={form.email}
          onChange={(e) => update('email', e.target.value)} />
        <Input label="TIN (if any)" value={form.tin}
          onChange={(e) => update('tin', e.target.value)} />
        <Input label="Address" value={form.address}
          onChange={(e) => update('address', e.target.value)} full />
      </div>
      <FormActions primaryLabel="Register business" primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/finance/businesses')} />
    </PageWrapper>
  );
}

export default RegisterBusiness;