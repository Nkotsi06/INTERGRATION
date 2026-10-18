import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import StepIndicator from '../../components/common/StepIndicator';
import Alert from '../../components/common/Alert';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import SignaturePad from '../../components/signature/SignaturePad';
import LoadingSpinner from '../../components/common/LoadingSpinner';
// import DocumentUpload from '../../components/documents/DocumentUpload'; // OPTIONAL: uncomment to add a birth certificate upload
import { useNotification } from '../../context/NotificationContext';
import apiClient from '../../api/apiClient';

const STEPS = ['Eligibility', 'Your Details', 'Additional Info', 'Signature', 'Branch', 'Review'];

function ApplyNationalId() {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Data state
  const [profile, setProfile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [branches, setBranches] = useState([]);
  const [birthCert, setBirthCert] = useState(null);
  const [existingApp, setExistingApp] = useState(null);

  // Form state
  const [form, setForm] = useState({
    reason: 'FIRST_ISSUE',
    phone: '',
    declaration: false,
    signature: null,
    branchId: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [profileData, branchesResponse, certsData, appsData] = await Promise.allSettled([
          apiClient.get('/citizen/profile'),
          apiClient.get('/settings/branches?ministry=HOME_AFFAIRS'),
          apiClient.get('/citizen/documents'),
          apiClient.get('/citizen/applications'),
        ]);

        if (cancelled) return;

        // Profile
        const profile = profileResponseValue(profileData);
        if (profile) {
          setProfile(profile);
          setForm((prev) => ({ ...prev, phone: profile.phone || '' }));
        }

        // Branches (an endpoint that 404s should not block the whole flow)
        const branchesList = branchesResponseValue(branchesResponse);
        if (Array.isArray(branchesList)) {
          setBranches(branchesList);
        }

        // Photo — comes from the citizen's own biometric record.
        try {
          const blob = await apiClient.get('/citizen/photo', { responseType: 'blob' });
          if (!cancelled) setPhotoUrl(URL.createObjectURL(blob));
        } catch {
          if (!cancelled) setPhotoError(true);
        }

        // Birth certificate check — the citizen must already have a
        // VERIFIED birth certificate on file from Home Affairs.
        const docs = certsResponseValue(certsData) || [];
        const hasBirthCert = docs.some(
          (doc) =>
            doc.document_type_code === 'BIRTH_CERTIFICATE' &&
            doc.status === 'VERIFIED'
        );
        if (!cancelled) setBirthCert(hasBirthCert);

        // Existing application check — only one active ID application
        // at a time.
        const apps = appsResponseValue(appsData) || [];
        const activeApp = apps.find(
          (app) =>
            app.data?.serviceCode === 'NATIONAL_ID_APPLY' &&
            !['REJECTED', 'COMPLETED', 'COLLECTED'].includes(app.status)
        );
        if (!cancelled) setExistingApp(activeApp);
      } catch (err) {
        if (!cancelled) setError('Failed to load application data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Settled-promise helpers ──────────────────────────────────────
  // The original used Promise.all, so one failing endpoint
  // (for example a 404 on /settings/branches) aborted everything.
  // allSettled plus these readers makes each fetch independent.
  function profileResponseValue(settled) {
    if (settled.status !== 'fulfilled') return null;
    return settled.value;
  }
  function branchesResponseValue(settled) {
    if (settled.status !== 'fulfilled') return [];
    return settled.value;
  }
  function certsResponseValue(settled) {
    if (settled.status !== 'fulfilled') return [];
    return settled.value;
  }
  function appsResponseValue(settled) {
    if (settled.status !== 'fulfilled') return [];
    return settled.value;
  }

  // ── Navigation ──────────────────────────────────────────────────
  const canProceedFromStep = (current) => {
    if (current === 1) return !!form.reason;
    if (current === 2) return !!form.phone.trim();
    if (current === 3) return form.declaration === true;
    if (current === 4) return !!form.signature;
    if (current === 5) return !!form.branchId;
    return true;
  };

  const handleNext = () => {
    if (!canProceedFromStep(step)) {
      if (step === 2) return showError('Please enter a contact phone number.');
      if (step === 3) return showError('Please tick the declaration to continue.');
      if (step === 4) return showError('Please provide your signature.');
      if (step === 5) return showError('Please choose a collection branch.');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
  };
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.signature) return showError('Signature is required.');
    if (!form.branchId) return showError('Collection branch is required.');
    if (photoError) {
      return showError(
        'A photo is required. Please visit Home Affairs to have your photo captured before applying.'
      );
    }

    setSubmitting(true);
    try {
      await apiClient.post('/citizen/applications/national-id', {
        reason: form.reason,
        phone: form.phone,
        signature: form.signature,
        branchId: form.branchId,
      });
      success('Application submitted successfully.');
      navigate('/citizen/applications');
    } catch (err) {
      showError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / blocking states ───────────────────────────────────
  if (loading) {
    return (
      <PageWrapper title="Apply for National ID">
        <LoadingSpinner message="Checking eligibility..." />
      </PageWrapper>
    );
  }

  if (existingApp) {
    return (
      <PageWrapper title="Apply for National ID">
        <Alert
          type="info"
          title="Application in progress"
          message={`You already have an active National ID application. Status: ${existingApp.status}`}
        />
        <Button variant="primary" onClick={() => navigate('/citizen/applications')}>
          View My Applications
        </Button>
      </PageWrapper>
    );
  }

  if (!birthCert) {
    return (
      <PageWrapper title="Apply for National ID">
        <Alert
          type="error"
          title="Eligibility Failed"
          message="You need a verified birth certificate on record before you can apply for a National ID."
        />
        <Button
          variant="primary"
          onClick={() => navigate('/citizen/services?ministry=HOME_AFFAIRS')}
        >
          Apply for a Birth Certificate first
        </Button>
      </PageWrapper>
    );
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <PageWrapper title="Apply for National ID" showBack backPath="/citizen/services">
      <h1>National ID Application</h1>
      <StepIndicator current={step} total={STEPS.length} labels={STEPS} />

      {error && <Alert type="error" message={error} />}

      <div className="form-section" style={{ marginTop: 24 }}>
        {step === 1 && (
          <div>
            <h3 className="form-section-title">Reason for Application</h3>
            <Select
              label="Select reason"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              options={[
                { value: 'FIRST_ISSUE', label: 'First Issue' },
                { value: 'LOST', label: 'Replacement (Lost)' },
                { value: 'DAMAGED', label: 'Replacement (Damaged)' },
                { value: 'UPDATE', label: 'Update Details' },
              ]}
              required
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="form-section-title">Confirm Your Details</h3>
            <p className="text-muted">
              These details come from your verified Home Affairs record and
              cannot be edited here. A photo is taken from your biometric
              record — you do not need to upload one.
            </p>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Your photo on record"
                  style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
                />
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    backgroundColor: '#EBF0F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: 13,
                    padding: 8,
                    color: '#7F8C8D',
                  }}
                >
                  {photoError ? 'No photo on record' : 'Loading…'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <Input
                  label="National ID Number (Auto-filled)"
                  value={profile?.nationalId || ''}
                  disabled
                />
                <Input
                  label="Full Name (Auto-filled)"
                  value={profile?.fullName || ''}
                  disabled
                />
                <Input
                  label="Date of Birth (Auto-filled)"
                  value={profile?.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : ''}
                  disabled
                />
                <Input
                  label="Contact Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
            </div>
            {photoError && (
              <Alert
                type="warning"
                message="No photo is on record yet. Home Affairs must capture your photo before you can apply for a National ID."
              />
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="form-section-title">Declaration</h3>
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={form.declaration}
                onChange={(e) =>
                  setForm({ ...form, declaration: e.target.checked })
                }
              />
              <span>
                I declare that the information provided is true and correct
                to the best of my knowledge.
              </span>
            </label>

            {/* OPTIONAL: enable this block only if you want the
                citizen to upload a copy of their birth certificate
                on this form. Default is off because the eligibility
                check already confirms a VERIFIED birth certificate
                is on file.
            <div style={{ marginTop: 24 }}>
              <DocumentUpload
                documentType="BIRTH_CERTIFICATE"
                label="Birth certificate copy (optional)"
                onUpload={async (formData, config) => {
                  formData.append('citizenId', profile?.id || '');
                  await apiClient.post('/documents/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    ...config,
                  });
                }}
              />
            </div>
            */}
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="form-section-title">Signature</h3>
            <p className="text-muted">
              Please sign below to authorise this application.
            </p>
            <SignaturePad
              onSave={(sig) => setForm({ ...form, signature: sig })}
              onClear={() => setForm({ ...form, signature: null })}
            />
          </div>
        )}

        {step === 5 && (
          <div>
            <h3 className="form-section-title">Collection Branch</h3>
            {branches.length === 0 ? (
              <Alert
                type="warning"
                message="No collection branches are available right now. Please try again later."
              />
            ) : (
              <Select
                label="Where would you like to collect your ID?"
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                options={branches.map((b) => ({
                  value: b.id,
                  label: `${b.name}${b.district ? ` (${b.district})` : ''}`,
                }))}
                required
              />
            )}
          </div>
        )}

        {step === 6 && (
          <div>
            <h3 className="form-section-title">Review & Submit</h3>
            <ul
              className="review-list"
              style={{ listStyle: 'none', padding: 0, lineHeight: 1.8 }}
            >
              <li>
                <strong>Reason:</strong>{' '}
                {form.reason.replace(/_/g, ' ').toLowerCase()}
              </li>
              <li>
                <strong>Phone:</strong> {form.phone || '—'}
              </li>
              <li>
                <strong>Branch:</strong>{' '}
                {branches.find((b) => b.id === form.branchId)?.name ||
                  form.branchId ||
                  '—'}
              </li>
              <li>
                <strong>Photo:</strong>{' '}
                {photoUrl ? 'On file (from biometrics)' : 'Missing'}
              </li>
              <li>
                <strong>Signature:</strong>{' '}
                {form.signature ? 'Provided' : 'Missing'}
              </li>
            </ul>
            {photoError && (
              <Alert
                type="warning"
                message="Home Affairs must capture your photo before this application can be submitted."
              />
            )}
          </div>
        )}
      </div>

      <div className="form-actions" style={{ marginTop: 24 }}>
        {step > 1 && (
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
        )}
        {step < 6 ? (
          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={photoError}
          >
            Submit Application
          </Button>
        )}
      </div>
    </PageWrapper>
  );
}

export default ApplyNationalId;