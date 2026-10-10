import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getSystemSettings, updateSystemSettings } from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';

const FIELDS = [
  'system_name',
  'default_language',
  'session_timeout_minutes',
  'password_min_length',
  'failed_login_limit',
  'account_lockout_duration',
  'email_notifications',
  'sms_notifications',
];

function SystemSettings() {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const { reload: reloadGlobalSettings } = useSettings();

  const [saved, setSaved] = useState({});
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [discardOpen, setDiscardOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const result = await getSystemSettings();
        if (cancelled) return;
        const initial = {};
        FIELDS.forEach((key) => {
          initial[key] = result[key] || '';
        });
        setSaved(initial);
        setValues(initial);
      } catch (err) {
        setServerError('Could not load settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (field, value) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const isDirty = FIELDS.some((key) => values[key] !== saved[key]);

  const handleSave = async () => {
    setServerError(null);
    setSaving(true);
    try {
      await updateSystemSettings(values);
      await reloadGlobalSettings();
      success('Settings saved.');
      setSaved(values);
    } catch (err) {
      showError(err.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setDiscardOpen(true);
    } else {
      navigate('/admin/dashboard');
    }
  };

  const confirmDiscard = () => {
    setValues(saved);
    setDiscardOpen(false);
    navigate('/admin/dashboard');
  };

  if (loading) {
    return (
      <AdminLayout title="System Settings" showBack backPath="/admin/dashboard">
        <p className="text-muted">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="System Settings" showBack backPath="/admin/dashboard">
      <h1>System Settings</h1>

      {serverError && <Alert type="error" message={serverError} />}

      <div className="form-section">
        <h3 className="form-section-title">General</h3>
        <div className="form-grid">
          <Input
            label="System name"
            value={values.system_name}
            onChange={(e) => update('system_name', e.target.value)}
          />
          <Select
            label="Default language"
            value={values.default_language}
            onChange={(e) => update('default_language', e.target.value)}
            options={[
              { value: 'EN', label: 'English (EN)' },
              { value: 'ST', label: 'Sesotho (ST)' },
            ]}
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Security</h3>
        <div className="form-grid">
          <Input
            label="Session timeout"
            value={values.session_timeout_minutes}
            onChange={(e) => update('session_timeout_minutes', e.target.value)}
            helpText="Minutes"
          />
          <Input
            label="Password policy"
            value={values.password_min_length}
            onChange={(e) => update('password_min_length', e.target.value)}
            helpText="Minimum length, 8 recommended"
          />
          <Input
            label="Failed login limit"
            value={values.failed_login_limit}
            onChange={(e) => update('failed_login_limit', e.target.value)}
            helpText="Attempts before lockout"
          />
          <Input
            label="Account lockout duration"
            value={values.account_lockout_duration}
            onChange={(e) => update('account_lockout_duration', e.target.value)}
            helpText="Minutes"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Notifications</h3>
        <div className="form-grid">
          <Select
            label="Email notifications"
            value={values.email_notifications}
            onChange={(e) => update('email_notifications', e.target.value)}
            options={[
              { value: 'Enabled', label: 'Enabled' },
              { value: 'Disabled', label: 'Disabled' },
            ]}
          />
          <Select
            label="SMS notifications"
            value={values.sms_notifications}
            onChange={(e) => update('sms_notifications', e.target.value)}
            options={[
              { value: 'Enabled', label: 'Enabled' },
              { value: 'Disabled', label: 'Disabled' },
            ]}
          />
        </div>
      </div>

      <FormActions
        primaryLabel="Save Settings"
        primaryLoading={saving}
        onPrimary={handleSave}
        onSecondary={handleCancel}
      />

      <ConfirmDialog
        isOpen={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={confirmDiscard}
        title="Discard unsaved changes?"
        message="Any changes you have made will be lost."
        confirmLabel="Discard"
        variant="danger"
      />
    </AdminLayout>
  );
}

export default SystemSettings;