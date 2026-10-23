import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import DatePicker from '../../components/common/DatePicker';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import BiometricEnrollment from '../../components/biometrics/BiometricEnrollment';
import FingerprintPreview from '../../components/biometrics/FingerprintPreview';
import FacialPreview from '../../components/biometrics/FacialPreview';
import {
  getRegistrationById,
  getCitizenById,
  getCitizenBiometrics,
  completeRecord,
  updateCitizen,
  recordEmployment,
  updateEmployment,
} from '../../api/homeAffairsApi';
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

function facialMetaSatisfied(meta) {
  if (!meta) return false;
  if (meta.override?.enabled && meta.override?.reason) return true;
  return (
    meta.confirmed?.noSunglasses === true &&
    meta.confirmed?.noHat === true &&
    meta.confirmed?.plainBackground === true
  );
}

function labelForEmployerType(code) {
  const map = {
    GOVERNMENT: 'Government',
    PRIVATE: 'Private sector',
    SELF_EMPLOYED: 'Self-employed',
    NGO: 'NGO',
    OTHER: 'Other',
  };
  return map[code] || code;
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
  const [biometricsLoading, setBiometricsLoading] = useState(false);
  const [biometricsError, setBiometricsError] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [employment, setEmployment] = useState([]);
  const [employmentEditing, setEmploymentEditing] = useState(null);
  const [employmentError, setEmploymentError] = useState(null);
  const [employmentSaving, setEmploymentSaving] = useState(false);

  const isEditMode = !!existingCitizenId;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const reg = await getRegistrationById(id);
        if (cancelled) return;

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
          setEmployment(c.employmentHistory || []);
          setBiometricsLoading(true);
          try {
            const record = await getCitizenBiometrics(c.id);
            if (!cancelled) setBiometrics(record);
          } catch (err) {
            if (!cancelled) {
              setBiometricsError(
                err.message || "Could not load this citizen's biometrics."
              );
            }
          } finally {
            if (!cancelled) setBiometricsLoading(false);
          }
          return;
        }

        setRegistration(reg || {});
        setForm((prev) => ({
          ...prev,
          fullName: reg?.fullName || '',
          dateOfBirth: reg?.dateOfBirth || '',
          gender: reg?.gender || '',
        }));
      } catch (err) {
        if (!cancelled) setServerError('Could not load this record.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
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

  // --- Biometrics Logic Update ---
  const facialPresent = !!biometrics?.facialImage;
  const facialAccepted = facialMetaSatisfied(biometrics?.facialMeta);
  
  // Check if all 4 fingerprints are captured
  const fingerprintsPresent = 
    biometrics?.fingerprints && 
    Object.keys(biometrics.fingerprints).length === 4;

  // Biometrics are ready if we are editing OR (Face is accepted AND Fingers are captured)
  const biometricsReady = isEditMode || (facialPresent && facialAccepted && fingerprintsPresent);

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
    if (!isEditMode && !fingerprintsPresent) {
      setServerError('Capture all four fingerprints before saving.');
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
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

  const startAddEmployment = () => {
    if (!existingCitizenId) return;
    setEmploymentError(null);
    setEmploymentEditing({
      id: null,
      employerName: '',
      employerType: 'GOVERNMENT',
      positionTitle: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      notes: '',
    });
  };

  const startEditEmployment = (row) => {
    setEmploymentError(null);
    setEmploymentEditing({
      id: row.id,
      employerName: row.employer_name,
      employerType: row.employer_type,
      positionTitle: row.position_title || '',
      startDate: row.start_date || '',
      endDate: row.end_date || '',
      isCurrent: row.is_current,
      notes: row.notes || '',
    });
  };

  const cancelEmployment = () => {
    setEmploymentEditing(null);
    setEmploymentError(null);
  };

  const saveEmployment = async () => {
    if (!employmentEditing) return;
    if (!employmentEditing.employerName.trim()) {
      setEmploymentError('Employer name is required.');
      return;
    }
    if (!employmentEditing.startDate) {
      setEmploymentError('Start date is required.');
      return;
    }
    setEmploymentSaving(true);
    try {
      const payload = {
        employerName: employmentEditing.employerName.trim(),
        employerType: employmentEditing.employerType,
        positionTitle: employmentEditing.positionTitle.trim() || null,
        startDate: employmentEditing.startDate,
        endDate: employmentEditing.isCurrent ? null : (employmentEditing.endDate || null),
        isCurrent: employmentEditing.isCurrent,
        notes: employmentEditing.notes.trim() || null,
      };
      if (employmentEditing.id) {
        await updateEmployment(existingCitizenId, employmentEditing.id, payload);
      } else {
        await recordEmployment(existingCitizenId, payload);
      }
      const fresh = await getCitizenById(existingCitizenId);
      setEmployment(fresh?.employmentHistory || []);
      setEmploymentEditing(null);
    } catch (err) {
      setEmploymentError(err.message || 'Could not save employment history.');
    } finally {
      setEmploymentSaving(false);
    }
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

      {isEditMode && (
        <div className="form-section">
          <div className="form-section-header">
            <h3 className="form-section-title">Employment history</h3>
            {!employmentEditing && (
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={startAddEmployment}
              >
                Add employment
              </button>
            )}
          </div>

          <p className="text-muted">
            Record the citizen's jobs. Pensions staff use government service
            years to assess Civil Service Pension eligibility.
          </p>

          {employmentError && <Alert type="error" message={employmentError} />}

          {employment.length === 0 && !employmentEditing && (
            <p className="text-muted">No employment history recorded.</p>
          )}

          {employment.length > 0 && (
            <ul className="employment-history-list">
              {employment.map((row) => (
                <li key={row.id} className="card card-flat" style={{ padding: 12 }}>
                  <div>
                    <strong>{row.employer_name}</strong>
                    <span className="text-muted"> · {labelForEmployerType(row.employer_type)}</span>
                    {row.position_title && (
                      <span className="text-muted"> · {row.position_title}</span>
                    )}
                  </div>
                  <div className="text-muted">
                    {row.start_date} → {row.is_current ? 'Present' : row.end_date || '—'}
                  </div>
                  {!employmentEditing && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => startEditEmployment(row)}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {employmentEditing && (
            <div className="card card-flat" style={{ padding: 12, marginTop: 8 }}>
              <h4 style={{ marginTop: 0 }}>
                {employmentEditing.id ? 'Edit employment' : 'Add employment'}
              </h4>
              <div className="form-grid">
                <Input
                  label="Employer name"
                  value={employmentEditing.employerName}
                  onChange={(e) =>
                    setEmploymentEditing({ ...employmentEditing, employerName: e.target.value })
                  }
                  required
                />
                <Select
                  label="Employer type"
                  value={employmentEditing.employerType}
                  onChange={(e) =>
                    setEmploymentEditing({ ...employmentEditing, employerType: e.target.value })
                  }
                  options={[
                    { value: 'GOVERNMENT', label: 'Government' },
                    { value: 'PRIVATE', label: 'Private sector' },
                    { value: 'SELF_EMPLOYED', label: 'Self-employed' },
                    { value: 'NGO', label: 'NGO' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                  required
                />
                <Input
                  label="Position"
                  value={employmentEditing.positionTitle}
                  onChange={(e) =>
                    setEmploymentEditing({ ...employmentEditing, positionTitle: e.target.value })
                  }
                />
                <DatePicker
                  label="Start date"
                  value={employmentEditing.startDate}
                  onChange={(e) =>
                    setEmploymentEditing({ ...employmentEditing, startDate: e.target.value })
                  }
                  required
                />
                <DatePicker
                  label="End date"
                  value={employmentEditing.endDate}
                  onChange={(e) =>
                    setEmploymentEditing({ ...employmentEditing, endDate: e.target.value })
                  }
                  disabled={employmentEditing.isCurrent}
                />
                <div className="form-field">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      checked={employmentEditing.isCurrent}
                      onChange={(e) =>
                        setEmploymentEditing({
                          ...employmentEditing,
                          isCurrent: e.target.checked,
                          endDate: e.target.checked ? '' : employmentEditing.endDate,
                        })
                      }
                    />
                    <span>Current job</span>
                  </label>
                </div>
                <Input
                  label="Notes"
                  value={employmentEditing.notes}
                  onChange={(e) =>
                    setEmploymentEditing({ ...employmentEditing, notes: e.target.value })
                  }
                  full
                />
              </div>
              <div className="form-actions">
                <div className="form-actions-primary-group">
                  <Button variant="secondary" onClick={cancelEmployment} disabled={employmentSaving}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={saveEmployment} loading={employmentSaving}>
                    Save employment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isEditMode && (
        <div className="form-section">
          <h3 className="form-section-title">Biometrics on record</h3>
          {biometricsLoading ? (
            <p className="text-muted">Loading biometrics…</p>
          ) : biometricsError ? (
            <Alert type="error" message={biometricsError} />
          ) : (
            <>
              <h4>Fingerprints</h4>
              <FingerprintPreview fingerprints={biometrics?.fingerprints || {}} />
              <h4>Facial photo</h4>
              <FacialPreview image={biometrics?.facialImage} />
            </>
          )}
        </div>
      )}

      {!isEditMode && (
        <>
          <div className="form-section">
            <h3 className="form-section-title">Biometric enrollment</h3>
            <p className="text-muted">
              A facial photograph and all four fingerprints are required.
            </p>
            
            {/* Changed requireFingerprints to true */}
            <BiometricEnrollment
              onComplete={setBiometrics}
              requireFingerprints={true}
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
          
          {!fingerprintsPresent && (
            <Alert
              type="info"
              message="Capture all four fingerprints before saving."
            />
          )}
        </>
      )}

      {biometrics && !isEditMode && (
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