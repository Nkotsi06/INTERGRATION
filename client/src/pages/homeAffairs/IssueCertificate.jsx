import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import DatePicker from '../../components/common/DatePicker';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import { useNotification } from '../../context/NotificationContext';
import {
  issueBirthCertificate,
  issueDeathCertificate,
  issueMarriageCertificate,
} from '../../api/homeAffairsApi';

const TYPES = {
  birth:    'Birth certificate',
  death:    'Death certificate',
  marriage: 'Marriage certificate',
};

function HAIssueCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'birth';
  const { success } = useNotification();

  const [form, setForm] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      if (type === 'birth') {
        await issueBirthCertificate(id, form);
      } else if (type === 'death') {
        await issueDeathCertificate(id, form);
      } else {
        await issueMarriageCertificate(id, form);
      }
      success(`${TYPES[type]} issued`);
      navigate(`/home-affairs/citizen/${id}/certificates`);
    } catch (err) {
      setError(err.message || 'Could not issue the certificate.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper
      title={TYPES[type]}
      showBack
      backPath={`/home-affairs/citizen/${id}/certificates`}
      accentColour="#1A5276"
    >
      <h1>{TYPES[type]}</h1>

      {error && <Alert type="error" message={error} />}

      {type === 'birth' && (
        <div className="form-grid">
          <DatePicker
            label="Date of birth"
            value={form.dateOfBirth || ''}
            onChange={(e) => update('dateOfBirth', e.target.value)}
            required
          />
          <Input
            label="Place of birth"
            value={form.placeOfBirth || ''}
            onChange={(e) => update('placeOfBirth', e.target.value)}
          />
          <Input
            label="Father's name"
            value={form.fatherName || ''}
            onChange={(e) => update('fatherName', e.target.value)}
          />
          <Input
            label="Mother's name"
            value={form.motherName || ''}
            onChange={(e) => update('motherName', e.target.value)}
          />
          <Input
            label="Notes"
            value={form.notes || ''}
            onChange={(e) => update('notes', e.target.value)}
            full
          />
        </div>
      )}

      {type === 'death' && (
        <div className="form-grid">
          <DatePicker
            label="Date of death"
            value={form.dateOfDeath || ''}
            onChange={(e) => update('dateOfDeath', e.target.value)}
            required
          />
          <Input
            label="Place of death"
            value={form.placeOfDeath || ''}
            onChange={(e) => update('placeOfDeath', e.target.value)}
          />
          <Input
            label="Cause of death"
            value={form.causeOfDeath || ''}
            onChange={(e) => update('causeOfDeath', e.target.value)}
            full
          />
          <Input
            label="Notes"
            value={form.notes || ''}
            onChange={(e) => update('notes', e.target.value)}
            full
          />
        </div>
      )}

      {type === 'marriage' && (
        <div className="form-grid">
          <Input
            label="Spouse 2 — full name"
            value={form.spouse2Name || ''}
            onChange={(e) => update('spouse2Name', e.target.value)}
            full
          />
          <Input
            label="Spouse 2 — citizen UUID (optional)"
            value={form.spouse2CitizenId || ''}
            onChange={(e) => update('spouse2CitizenId', e.target.value)}
            helpText="Leave blank if spouse 2 is not yet a registered citizen."
            full
          />
          <DatePicker
            label="Marriage date"
            value={form.marriageDate || ''}
            onChange={(e) => update('marriageDate', e.target.value)}
            required
          />
          <Input
            label="Place of marriage"
            value={form.placeOfMarriage || ''}
            onChange={(e) => update('placeOfMarriage', e.target.value)}
          />
          <Input
            label="Officiant"
            value={form.officiant || ''}
            onChange={(e) => update('officiant', e.target.value)}
          />
          <Input
            label="Notes"
            value={form.notes || ''}
            onChange={(e) => update('notes', e.target.value)}
            full
          />
        </div>
      )}

      <FormActions
        primaryLabel="Issue certificate"
        primaryLoading={saving}
        onPrimary={handleSave}
        onSecondary={() => navigate(`/home-affairs/citizen/${id}/certificates`)}
      />
    </PageWrapper>
  );
}

export default HAIssueCertificate;