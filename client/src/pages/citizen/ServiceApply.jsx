import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import FormActions from '../../components/common/FormActions';
import DocumentUpload from '../../components/documents/DocumentUpload';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import { getServiceById, applyForService } from '../../api/serviceApi';
import { uploadDocument } from '../../api/documentApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function ServiceApply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success } = useNotification();

  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({ method: 'MOBILE_MONEY', mobile: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [reference, setReference] = useState(null);

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

  const update = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const fee = service?.fee ? Number(service.fee) : 0;
  const needsPayment = fee > 0 && service?.fee_active !== false;

  const handleSubmit = async () => {
    setError(null);

    if (needsPayment && formData.method === 'MOBILE_MONEY' && !formData.mobile) {
      setError('Please enter a mobile number for the payment prompt.');
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

  if (!service.is_enabled) {
    return (
      <PageWrapper title={service.name} showBack backPath="/citizen/dashboard">
        <Alert
          type="info"
          message={service.unavailable_message || 'This service is currently unavailable.'}
        />
      </PageWrapper>
    );
  }

  const fields = Array.isArray(service.form_fields) ? service.form_fields : [];
  const docs = Array.isArray(service.required_documents) ? service.required_documents : [];

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
              A payment of {formatCurrency(fee)} has been recorded.
            </p>
          )}
          <div className="result-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/citizen/applications')}
            >
              View my applications
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
              ) : (
                <Input
                  type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                  value={formData[f.key] || ''}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {docs.length > 0 && (
        <div className="form-section">
          <h3 className="form-section-title">Required documents</h3>
          {docs.map((code) => (
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
          <h3 className="form-section-title">Payment</h3>
          <p className="text-muted">
            This service costs <strong>{formatCurrency(fee)}</strong>.
          </p>
          <div className="form-grid">
            <Select
              label="Payment method"
              value={formData.method}
              onChange={(e) => update('method', e.target.value)}
              options={[
                { value: 'MOBILE_MONEY', label: 'Mobile money' },
                { value: 'BANK_TRANSFER', label: 'Bank transfer' },
                { value: 'CARD', label: 'Card' },
              ]}
              required
            />
            {formData.method === 'MOBILE_MONEY' && (
              <Input
                label="Mobile number"
                value={formData.mobile}
                onChange={(e) => update('mobile', e.target.value)}
                placeholder="+266 5888 2140"
                required
              />
            )}
          </div>
        </div>
      )}

      <FormActions
        primaryLabel={needsPayment ? `Pay ${formatCurrency(fee)} and submit` : 'Submit application'}
        primaryLoading={saving}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/citizen/dashboard')}
      />
    </PageWrapper>
  );
}

export default ServiceApply;