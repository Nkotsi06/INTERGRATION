import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import FormActions from '../../components/common/FormActions';
import DocumentUpload from '../../components/documents/DocumentUpload';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { getServiceById, applyForService, getPublicBranches } from '../../api/serviceApi';
import { uploadDocument } from '../../api/documentApi';
import { getEligibility } from '../../api/pensionsApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

const POLICE_FORM_FIELDS = {
  POLICE_LOST_PROPERTY: [
    { key: 'propertyDescription', label: 'Property description', type: 'textarea', required: true },
    { key: 'incidentDate', label: 'Date lost or stolen', type: 'date', required: true },
    { key: 'location', label: 'Location', type: 'text', required: true },
    { key: 'description', label: 'Additional details', type: 'textarea', required: true },
  ],
  POLICE_ACCIDENT: [
    { key: 'incidentDate', label: 'Accident date', type: 'date', required: true },
    { key: 'location', label: 'Accident location', type: 'text', required: true },
    { key: 'vehiclesInvolved', label: 'Vehicles involved', type: 'text', required: true },
    { key: 'statementDetails', label: 'Statement details', type: 'textarea', required: true },
  ],
  POLICE_STATEMENTS: [
    { key: 'caseNumber', label: 'Case number (if known)', type: 'text', required: false },
    { key: 'statementDetails', label: 'Statement details', type: 'textarea', required: true },
  ],
};

