import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import PasswordInput from '../../components/common/PasswordInput';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import DeactivatePanel from '../../components/admin/DeactivatePanel';
import DeletePanel from '../../components/admin/DeletePanel';
import {
  getOptions,
  getUserById,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
} from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();

  const [options, setOptions] = useState({ roles: [], ministries: [] });
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [opts, user] = await Promise.all([getOptions(), getUserById(id)]);
        if (cancelled) return;
        setOptions(opts);
        setForm({
          fullName: user.fullName || '',
          username: user.username,
          email: user.email || '',
          role: user.role,
          ministry: user.ministry || '',
          status: user.status,
          password: '',
          confirmPassword: '',
        });
      } catch (err) {
        setServerError('Could not load this user.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Please enter a valid email address.';
    if (form.role === 'STAFF' && !form.ministry)
      next.ministry = 'Ministry is required for staff.';

    if (form.password || form.confirmPassword) {
      if (form.password.length < 8)
        next.password = 'Password must be at least 8 characters.';
      else if (!/\d/.test(form.password))
        next.password = 'Password must contain at least one number.';
      if (form.password !== form.confirmPassword)
        next.confirmPassword = 'Passwords do not match.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    setServerError(null);
    if (!validate()) return;
    setSaving(true);
    try {
      await updateUser(id, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role,
        ministry: form.role === 'STAFF' ? form.ministry : null,
        status: form.status,
        password: form.password || undefined,
      });
      success('User updated.');
      navigate('/admin/users');
    } catch (err) {
      setServerError(err.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setActionLoading(true);
    try {
      await deactivateUser(id);
      success('User deactivated.');
      setDeactivateOpen(false);
      navigate('/admin/users');
    } catch (err) {
      showError(err.message || 'Could not deactivate.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    setActionLoading(true);
    try {
      await activateUser(id);
      success('User activated.');
      setActivateOpen(false);
      navigate('/admin/users');
    } catch (err) {
      showError(err.message || 'Could not activate.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteUser(id);
      success('User deleted. Audit records were kept.');
      setDeleteOpen(false);
      navigate('/admin/users');
    } catch (err) {
      showError(err.message || 'Could not delete.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !form) {
    return (
      <AdminLayout title="Edit User" showBack backPath="/admin/users">
        <p className="text-muted">Loading…</p>
      </AdminLayout>
    );
  }

  const isActive = form.status === 'ACTIVE';

  return (
    <AdminLayout title="Edit User" showBack backPath="/admin/users">
      <h1>Edit User</h1>
      <p className="text-muted">{form.username} · Staff account</p>

      {serverError && <Alert type="error" message={serverError} />}

      <div className="form-section">
        <h3 className="form-section-title">Account details</h3>
        <div className="form-grid">
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            error={errors.fullName}
          />
          <Input label="Username" value={form.username} disabled />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            error={errors.email}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => update('role', e.target.value)}
            options={options.roles.map((r) => ({ value: r.value, label: r.label }))}
          />
          <Select
            label="Ministry"
            value={form.ministry}
            onChange={(e) => update('ministry', e.target.value)}
            options={options.ministries.map((m) => ({ value: m.value, label: m.label }))}
            disabled={form.role !== 'STAFF'}
            error={errors.ministry}
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
            label="New Password · Optional"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            autoComplete="new-password"
            error={errors.password}
            helpText="Leave unchanged to keep the current password"
          />
          <PasswordInput
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            autoComplete="new-password"
            error={errors.confirmPassword}
          />
        </div>
      </div>

      <FormActions
        primaryLabel="Save Changes"
        primaryLoading={saving}
        onPrimary={handleSave}
        onSecondary={() => navigate('/admin/users')}
        destructiveLabel={isActive ? 'Deactivate' : undefined}
        onDestructive={isActive ? () => setDeactivateOpen(true) : undefined}
      />

      {!isActive && (
        <div className="danger-zone">
          <h3 className="form-section-title">Inactive user</h3>
          <p className="text-muted">
            This user cannot sign in. Activate them, or delete them permanently.
          </p>
          <div className="danger-zone-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActivateOpen(true)}
            >
              Activate
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setDeleteOpen(true)}
            >
              Delete permanently
            </button>
          </div>
        </div>
      )}

      {deactivateOpen && (
        <DeactivatePanel
          user={form}
          action="deactivate"
          loading={actionLoading}
          onCancel={() => setDeactivateOpen(false)}
          onConfirm={handleDeactivate}
        />
      )}

      {activateOpen && (
        <ConfirmDialog
          isOpen
          onClose={() => setActivateOpen(false)}
          onConfirm={handleActivate}
          title="Activate this user?"
          message={`${form.username} will be able to sign in again.`}
          confirmLabel="Activate"
          variant="primary"
          loading={actionLoading}
        />
      )}

      {deleteOpen && (
        <DeletePanel
          user={form}
          loading={actionLoading}
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </AdminLayout>
  );
}

export default EditUser;