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
  const [branches, setBranches] = useState([]);
  const [birthCert, setBirthCert] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
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
    async function load() {
      try {
        // Fetch profile, photo, branches, and birth certificates
        const [profileData, branchesData, certsData] = await Promise.all([
          apiClient.get('/citizen/profile'),
          apiClient.get('/settings/branches'), // Assuming a public branches route exists
          apiClient.get('/citizen/documents'),
        ]);

        setProfile(profileData);
        setForm((prev) => ({ ...prev, phone: profileData.phone || '' }));
        setBranches(branchesData || []);

        // Fetch Photo
        apiClient.get('/citizen/photo', { responseType: 'blob' })
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            setPhotoUrl(url);
          })
          .catch(() => setPhotoUrl(null));

        // Check Birth Certificate
        const hasBirthCert = certsData.some(
          (doc) => doc.document_type_code === 'BIRTH_CERTIFICATE' && doc.status === 'VERIFIED'
        );
        setBirthCert(hasBirthCert);

        // Check existing applications for ID
        const appsData = await apiClient.get('/citizen/applications');
        const activeApp = appsData.find(
          (app) => app.data?.serviceCode === 'NATIONAL_ID_APPLY' && 
          !['REJECTED', 'COMPLETED', 'COLLECTED'].includes(app.status)
        );
        
        setExistingApp(activeApp);
        setIsEligible(hasBirthCert && !activeApp);

        // If no birth cert, stop at step 1
        if (!hasBirthCert) {
           setStep(1);
        }
      } catch (err) {
        setError('Failed to load application data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleNext = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!form.signature) return showError('Signature is required.');
    if (!form.branchId) return showError('Collection branch is required.');
    
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

  if (loading) return <PageWrapper title="Apply for National ID"><LoadingSpinner message="Checking eligibility..." /></PageWrapper>;

  if (existingApp) {
    return (
      <PageWrapper title="Apply for National ID">
        <Alert type="info" title="Application in progress" message={`You already have an active National ID application. Status: ${existingApp.status}`} />
        <Button variant="primary" onClick={() => navigate('/citizen/applications')}>View My Applications</Button>
      </PageWrapper>
    );
  }

  if (!birthCert) {
    return (
      <PageWrapper title="Apply for National ID">
        <Alert type="error" title="Eligibility Failed" message="You need a verified birth certificate on record before you can apply for a National ID." />
        <Button variant="primary" onClick={() => navigate('/citizen/services?ministry=HOME_AFFAIRS')}>Apply for a Birth Certificate first</Button>
      </PageWrapper>
    );
  }

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
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="form-section-title">Confirm Your Details</h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              {photoUrl && (
                <img src={photoUrl} alt="Citizen" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              )}
              <div style={{ flex: 1 }}>
                <Input label="National ID Number (Auto-filled)" value={profile.nationalId} disabled />
                <Input label="Full Name (Auto-filled)" value={profile.fullName} disabled />
                <Input label="Date of Birth (Auto-filled)" value={profile.dateOfBirth} disabled />
                <Input label="Contact Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="form-section-title">Declaration</h3>
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={form.declaration}
                onChange={(e) => setForm({ ...form, declaration: e.target.checked })}
              />
              <span>I declare that the information provided is true and correct to the best of my knowledge.</span>
            </label>
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="form-section-title">Signature</h3>
            <p className="text-muted">Please sign below to authorise this application.</p>
            <SignaturePad onSave={(sig) => setForm({ ...form, signature: sig })} />
          </div>
        )}

        {step === 5 && (
          <div>
            <h3 className="form-section-title">Collection Branch</h3>
            <Select
              label="Where would you like to collect your ID?"
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              options={branches.map((b) => ({ value: b.id, label: `${b.name} (${b.district})` }))}
              required
            />
          </div>
        )}

        {step === 6 && (
          <div>
            <h3 className="form-section-title">Review & Submit</h3>
            <ul className="review-list" style={{ listStyle: 'none', padding: 0, lineHeight: 1.8 }}>
              <li><strong>Reason:</strong> {form.reason}</li>
              <li><strong>Phone:</strong> {form.phone}</li>
              <li><strong>Branch:</strong> {branches.find(b => b.id === form.branchId)?.name}</li>
              <li><strong>Signature:</strong> {form.signature ? 'Provided' : 'Missing'}</li>
            </ul>
          </div>
        )}
      </div>

      <div className="form-actions" style={{ marginTop: 24 }}>
        {step > 1 && <Button variant="secondary" onClick={handleBack}>Back</Button>}
        {step < 6 ? (
          <Button 
            variant="primary" 
            onClick={handleNext}
            disabled={step === 3 && !form.declaration}
          >
            Next
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            Submit Application
          </Button>
        )}
      </div>
    </PageWrapper>
  );
}

export default ApplyNationalId;