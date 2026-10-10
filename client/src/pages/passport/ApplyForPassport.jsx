import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import ProgressIndicator from '../../components/common/ProgressIndicator';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import DocumentUpload from '../../components/documents/DocumentUpload';
import useFetch from '../../hooks/useFetch';
import { getProfile } from '../../api/citizenApi';
import { applyForPassport } from '../../api/passportApi';
import { uploadDocument } from '../../api/documentApi';
import { useNotification } from '../../context/NotificationContext';

function ApplyForPassport() {
  const { data: profile } = useFetch(getProfile, []);
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({
    passportType: 'ORDINARY',
    reason: '',
    collectionOffice: 'MASERU',
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

      <ProgressIndicator
        currentStep={step}
        totalSteps={4}
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
            onUpload={async (formData) => {
              await uploadDocument(formData);
              success('Document uploaded');
            }}
          />
          <DocumentUpload
            documentType="BIRTH_CERTIFICATE"
            label="Birth certificate"
            onUpload={async (formData) => {
              await uploadDocument(formData);
              success('Document uploaded');
            }}
          />
          <DocumentUpload
            documentType="PASSPORT_PHOTO"
            label="Passport photograph"
            onUpload={async (formData) => {
              await uploadDocument(formData);
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
            </div>
          </div>

          <Checkbox
            label="I confirm that my details and supporting documents are correct."
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />

          <FormActions
            primaryLabel="Submit application"
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