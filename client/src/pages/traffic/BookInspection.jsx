import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import DatePicker from '../../components/common/DatePicker';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useServiceFee from '../../hooks/useServiceFees';
import { bookInspection } from '../../api/trafficApi';
import { getPublicBranches } from '../../api/serviceApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function BookInspection() {
  const { fee, currency } = useServiceFee('TRAFFIC', 'VEHICLE_INSPECTION');
  const [form, setForm] = useState({
    inspectionType: '',
    inspectionDate: '',
    timeSlot: '',
    location: '',
    method: 'MOBILE_MONEY',
    mobile: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const navigate = useNavigate();
  const { success } = useNotification();

  useEffect(() => {
    let cancelled = false;
    getPublicBranches('TRAFFIC')
      .then((data) => {
        if (!cancelled) setBranches(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load Traffic branches.');
      })
      .finally(() => {
        if (!cancelled) setBranchesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!form.inspectionType || !form.inspectionDate || !form.location) {
      setError('Inspection type, date, and location are required.');
      return;
    }
    if (fee > 0 && form.method === 'MOBILE_MONEY' && !form.mobile.trim()) {
      setError('Please enter your mobile number for payment.');
      return;
    }
    setLoading(true);
    try {
      await bookInspection({ ...form, amount: fee });
      success('Inspection booked');
      navigate('/traffic/inspections');
    } catch (err) {
      setError(err.message || 'Could not book the inspection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Book Inspection"
      showBack
      backPath="/traffic/inspections"
      accentColour="#B9770E"
    >
      <h1>Book an inspection</h1>

      {error && <Alert type="error" message={error} />}

      <Select
        label="Inspection type"
        value={form.inspectionType}
        onChange={(e) => setForm({ ...form, inspectionType: e.target.value })}
        options={[
          { value: 'ROADWORTHINESS', label: 'Roadworthiness' },
          { value: 'EMISSIONS', label: 'Emissions' },
          { value: 'IMPORT', label: 'Import inspection' },
        ]}
        required
      />

      <DatePicker
        label="Inspection date"
        value={form.inspectionDate}
        onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })}
        required
      />

      <Select
        label="Time slot"
        value={form.timeSlot}
        onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
        options={[
          { value: '08:00', label: '08:00' },
          { value: '10:00', label: '10:00' },
          { value: '13:00', label: '13:00' },
        ]}
      />

      <Select
        label="Location"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        options={branches.map((branch) => ({
          value: branch.id,
          label: `${branch.name}${branch.district ? ` (${branch.district})` : ''}`,
        }))}
        disabled={branchesLoading || branches.length === 0}
        required
      />
      {!branchesLoading && branches.length === 0 && (
        <Alert type="warning" message="No active Traffic branches are available." />
      )}

      {fee > 0 && (
        <div className="form-section">
          <h3 className="form-section-title">Payment</h3>
          <p className="text-muted">
            Inspection fee: <strong>{formatCurrency(fee, currency)}</strong>
          </p>
          <Select
            label="Payment method"
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            options={[
              { value: 'MOBILE_MONEY', label: 'Mobile money' },
              { value: 'BANK_TRANSFER', label: 'Bank transfer' },
              { value: 'CARD', label: 'Card' },
            ]}
            required
          />
          {form.method === 'MOBILE_MONEY' && (
            <Input
              label="Mobile number"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              required
            />
          )}
        </div>
      )}

      <FormActions
        primaryLabel={
          fee > 0 ? `Pay ${formatCurrency(fee, currency)} and book` : 'Book inspection'
        }
        primaryLoading={loading}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/traffic/inspections')}
      />
    </PageWrapper>
  );
}

export default BookInspection;