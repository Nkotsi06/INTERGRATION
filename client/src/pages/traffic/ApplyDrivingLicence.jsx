import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useServiceFee from '../../hooks/useServiceFees';
import { applyForDrivingLicence, getPassedDrivingTests } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function ApplyDrivingLicence() {
  const { fee, currency } = useServiceFee('TRAFFIC', 'DRIVING_LICENCE');
  const [form, setForm] = useState({
    licenceType: 'ORDINARY',
    testReference: '',
    method: 'MOBILE_MONEY',
    mobile: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testReferences, setTestReferences] = useState([]);
  const [referencesLoading, setReferencesLoading] = useState(true);
  const navigate = useNavigate();
  const { success } = useNotification();

  useEffect(() => {
    let cancelled = false;
    getPassedDrivingTests()
      .then((tests) => {
        if (!cancelled) {
          setTestReferences(Array.isArray(tests) ? tests : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Could not load approved driving test references.');
        }
      })
      .finally(() => {
        if (!cancelled) setReferencesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!form.testReference) {
      setError('Test reference number is required.');
      return;
    }
    if (fee > 0 && form.method === 'MOBILE_MONEY' && !form.mobile.trim()) {
      setError('Please enter your mobile number for payment.');
      return;
    }
    setLoading(true);
    try {
      const result = await applyForDrivingLicence({ ...form, amount: fee });
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
      title="Apply for a Driving Licence"
      showBack
      backPath="/traffic/dashboard"
      accentColour="#B9770E"
    >
      <h1>Apply for a driving licence</h1>

      {error && <Alert type="error" message={error} />}

      <Select
        label="Licence type"
        value={form.licenceType}
        onChange={(e) => setForm({ ...form, licenceType: e.target.value })}
        options={[
          { value: 'ORDINARY', label: 'Ordinary' },
          { value: 'PROFESSIONAL', label: 'Professional' },
        ]}
        required
      />

      <Select
        label="Test reference number"
        value={form.testReference}
        onChange={(e) => setForm({ ...form, testReference: e.target.value })}
        options={testReferences.map((test) => ({
          value: test.test_reference,
          label: `${test.test_reference} — ${test.test_type} (${test.test_date})`,
        }))}
        disabled={referencesLoading || testReferences.length === 0}
        required
      />
      {!referencesLoading && testReferences.length === 0 && (
        <Alert type="info" message="A passed driving test is required before applying for a licence." />
      )}

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

export default ApplyDrivingLicence;