import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import DatePicker from '../../components/common/DatePicker';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import FormActions from '../../components/common/FormActions';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import {
  getCertificate,
  updateCertificate,
} from '../../api/certificateApi';
import { useNotification } from '../../context/NotificationContext';
import { typeLabel } from '../../utils/certificateLabels';

const FIELD_DEFS = {
  BIRTH: [
    { key: 'childFullName', label: 'Child full name', type: 'text', required: true },
    { key: 'childDateOfBirth', label: 'Child date of birth', type: 'date', required: true },
    { key: 'childGender', label: 'Gender', type: 'text' },
    { key: 'placeOfBirth', label: 'Place of birth', type: 'text' },
    { key: 'motherFullName', label: 'Mother full name', type: 'text' },
    { key: 'motherNationalId', label: 'Mother National ID', type: 'text' },
    { key: 'fatherFullName', label: 'Father full name', type: 'text' },
    { key: 'fatherNationalId', label: 'Father National ID', type: 'text' },
  ],
  DEATH: [
    { key: 'deceasedFullName', label: 'Deceased full name', type: 'text', required: true },
    { key: 'deceasedNationalId', label: 'Deceased National ID', type: 'text' },
    { key: 'dateOfDeath', label: 'Date of death', type: 'date', required: true },
    { key: 'placeOfDeath', label: 'Place of death', type: 'text' },
    { key: 'causeOfDeath', label: 'Cause of death', type: 'text' },
    { key: 'informantFullName', label: 'Informant full name', type: 'text' },
    { key: 'informantRelationship', label: 'Relationship', type: 'text' },
  ],
  MARRIAGE: [
    { key: 'spouse1FullName', label: 'Spouse 1 full name', type: 'text', required: true },
    { key: 'spouse1NationalId', label: 'Spouse 1 National ID', type: 'text' },
    { key: 'spouse2FullName', label: 'Spouse 2 full name', type: 'text', required: true },
    { key: 'spouse2NationalId', label: 'Spouse 2 National ID', type: 'text' },
    { key: 'marriageDate', label: 'Date of marriage', type: 'date', required: true },
    { key: 'marriagePlace', label: 'Place of marriage', type: 'text' },
    { key: 'marriageOfficiant', label: 'Officiant', type: 'text' },
  ],
  DIVORCE: [
    { key: 'spouse1FullName', label: 'Spouse 1 full name', type: 'text', required: true },
    { key: 'spouse1NationalId', label: 'Spouse 1 National ID', type: 'text' },
    { key: 'spouse2FullName', label: 'Former spouse full name', type: 'text', required: true },
    { key: 'spouse2NationalId', label: 'Former spouse National ID', type: 'text' },
    { key: 'divorceDate', label: 'Date of divorce', type: 'date', required: true },
    { key: 'courtName', label: 'Court name', type: 'text' },
    { key: 'caseNumber', label: 'Case number', type: 'text' },
  ],
};

// Map DB column names to form key names
const COLUMN_TO_KEY = {
  BIRTH: {
    child_full_name: 'childFullName',
    child_date_of_birth: 'childDateOfBirth',
    child_gender: 'childGender',
    place_of_birth: 'placeOfBirth',
    mother_full_name: 'motherFullName',
    mother_national_id: 'motherNationalId',
    father_full_name: 'fatherFullName',
    father_national_id: 'fatherNationalId',
    request_type: 'requestType',
  },
  DEATH: {
    deceased_full_name: 'deceasedFullName',
    deceased_national_id: 'deceasedNationalId',
    date_of_death: 'dateOfDeath',
    place_of_death: 'placeOfDeath',
    cause_of_death: 'causeOfDeath',
    informant_full_name: 'informantFullName',
    informant_relationship: 'informantRelationship',
  },
  MARRIAGE: {
    spouse1_full_name: 'spouse1FullName',
    spouse1_national_id: 'spouse1NationalId',
    spouse2_full_name: 'spouse2FullName',
    spouse2_national_id: 'spouse2NationalId',
    marriage_date: 'marriageDate',
    marriage_place: 'marriagePlace',
    marriage_officiant: 'marriageOfficiant',
    request_type: 'requestType',
  },
  DIVORCE: {
    spouse1_full_name: 'spouse1FullName',
    spouse1_national_id: 'spouse1NationalId',
    spouse2_full_name: 'spouse2FullName',
    spouse2_national_id: 'spouse2NationalId',
    divorce_date: 'divorceDate',
    court_name: 'courtName',
    case_number: 'caseNumber',
  },
};

function EditCertificate() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { success } = useNotification();

  const [row, setRow] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const upperType = String(type).toUpperCase();
  const fields = FIELD_DEFS[upperType] || [];
  const columnMap = COLUMN_TO_KEY[upperType] || {};

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getCertificate(upperType, id);
        if (cancelled) return;
        setRow(data);
        const initial = {};
        Object.entries(columnMap).forEach(([column, key]) => {
          initial[key] = data[column] || '';
        });
        setForm(initial);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load this certificate.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upperType, id]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await updateCertificate(upperType, id, form);
      success('Certificate updated');
      navigate('/home-affairs/certificates');
    } catch (err) {
      setError(err.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Edit Certificate" showBack backPath="/home-affairs/certificates">
        <TableSkeleton rows={6} columns={2} />
      </PageWrapper>
    );
  }

  if (!row) {
    return (
      <PageWrapper title="Edit Certificate" showBack backPath="/home-affairs/certificates">
        <Alert type="error" message={error || 'Certificate not found.'} />
      </PageWrapper>
    );
  }

  if (row.status === 'ISSUED') {
    return (
      <PageWrapper title="Edit Certificate" showBack backPath="/home-affairs/certificates">
        <Alert
          type="warning"
          message="This certificate has been issued. Issued certificates cannot be edited."
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Edit Certificate"
      showBack
      backPath="/home-affairs/certificates"
      accentColour="#1A5276"
    >
      <h1>Edit {typeLabel(upperType)}</h1>
      <p className="text-muted">
        Certificate number: <strong>{row.certificate_number}</strong> · Status:{' '}
        {row.status}
      </p>

      {error && <Alert type="error" message={error} />}

      <div className="form-grid">
        {fields.map((f) => (
          <div key={f.key} className="form-field">
            <label className="form-label">
              {f.label}
              {f.required && <span className="required-mark">*</span>}
            </label>
            {f.type === 'date' ? (
              <DatePicker
                value={form[f.key] || ''}
                onChange={(e) => update(f.key, e.target.value)}
              />
            ) : (
              <Input
                value={form[f.key] || ''}
                onChange={(e) => update(f.key, e.target.value)}
                required={f.required}
              />
            )}
          </div>
        ))}
      </div>

      <FormActions
        primaryLabel="Save changes"
        primaryLoading={saving}
        onPrimary={handleSave}
        onSecondary={() => navigate('/home-affairs/certificates')}
      />
    </PageWrapper>
  );
}

export default EditCertificate;