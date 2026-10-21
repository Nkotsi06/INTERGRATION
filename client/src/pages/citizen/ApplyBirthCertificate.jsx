import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { submitBirthApplication } from '../../api/birthApplicationApi';

const ACCEPTED = '.pdf,.jpg,.jpeg,application/pdf,image/jpeg';

function ApplyBirthCertificate() {
  const [form, setForm] = useState({
    applicantType: 'GUARDIAN',
    applicantFullName: '',
    applicantEmail: '',
    applicantPhone: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    placeOfBirth: '',
    motherFullName: '',
    motherNationalId: '',
    fatherFullName: '',
    fatherNationalId: '',
    guardianFullName: '',
    guardianNationalId: '',
  });
  const [files, setFiles] = useState({
    parentNationalIds: [],
    religiousConfirmation: null,
    chiefLetter: null,
    medicalOrHealth: null,
  });
  const [error, setError] = useState(null);
  const [application, setApplication] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setFile = (field, value) => setFiles((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    if (!files.parentNationalIds.length || !files.religiousConfirmation ||
        !files.chiefLetter || !files.medicalOrHealth) {
      setError('Upload parent/guardian ID(s), a religious confirmation letter, a chief’s letter, and a medical certificate or health booklet.');
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    files.parentNationalIds.forEach((file) => payload.append('parentNationalIds', file));
    payload.append('religiousConfirmation', files.religiousConfirmation);
    payload.append('chiefLetter', files.chiefLetter);
    payload.append('medicalOrHealth', files.medicalOrHealth);

    setSubmitting(true);
    try {
      const result = await submitBirthApplication(payload);
      setApplication(result);
    } catch (requestError) {
      setError(requestError.message || 'Could not submit your birth certificate application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (application) {
    return (
      <PageWrapper title="Birth certificate application received">
        <h1>Application received</h1>
        <Alert
          type="success"
          title="Your documents have been submitted"
          message="A Home Affairs / Civil Registry officer will review your application online. No physical visit is required after approval."
        />
        <div className="form-section">
          <strong>Reference number</strong>
          <p>{application.reference_number}</p>
          <strong>Status</strong>
          <p>{application.status}</p>
        </div>
        <Link to="/">Return to the public home page</Link>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Apply for a birth certificate" showBack backPath="/">
      <h1>Apply for a birth certificate</h1>
      <p className="text-muted">
        A parent or guardian may apply for a child aged 0–16. Adults applying late must apply for themselves.
      </p>
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-section">
          <h2 className="form-section-title">Applicant</h2>
          <Select
            label="Applying as"
            value={form.applicantType}
            onChange={(event) => update('applicantType', event.target.value)}
            options={[
              { value: 'GUARDIAN', label: 'Parent or guardian of a child aged 0–16' },
              { value: 'SELF', label: 'Adult applying late for myself' },
            ]}
            required
          />
          <Input label="Applicant full name" value={form.applicantFullName} onChange={(event) => update('applicantFullName', event.target.value)} required />
          <Input label="Contact email" type="email" value={form.applicantEmail} onChange={(event) => update('applicantEmail', event.target.value)} required />
          <Input label="Contact phone" value={form.applicantPhone} onChange={(event) => update('applicantPhone', event.target.value)} />
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Child / applicant details</h2>
          <Input label="First and middle names" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} required />
          <Input label="Surname" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} required />
          <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={(event) => update('dateOfBirth', event.target.value)} required />
          <Select
            label="Gender"
            value={form.gender}
            onChange={(event) => update('gender', event.target.value)}
            options={[
              { value: '', label: 'Select gender' },
              { value: 'FEMALE', label: 'Female' },
              { value: 'MALE', label: 'Male' },
              { value: 'OTHER', label: 'Other' },
            ]}
            required
          />
          <Input label="Place of birth" value={form.placeOfBirth} onChange={(event) => update('placeOfBirth', event.target.value)} required />
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Parents and guardian</h2>
          <Input label="Mother / parent full name" value={form.motherFullName} onChange={(event) => update('motherFullName', event.target.value)} required />
          <Input label="Mother / parent National ID (if known)" value={form.motherNationalId} onChange={(event) => update('motherNationalId', event.target.value)} />
          <Input label="Father / parent full name (if applicable)" value={form.fatherFullName} onChange={(event) => update('fatherFullName', event.target.value)} />
          <Input label="Father / parent National ID (if known)" value={form.fatherNationalId} onChange={(event) => update('fatherNationalId', event.target.value)} />
          {form.applicantType === 'GUARDIAN' && (
            <>
              <Input label="Guardian full name (if not a parent)" value={form.guardianFullName} onChange={(event) => update('guardianFullName', event.target.value)} />
              <Input label="Guardian National ID (if applicable)" value={form.guardianNationalId} onChange={(event) => update('guardianNationalId', event.target.value)} />
            </>
          )}
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Required documents</h2>
          <FileField
            label="Parents’ National ID(s) (one or two files)"
            multiple
            files={files.parentNationalIds}
            onChange={(event) => setFile('parentNationalIds', Array.from(event.target.files || []).slice(0, 2))}
          />
          <FileField label="Christian or religious confirmation letter" files={files.religiousConfirmation} onChange={(event) => setFile('religiousConfirmation', event.target.files?.[0] || null)} />
          <FileField label="Chief’s letter" files={files.chiefLetter} onChange={(event) => setFile('chiefLetter', event.target.files?.[0] || null)} />
          <FileField label="Medical certificate or health booklet" files={files.medicalOrHealth} onChange={(event) => setFile('medicalOrHealth', event.target.files?.[0] || null)} />
          <p className="text-muted">Accepted file types: PDF or JPG. Maximum 5 MB per file.</p>
        </div>

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit application'}
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
}

function FileField({ label, multiple = false, files, onChange }) {
  const selectedNames = multiple
    ? files?.map((file) => file.name).join(', ')
    : files?.name;
  return (
    <div className="form-field">
      <label className="form-label">
        {label}
        <input
          className="form-input"
          type="file"
          accept={ACCEPTED}
          multiple={multiple}
          onChange={onChange}
          required
        />
      </label>
      {selectedNames && <small>{selectedNames}</small>}
    </div>
  );
}

export default ApplyBirthCertificate;
