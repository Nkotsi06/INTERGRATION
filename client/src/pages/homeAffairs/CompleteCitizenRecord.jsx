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
  getCitizenById,
  completeRecord,
  updateCitizen,
} from '../../api/homeAffairsApi';
import { uploadDocument } from '../../api/documentApi';
import { useNotification } from '../../context/NotificationContext';

const emptyForm = {
  fullName: '',
  firstName: '',
  lastName: '',
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

// Facial meta comes back from BiometricEnrollment as:
//   { confirmed: { noSunglasses, noHat, plainBackground },
//     override:  { enabled, reason } }
// A photo is accepted if the officer confirmed all three checks,
// or provided an override with a reason.
function facialMetaSatisfied(meta) {
  if (!meta) return false;
  if (meta.override?.enabled && meta.override?.reason) return true;
  return (
    meta.confirmed?.noSunglasses === true &&
    meta.confirmed?.noHat === true &&
    meta.confirmed?.plainBackground === true
  );
}

function CompleteCitizenRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useNotification();

  const [registration, setRegistration] = useState(null);
  const [existingCitizenId, setExistingCitizenId] = useState(null);
  const [nationalId, setNationalId] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [biometrics, setBiometrics] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEditMode = !!existingCitizenId;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 1. Try to load this as a pending registration (user id).
        const reg = await getRegistrationById(id);
        if (cancelled) return;

        // If the registration is already linked to a citizen, we're in edit mode.
        if (reg && reg.citizen_id) {
          const c = await getCitizenById(reg.citizen_id);
          if (cancelled) return;
          setRegistration(reg);
          setExistingCitizenId(c.id);
          setNationalId(c.national_id || '');
          setForm({
            firstName: c.first_name || '',
            lastName: c.last_name || '',
            fullName: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
            dateOfBirth: c.date_of_birth || '',
            gender: c.gender || '',
            placeOfBirth: c.place_of_birth || '',
            nationality: c.nationality || 'Mosotho',
            phone: c.phone || '',
            email: c.email || '',
            village: '',
            district: '',
            postalAddress: c.address || '',
          });
          return;
        }

        // Otherwise, this is a fresh registration.
        setRegistration(reg || {});
        setForm((prev) => ({
          ...prev,
          fullName: reg?.fullName || '',
          dateOfBirth: reg?.dateOfBirth || '',
          gender: reg?.gender || '',
        }));
      } catch (err) {
        if (!cancelled) {
          setServerError('Could not load this record.');
        }
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
    if (!form.fullName.trim() && !isEditMode) {
      next.fullName = 'Full name is required.';
    }
    if (!form.dateOfBirth) next.dateOfBirth = 'Date of birth is required.';
    if (!form.gender) next.gender = 'Gender is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // In edit mode, no biometric capture is required.
  // In create mode:
  //   - a facial image is required
  //   - the officer must have confirmed or overridden the three checks
  const facialPresent = !!biometrics?.facialImage;
  const facialAccepted = facialMetaSatisfied(biometrics?.facialMeta);
  const biometricsReady = isEditMode || (facialPresent && facialAccepted);

  const handleSave = async () => {
    setServerError(null);
    if (!validate()) return;

    if (!isEditMode && !facialPresent) {
      setServerError('Capture a facial photo before saving.');
      return;
    }
    if (!isEditMode && !facialAccepted) {
      setServerError(
        'Confirm the three officer checks, or provide an override reason, before saving.'
      );
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
        // Save editable fields only. Server ignores anything else.
        await updateCitizen(existingCitizenId, {
          first_name: form.firstName || undefined,
          last_name: form.lastName || undefined,
          place_of_birth: form.placeOfBirth || undefined,
          address: form.postalAddress || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
        });
        success('Record updated');
        navigate(`/home-affairs/citizen/${existingCitizenId}`);
        return;
      }

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
      title={isEditMode ? 'Edit Citizen Record' : 'Complete Citizen Record'}
      showBack
      backPath="/home-affairs/registrations"
      accentColour="#1A5276"
    >
      <h1>{isEditMode ? 'Edit citizen record' : 'Complete citizen record'}</h1>

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
              {registration?.date_registered || registration?.dateRegistered}
            </div>
          </div>
          <div className="form-field form-grid-full">
            <label className="form-label">National ID</label>
            <div className="form-input form-input-readonly">
              {isEditMode && nationalId
                ? nationalId
                : 'Generated automatically when you save'}
            </div>
          </div>
        </div>
      </div>

      {serverError && <Alert type="error" message={serverError} />}

      <div className="form-section">
        <h3 className="form-section-title">Personal information</h3>
        <div className="form-grid">
          {isEditMode ? (
            <>
              <Input
                label="First name"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
              />
              <Input
                label="Last name"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
              />
            </>
          ) : (
            <Input
              label="Full name"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              required
              error={errors.fullName}
              autoComplete="name"
            />
          )}

          <DatePicker
            label="Date of birth"
            value={form.dateOfBirth}
            onChange={(e) => update('dateOfBirth', e.target.value)}
            required
            error={errors.dateOfBirth}
            disabled={isEditMode}
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
            disabled={isEditMode}
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

      {!isEditMode && (
        <>
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
              A facial photograph is required. Fingerprints are optional.
            </p>
            <BiometricEnrollment
              onComplete={setBiometrics}
              requireFingerprints={false}
            />
          </div>

          {facialPresent && !facialAccepted && (
            <Alert
              type="warning"
              message="Confirm the three officer checks (or provide an override reason) before saving."
            />
          )}

          {!facialPresent && (
            <Alert
              type="info"
              message="Capture a facial photo before saving."
            />
          )}
        </>
      )}

      {biometrics && (
        <div className="card card-flat" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Biometric summary</h3>
          <p className="text-muted" style={{ margin: 0 }}>
            {Object.keys(biometrics.fingerprints || {}).length} fingerprints captured
            {biometrics.facialImage ? ' · facial photo captured' : ''}
            {biometrics.facialMeta?.override?.enabled
              ? ' · officer override recorded'
              : biometrics.facialMeta?.confirmed
                ? ' · officer checks confirmed'
                : ''}
          </p>
        </div>
      )}

      <FormActions
        primaryLabel={isEditMode ? 'Save changes' : 'Save record'}
        onPrimary={handleSave}
        primaryLoading={saving}
        primaryDisabled={!biometricsReady}
        onSecondary={handleCancel}
      />
    </PageWrapper>
  );
}

export default CompleteCitizenRecord;