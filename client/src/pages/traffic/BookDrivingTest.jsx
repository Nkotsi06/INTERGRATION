import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import DatePicker from '../../components/common/DatePicker';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import useServiceFee from '../../hooks/useServiceFees';
import { bookDrivingTest } from '../../api/trafficApi';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

function BookDrivingTest() {
  const { fee, currency } = useServiceFee('TRAFFIC', 'DRIVING_TEST_BOOKING');
  const [form, setForm] = useState({
    testType: '',
    date: '',
    time: '',
    location: '',
    method: 'MOBILE_MONEY',
    mobile: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { success } = useNotification();

  const handleBook = async () => {
    setError(null);
    if (!form.testType || !form.date || !form.time || !form.location) {
      setError('Please complete every field.');
      return;
    }
    if (form.method === 'MOBILE_MONEY' && !form.mobile.trim()) {
      setError('Please enter your mobile number for payment.');
      return;
    }

    setLoading(true);
    try {
      await bookDrivingTest({ ...form, amount: fee });
      success('Test booked');
      navigate('/traffic/appointments');
    } catch (err) {
      setError(err.message || 'Booking failed. Please try a different slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Book Driving Test"
      showBack
      backPath="/traffic/dashboard"
      accentColour="#B9770E"
    >
      <h1>Book driving test</h1>

      {error && <Alert type="error" message={error} />}

      <Select
        label="Test type"
        value={form.testType}
        onChange={(e) => setForm({ ...form, testType: e.target.value })}
        options={[
          { value: 'LEARNER', label: "Learner's licence test" },
          { value: 'DRIVER', label: "Driver's licence test" },
        ]}
        required
      />

      <DatePicker
        label="Preferred date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
      />

      <Select
        label="Time slot"
        value={form.time}
        onChange={(e) => setForm({ ...form, time: e.target.value })}
        options={[
          { value: '09:00', label: '09:00 – 09:30' },
          { value: '10:00', label: '10:00 – 10:30' },
          { value: '11:00', label: '11:00 – 11:30' },
          { value: '14:00', label: '14:00 – 14:30' },
        ]}
        required
      />

      <Select
        label="Location"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        options={[
          { value: 'MASERU', label: 'Maseru testing centre' },
          { value: 'LERIBE', label: 'Leribe testing centre' },
          { value: 'MAFETENG', label: 'Mafeteng testing centre' },
        ]}
        required
      />

      {fee > 0 && (
        <div className="form-section">
          <h3 className="form-section-title">Payment</h3>
          <p className="text-muted">
            Test fee: <strong>{formatCurrency(fee, currency)}</strong>
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
              placeholder="+266 5888 2140"
              required
            />
          )}
        </div>
      )}

      <FormActions
        primaryLabel={
          fee > 0
            ? `Pay ${formatCurrency(fee, currency)} and book`
            : 'Book appointment'
        }
        primaryLoading={loading}
        onPrimary={handleBook}
        onSecondary={() => navigate('/traffic/dashboard')}
      />
    </PageWrapper>
  );
}

export default BookDrivingTest;