function ServiceApply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useNotification();

  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({ branchId: '' });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [reference, setReference] = useState(null);

  // Group C — pension eligibility gate
  const [pensionEligibility, setPensionEligibility] = useState(null);
  const isPensionService =
    service?.ministry === 'PENSIONS' &&
    (service?.code === 'PENSION_APPLICATION' || service?.code === 'PENSION_LIFE_VERIFY');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getServiceById(id);
        if (cancelled) return;
        setService(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load this service.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (service?.ministry !== 'HOME_AFFAIRS') return undefined;
    let cancelled = false;
    getPublicBranches('HOME_AFFAIRS')
      .then((data) => {
        if (!cancelled) setBranches(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Could not load collection branches.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [service]);

  useEffect(() => {
    if (!isPensionService) return undefined;
    let cancelled = false;
    async function load() {
      try {
        const data = await getEligibility();
        if (!cancelled) setPensionEligibility(data);
      } catch {
        if (!cancelled) setPensionEligibility(null);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isPensionService]);

  const update = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const fee = service?.fee ? Number(service.fee) : 0;
  const needsPayment = fee > 0 && service?.feeActive !== false;

  const handleSubmit = async () => {
    setError(null);

    if (service?.ministry === 'HOME_AFFAIRS' && !formData.branchId) {
      setError('Please choose a collection branch.');
      return;
    }
    setSaving(true);
    try {
      const result = await applyForService(id, formData);
      setReference(result.referenceNumber);
      success('Application submitted');
    } catch (err) {
      setError(err.message || 'Could not submit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Apply" showBack backPath="/citizen/dashboard">
        <TableSkeleton rows={4} columns={2} />
      </PageWrapper>
    );
  }

  if (error && !service) {
    return (
      <PageWrapper title="Apply" showBack backPath="/citizen/dashboard">
        <Alert type="error" message={error} />
      </PageWrapper>
    );
  }

  if (!service) {
    return (
      <PageWrapper title="Apply" showBack backPath="/citizen/dashboard">
        <p className="text-muted">Service not found.</p>
      </PageWrapper>
    );
  }

  if (!service.isEnabled) {
    return (
      <PageWrapper title={service.name} showBack backPath="/citizen/dashboard">
        <Alert
          type="info"
          message={service.unavailableMessage || 'This service is currently unavailable.'}
        />
      </PageWrapper>
    );
  }

  // Group C — block pension applications when the citizen is not eligible.
  if (isPensionService && pensionEligibility && !pensionEligibility.eligible) {
    return (
      <PageWrapper title={service.name} showBack backPath="/citizen/dashboard">
        <Alert
          type="warning"
          title="You are not eligible for a pension yet"
          message={pensionEligibility.message}
        />
        <div className="form-actions">
          <div className="form-actions-primary-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/citizen/dashboard')}
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const configuredFields = Array.isArray(service.formFields) ? service.formFields : [];
  const fields = configuredFields.length > 0
    ? configuredFields
    : POLICE_FORM_FIELDS[service.code] || [];
  const docs = Array.isArray(service.requiredDocuments) ? service.requiredDocuments : [];
  const visibleDocs = service.ministry === 'HOME_AFFAIRS'
    ? docs.filter((code) => !['NATIONAL_ID', 'BIRTH_CERTIFICATE'].includes(code))
    : docs;

  if (reference) {
    return (
      <PageWrapper title="Application submitted" accentColour="#27AE60">
        <div className="result-card">
          <h2>{service.name} — submitted</h2>
          <p>Your reference number:</p>
          <div className="reference-number">
            <span className="reference-value">{reference}</span>
          </div>
          {fee > 0 && (
            <p className="text-muted">
              A fee of {formatCurrency(fee)} is due. Pay it from the Finance dashboard.
            </p>
          )}
          <div className="result-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(fee > 0 ? '/finance/dashboard' : '/citizen/applications')}
            >
              {fee > 0 ? 'Go to Finance to pay' : 'View my applications'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/citizen/dashboard')}
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={service.name} showBack backPath="/citizen/dashboard">
      <h1>{service.name}</h1>
      {service.description && <p className="text-muted">{service.description}</p>}

      {error && <Alert type="error" message={error} />}

      <div className="form-section">
        <h3 className="form-section-title">Information</h3>
        <div className="form-grid">
          {fields.length === 0 && (
            <p className="text-muted">No additional information is required.</p>
          )}
          {fields.map((f) => (
            <div
              key={f.key}
              className={`form-field ${f.type === 'textarea' ? 'form-grid-full' : ''}`}
            >
              <label className="form-label">
                {f.label || f.key}
                {f.required && <span className="required-mark">*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  className="form-input"
                  rows={4}
                  value={formData[f.key] || ''}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              ) : f.type === 'select' ||
                  (service.code === 'BIRTH_CERTIFICATE_APPLY' &&
                    ['childGender', 'requestType'].includes(f.key)) ||
                (service.ministry === 'PENSIONS' && f.key === 'pensionType') ||
                (service.code === 'POLICE_REPORT' && f.key === 'caseType') ? (
                <Select
                  value={formData[f.key] || ''}
                  onChange={(e) => update(f.key, e.target.value)}
                  options={
                    f.options ||
                    (f.key === 'caseType'
                      ? [
                          { value: 'THEFT', label: 'Theft' },
                          { value: 'ASSAULT', label: 'Assault' },
                          { value: 'FRAUD', label: 'Fraud' },
                          { value: 'MISSING_PERSON', label: 'Missing Person' },
                          { value: 'OTHER', label: 'Other' },
                        ]
                      : f.key === 'childGender'
                      ? [
                          { value: 'MALE', label: 'Male' },
                          { value: 'FEMALE', label: 'Female' },
                          { value: 'OTHER', label: 'Other' },
                        ]
                      : f.key === 'requestType'
                        ? [
                            { value: 'NEW', label: 'New' },
                            { value: 'REPLACEMENT', label: 'Replacement' },
                          ]
                        : [
                            { value: 'OLD_AGE', label: 'Old Age Pension' },
                            { value: 'CIVIL_SERVICE', label: 'Civil Service Pension' },
                          ])
                  }
                  required={f.required}
                />
              ) : (
                <Input
                  type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                  value={formData[f.key] || ''}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
          {service.ministry === 'HOME_AFFAIRS' && (
            <div className="form-grid-full">
              {branches.length === 0 && (
                <p className="text-muted">No Home Affairs collection branches are available.</p>
              )}
              <Select
                label="Collection branch"
                value={formData.branchId}
                onChange={(e) => update('branchId', e.target.value)}
                options={branches.map((branch) => ({
                  value: branch.id,
                  label: `${branch.name}${branch.district ? ` — ${branch.district}` : ''}`,
                }))}
                required
              />
            </div>
          )}
        </div>
      </div>

      {visibleDocs.length > 0 && (
        <div className="form-section">
          <h3 className="form-section-title">Required documents</h3>
          {visibleDocs.map((code) => (
            <DocumentUpload
              key={code}
              documentType={code}
              label={code.replace(/_/g, ' ')}
              onUpload={async (formDataArg, config) => {
                await uploadDocument(formDataArg, config);
                success('Document uploaded');
              }}
            />
          ))}
        </div>
      )}

      {needsPayment && (
        <div className="form-section">
          <h3 className="form-section-title">Service fee</h3>
          <p className="text-muted">
            This service costs <strong>{formatCurrency(fee)}</strong>. You can pay after submitting your application from the Finance dashboard.
          </p>
        </div>
      )}

      <FormActions
        primaryLabel="Submit application"
        primaryLoading={saving}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/citizen/dashboard')}
      />
    </PageWrapper>
  );
}

export default ServiceApply;