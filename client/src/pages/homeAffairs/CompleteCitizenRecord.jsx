import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import DatePicker from '../../components/common/DatePicker';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import DocumentUpload from '../../components/documents/DocumentUpload';
import BiometricEnrollment from '../../components/biometrics/BiometricEnrollment';
import {
  getRegistrationById,
  completeRecord,
} from '../../api/homeAffairsApi';
import { uploadDocument } from '../../api/documentApi';
import { useNotification } from '../../context/NotificationContext';

const initialForm = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  placeOfBirth: '',
  nationality: 'Mosotho',
  phone: '',
  email: '',
  village: '',
  district: '',
  postalAddress: '',
};

function CompleteCitizenRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useNotification();

  const [registration, setRegistration] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [biometrics, setBiometrics] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getRegistrationById(id);
        if (cancelled) return;
        setRegistration(data);
        setForm((prev) => ({
          ...prev,
          fullName: data.fullName || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          placeOfBirth: data.placeOfBirth || '',
          phone: data.phone || '',
          email: data.email || '',
          village: data.village || '',
          district: data.district || '',
          postalAddress: data.postalAddress || '',
        }));
      } catch (err) {
        if (!cancelled) setServerError('Could not load this registration.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    if (!form.dateOfBirth) next.dateOfBirth = 'Date of birth is required.';
    if (!form.gender) next.gender = 'Gender is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ─── FIX: fingerprints optional, facial mandatory ────────────────────
  const biometricsReady = !!biometrics?.facialImage;
  // ─────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setServerError(null);

    if (!validate()) return;

    if (!biometricsReady) {
      setServerError('Capture a facial photo before saving.');
      return;
    }

    setSaving(true);
    try {
      const result = await completeRecord(id, { ...form, biometrics });

      if (!result?.citizenId) {
        setServerError('Server did not return a citizen ID.');
        return;
      }

      success('Record saved');
      navigate(`/home-affairs/record/${result.citizenId}/saved`, {
        state: { citizen: result },
      });
    } catch (err) {
      setServerError(
        err.message || 'Could not save the record. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/home-affairs/registrations');
  };

  if (loading) {
    return (
      <PageWrapper title="Complete Citizen Record" accentColour="#1A5276">
        <p className="text-muted">Loading…</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Complete Citizen Record"
      showBack
      backPath="/home-affairs/registrations"
      accentColour="#1A5276"
    >
      <h1>Complete citizen record</h1>

      <div className="card card-flat" style={{ marginBottom: 24 }}>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Username</label>
            <div className="form-input form-input-readonly">
              {registration?.username}
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Date registered</label>
            <div className="form-input form-input-readonly">
              {registration?.dateRegistered}
            </div>
          </div>
          <div className="form-field form-grid-full">
            <label className="form-label">National ID</label>
            <div className="form-input form-input-readonly">
              Generated automatically when you save
            </div>
          </div>
        </div>
      </div>

      {serverError && <Alert type="error" message={serverError} />}

      <div className="form-section">
        <h3 className="form-section-title">Personal information</h3>
        <div className="form-grid">
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            required
            error={errors.fullName}
            autoComplete="name"
          />
          <DatePicker
            label="Date of birth"
            value={form.dateOfBirth}
            onChange={(e) => update('dateOfBirth', e.target.value)}
            required
            error={errors.dateOfBirth}
          />
          <Select
            label="Gender"
            value={form.gender}
            onChange={(e) => update('gender', e.target.value)}
            options={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'OTHER', label: 'Other' },
            ]}
            required
            error={errors.gender}
          />
          <Input
            label="Place of birth"
            value={form.placeOfBirth}
            onChange={(e) => update('placeOfBirth', e.target.value)}
          />
          <Input
            label="Nationality"
            value={form.nationality}
            onChange={(e) => update('nationality', e.target.value)}
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Contact and address</h3>
        <div className="form-grid">
          <Input
            label="Phone number"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            autoComplete="tel"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Village"
            value={form.village}
            onChange={(e) => update('village', e.target.value)}
          />
          <Input
            label="District"
            value={form.district}
            onChange={(e) => update('district', e.target.value)}
          />
          <Input
            label="Postal address"
            value={form.postalAddress}
            onChange={(e) => update('postalAddress', e.target.value)}
            full
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Documents</h3>
        <Alert
          type="info"
          message="Documents uploaded now will be linked to the citizen when you save the record."
        />
        <DocumentUpload
          documentType="NATIONAL_ID"
          label="Identity document"
          onUpload={async (formData) => {
            formData.append('registrationId', id);
            await uploadDocument(formData);
            success('Document uploaded');
          }}
        />
        <DocumentUpload
          documentType="BIRTH_CERTIFICATE"
          label="Birth certificate"
          onUpload={async (formData) => {
            formData.append('registrationId', id);
            await uploadDocument(formData);
            success('Document uploaded');
          }}
        />
        <DocumentUpload
          documentType="PASSPORT_PHOTO"
          label="Passport photograph"
          onUpload={async (formData) => {
            formData.append('registrationId', id);
            await uploadDocument(formData);
            success('Document uploaded');
          }}
        />
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Biometric enrollment</h3>
        <p className="text-muted">
          Capture a facial photograph. Fingerprints are optional for this
          prototype.
        </p>
        <BiometricEnrollment onComplete={setBiometrics} />
      </div>

      {biometrics && (
        <div className="card card-flat" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Ready to save</h3>
          <p className="text-muted" style={{ margin: 0 }}>
            {Object.keys(biometrics.fingerprints || {}).length} fingerprints
            captured
            {biometrics.facialImage ? ' · facial photo captured' : ''}
          </p>
        </div>
      )}

      {!biometricsReady && (
        <Alert
          type="info"
          message="Capture a facial photo before saving."
        />
      )}

      <FormActions
        primaryLabel="Save record"
        onPrimary={handleSave}
        primaryLoading={saving}
        primaryDisabled={!biometricsReady}
        onSecondary={handleCancel}
      />
    </PageWrapper>
  );
}

export default CompleteCitizenRecord;