import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import CitizenReadOnlyBlock from '../../components/ministry/CitizenReadOnlyBlock';
import DocumentUpload from '../../components/documents/DocumentUpload';
import useFetch from '../../hooks/useFetch';
import { getProfile } from '../../api/citizenApi';
import { requestClearance } from '../../api/policeApi';
import { uploadDocument } from '../../api/documentApi';
import { useNotification } from '../../context/NotificationContext';

function RequestClearance() {
  const { data: profile } = useFetch(getProfile, []);
  const [form, setForm] = useState({
    purpose: '',
    station: 'MASERU_CENTRAL',
    contactNumber: '',
    email: '',
  });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.purpose || !form.station) {
      setError('Please complete the required fields.');
      return;
    }
    if (!confirmed) {
      setError('Please confirm the information is accurate.');
      return;
    }

    setLoading(true);
    try {
      await requestClearance(form);
      success('Clearance request submitted');
      navigate('/police/cases');
    } catch (err) {
      setError(err.message || 'Could not submit the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Request Clearance Certificate"
      showBack
      backPath="/police/dashboard"
      accentColour="#922B21"
    >
      <h1>Request clearance certificate</h1>
      <p className="text-muted">
        Apply for a certificate confirming your criminal record status.
      </p>

      <CitizenReadOnlyBlock citizen={profile} />

      {error && <Alert type="error" message={error} />}

      <div className="form-section">
        <h3 className="form-section-title">Request details</h3>
        <div className="form-grid">
          <Input
            label="Purpose"
            value={form.purpose}
            onChange={(e) => update('purpose', e.target.value)}
            placeholder="Employment, travel, etc."
            required
          />
          <Select
            label="Collection station"
            value={form.station}
            onChange={(e) => update('station', e.target.value)}
            options={[
              { value: 'MASERU_CENTRAL', label: 'Maseru Central' },
              { value: 'LERIBE', label: 'Leribe Police Station' },
              { value: 'MAFETENG', label: 'Mafeteng Police Station' },
            ]}
            required
          />
          <Input
            label="Contact number"
            value={form.contactNumber}
            onChange={(e) => update('contactNumber', e.target.value)}
            autoComplete="tel"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Supporting document</h3>
        <DocumentUpload
          documentType="NATIONAL_ID"
          label="National ID copy"
          onUpload={async (formData) => {
            await uploadDocument(formData);
            success('Document uploaded');
          }}
        />
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Declaration</h3>
        <Checkbox
          label="I confirm that the information provided is accurate."
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
      </div>

      <FormActions
        primaryLabel="Submit request"
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/police/dashboard')}
      />
    </PageWrapper>
  );
}

export default RequestClearance;