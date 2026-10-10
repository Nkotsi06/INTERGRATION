import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import PasswordInput from '../../components/common/PasswordInput';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import { getOptions, createUser } from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

function AddUser() {
  const navigate = useNavigate();
  const { success } = useNotification();

  const [options, setOptions] = useState({
    roles: [],
    ministries: [],
    statuses: [],
  });
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    role: '',
    ministry: '',
    status: 'ACTIVE',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOptions()
      .then(setOptions)
      .catch(() => setServerError('Could not load form options.'));
  }, []);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    if (!form.username.trim()) next.username = 'Username is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Please enter a valid email address.';
    if (!form.role) next.role = 'Role is required.';
    if (form.role === 'STAFF' && !form.ministry)
      next.ministry = 'Ministry is required for staff.';
    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 8)
      next.password = 'Password must be at least 8 characters.';
    else if (!/\d/.test(form.password))
      next.password = 'Password must contain at least one number.';
    if (form.password !== form.confirmPassword)
      next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setServerError(null);
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
        ministry: form.role === 'STAFF' ? form.ministry : null,
        status: form.status,
        password: form.password,
      };
      const result = await createUser(payload);
      success(`User ${result.username} created.`);
      navigate('/admin/users');
    } catch (err) {
      setServerError(err.message || 'Could not create the user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const ministryDisabled = form.role !== 'STAFF';

  return (
    <AdminLayout title="Add New User" showBack backPath="/admin/users">
      <h1>Add New User</h1>
      <p className="text-muted">Create an account and assign the appropriate access level.</p>

      {serverError && <Alert type="error" message={serverError} />}

      <div className="form-section">
        <h3 className="form-section-title">Account details</h3>

        <div className="form-grid">
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            required
            error={errors.fullName}
          />
          <Input
            label="Username"
            value={form.username}
            onChange={(e) => update('username', e.target.value)}
            required
            error={errors.username}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
            error={errors.email}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => update('role', e.target.value)}
            options={options.roles.map((r) => ({ value: r.value, label: r.label }))}
            required
            error={errors.role}
            helpText="Citizen / Staff / Admin"
          />
          <Select
            label="Ministry"
            value={form.ministry}
            onChange={(e) => update('ministry', e.target.value)}
            options={options.ministries.map((m) => ({ value: m.value, label: m.label }))}
            disabled={ministryDisabled}
            error={errors.ministry}
            helpText="Home Affairs / Traffic / Police / Finance / Pensions / Passport"
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Password</h3>
        <div className="form-grid">
          <PasswordInput
            label="Password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            autoComplete="new-password"
            required
            error={errors.password}
            helpText="At least 8 characters, including a number"
          />
          <PasswordInput
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            autoComplete="new-password"
            required
            error={errors.confirmPassword}
          />
        </div>

        <p className="text-muted">
          Send the user their credentials securely. Staff access is restricted
          to the selected ministry.
        </p>
      </div>

      <FormActions
        primaryLabel="Create User"
        primaryLoading={saving}
        onPrimary={handleSubmit}
        onSecondary={() => navigate('/admin/users')}
      />
    </AdminLayout>
  );
}

export default AddUser;