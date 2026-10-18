import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import StepIndicator from '../../components/common/StepIndicator';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import useFetch from '../../hooks/useFetch';
import useServiceFee from '../../hooks/useServiceFees';
import { getProfile } from '../../api/citizenApi';
import apiClient from '../../api/apiClient';
import { applyForPassport, getCurrentPassport } from '../../api/passportApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function ApplyForPassport() {
  const { data: profile } = useFetch(getProfile, []);
  const { data: currentPassport, loading: passportLoading } = useFetch(getCurrentPassport, []);
  const [searchParams] = useSearchParams();
  const isRenewal = searchParams.get('type') === 'renewal';
  const { fee, currency } = useServiceFee(
    'PASSPORT',
    isRenewal ? 'PASSPORT_RENEWAL' : 'PASSPORT_NEW'
  );
  const [step, setStep] = useState(1);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const [details, setDetails] = useState({
    passportType: 'ORDINARY',
    reason: isRenewal ? 'RENEWAL' : '',
    collectionOffice: 'MASERU',
    method: 'MOBILE_MONEY',
    mobile: '',
  });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  useEffect(() => {
    let objectUrl;
    let cancelled = false;
    apiClient.get('/citizen/photo', { responseType: 'blob' })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPhotoUrl(objectUrl);
      })
      .catch((err) => {
        if (!cancelled) {
          setPhotoError(err.message || 'Could not load your Home Affairs photo.');
        }
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (isRenewal && !currentPassport) {
      setError('No issued passport was found to renew.');
      return;
    }
    if (!photoUrl || !profile?.nationalId) {
      setError(photoError || 'Your Home Affairs photo and National ID must be available before applying.');
      return;
    }
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
      const result = await applyForPassport({
        ...details,
        isRenewal,
        nationalId: profile.nationalId,
        amount: fee,
      });
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
      title={isRenewal ? 'Renew Passport' : 'Apply for Passport'}
      showBack
      backPath="/passport/dashboard"
      accentColour="#17A2B8"
    >
      <h1>{isRenewal ? 'Renew passport' : 'Apply for passport'}</h1>

      <StepIndicator
        current={step}
        total={3}
        labels={['Review info', 'Passport details', 'Review & submit']}
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
          {isRenewal && (
            <div className="card card-flat">
              <h3>Existing passport</h3>
              {passportLoading ? (
                <p className="text-muted">Loading your passport information…</p>
              ) : (
                <div className="form-grid">
                  <ReadOnly label="Passport number" value={currentPassport?.passport_number} />
                  <ReadOnly label="Passport type" value={currentPassport?.passport_type} />
                  <ReadOnly label="Issued" value={currentPassport?.issue_date} />
                  <ReadOnly label="Expires" value={currentPassport?.expiry_date} />
                  <ReadOnly label="Collection office" value={currentPassport?.collection_office} />
                </div>
              )}
            </div>
          )}
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
              placeholder={isRenewal ? 'Passport renewal' : 'First passport, replacement, etc.'}
              full
            />
          </div>
          <div className="form-section">
            <h3 className="form-section-title">Home Affairs photograph</h3>
            <p className="text-muted">
              Your verified Home Affairs photo and National ID will be used. No separate photo upload is needed.
            </p>
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Photo on your Home Affairs identity record"
                style={{ width: 140, height: 170, objectFit: 'cover', borderRadius: 4 }}
              />
            )}
            {photoError && <Alert type="error" message={photoError} />}
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
          <div className="card card-flat">
            <h3>Application summary</h3>
            <div className="form-grid">
              <ReadOnly label="Full name" value={profile?.fullName} />
              <ReadOnly label="National ID" value={profile?.nationalId} />
              {isRenewal && (
                <ReadOnly label="Existing passport" value={currentPassport?.passport_number} />
              )}
              <ReadOnly label="Passport type" value={details.passportType} />
              <ReadOnly label="Collection office" value={details.collectionOffice} />
              {photoUrl && <p className="text-muted">Home Affairs photo will be used.</p>}
              {fee > 0 && (
                <ReadOnly label="Application fee" value={formatCurrency(fee, currency)} />
              )}
              {fee > 0 && (
                <ReadOnly label="Payment method" value={details.method} />
              )}
            </div>
          </div>

          <Checkbox
            label="I confirm that my details and existing Home Affairs records are correct."
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
            onSecondary={() => setStep(2)}
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