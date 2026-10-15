import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import StepIndicator from '../../components/common/StepIndicator';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import DocumentUpload from '../../components/documents/DocumentUpload';
import useFetch from '../../hooks/useFetch';
import useServiceFee from '../../hooks/useServiceFees';
import { getProfile } from '../../api/citizenApi';
import { applyForPassport } from '../../api/passportApi';
import { uploadDocument } from '../../api/documentApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function ApplyForPassport() {
  const { data: profile } = useFetch(getProfile, []);
  const { fee, currency } = useServiceFee('PASSPORT', 'PASSPORT_APPLY');
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({
    passportType: 'ORDINARY',
    reason: '',
    collectionOffice: 'MASERU',
    method: 'MOBILE_MONEY',
    mobile: '',
  });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const handleSubmit = async () => {
    setError(null);
    if (!confirmed) {
      setError('Please confirm your information before submitting.');
      return;
    }
    if (details.method === 'MOBILE_MONEY' && !details.mobile.trim()) {
      setError('Please enter your mobile number for payment.');
      return;
    }
    setLoading(true);
    try {
      const result = await applyForPassport(details);
      success('Application submitted');
      navigate('/passport/confirmation', { state: { result } });
    } catch (err) {
      setError(err.message || 'Could not submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Apply for Passport"
      showBack
      backPath="/passport/dashboard"
      accentColour="#17A2B8"
    >
      <h1>Apply for passport</h1>

      <StepIndicator
        current={step}
        total={4}
        labels={['Review info', 'Passport details', 'Documents', 'Review & submit']}
      />

      {error && <Alert type="error" message={error} />}

      {step === 1 && (
        <>
          <p className="text-muted">
            Your personal details come from Home Affairs and are read-only.
          </p>
          <CitizenReadOnlyBlock citizen={profile} />
          <FormActions
            primaryLabel="Continue"
            onPrimary={() => setStep(2)}
            onSecondary={() => navigate('/passport/dashboard')}
          />
        </>
      )}

      {step === 2 && (
        <>
          <div className="form-grid">
            <Select
              label="Passport type"
              value={details.passportType}
              onChange={(e) => setDetails({ ...details, passportType: e.target.value })}
              options={[
                { value: 'ORDINARY', label: 'Ordinary passport' },
                { value: 'OFFICIAL', label: 'Official passport' },
              ]}
              required
            />
            <Select
              label="Collection office"
              value={details.collectionOffice}
              onChange={(e) => setDetails({ ...details, collectionOffice: e.target.value })}
              options={[
                { value: 'MASERU', label: 'Maseru Passport Office' },
                { value: 'LERIBE', label: 'Leribe Passport Office' },
              ]}
              required
            />
            <Input
              label="Reason for application"
              value={details.reason}
              onChange={(e) => setDetails({ ...details, reason: e.target.value })}
              placeholder="First passport, replacement, etc."
              full
            />
          </div>

          {fee > 0 && (
            <div className="form-section">
              <h3 className="form-section-title">Payment</h3>
              <p className="text-muted">
                Application fee: <strong>{formatCurrency(fee, currency)}</strong>
              </p>
              <div className="form-grid">
                <Select
                  label="Payment method"
                  value={details.method}
                  onChange={(e) => setDetails({ ...details, method: e.target.value })}
                  options={[
                    { value: 'MOBILE_MONEY', label: 'Mobile money' },
                    { value: 'BANK_TRANSFER', label: 'Bank transfer' },
                    { value: 'CARD', label: 'Card' },
                  ]}
                  required
                />
                {details.method === 'MOBILE_MONEY' && (
                  <Input
                    label="Mobile number"
                    value={details.mobile}
                    onChange={(e) => setDetails({ ...details, mobile: e.target.value })}
                    placeholder="+266 5888 2140"
                    required
                  />
                )}
              </div>
            </div>
          )}

          <FormActions
            primaryLabel="Continue"
            onPrimary={() => setStep(3)}
            onSecondary={() => setStep(1)}
          />
        </>
      )}

      {step === 3 && (
        <>
          <DocumentUpload
            documentType="NATIONAL_ID"
            label="National ID copy"
            onUpload={async (formData, config) => {
              await uploadDocument(formData, config);
              success('Document uploaded');
            }}
          />
          <DocumentUpload
            documentType="BIRTH_CERTIFICATE"
            label="Birth certificate"
            onUpload={async (formData, config) => {
              await uploadDocument(formData, config);
              success('Document uploaded');
            }}
          />
          <DocumentUpload
            documentType="PASSPORT_PHOTO"
            label="Passport photograph"
            onUpload={async (formData, config) => {
              await uploadDocument(formData, config);
              success('Document uploaded');
            }}
          />

          <FormActions
            primaryLabel="Continue"
            onPrimary={() => setStep(4)}
            onSecondary={() => setStep(2)}
          />
        </>
      )}

      {step === 4 && (
        <>
          <div className="card card-flat">
            <h3>Application summary</h3>
            <div className="form-grid">
              <ReadOnly label="Full name" value={profile?.fullName} />
              <ReadOnly label="National ID" value={profile?.nationalId} />
              <ReadOnly label="Passport type" value={details.passportType} />
              <ReadOnly label="Collection office" value={details.collectionOffice} />
              {fee > 0 && (
                <ReadOnly label="Application fee" value={formatCurrency(fee, currency)} />
              )}
              {fee > 0 && (
                <ReadOnly label="Payment method" value={details.method} />
              )}
            </div>
          </div>

          <Checkbox
            label="I confirm that my details and supporting documents are correct."
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />

          <FormActions
            primaryLabel={
              fee > 0
                ? `Pay ${formatCurrency(fee, currency)} and submit`
                : 'Submit application'
            }
            primaryLoading={loading}
            onPrimary={handleSubmit}
            onSecondary={() => setStep(3)}
          />
        </>
      )}
    </PageWrapper>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div className="form-input form-input-readonly">{value || '—'}</div>
    </div>
  );
}

export default ApplyForPassport;