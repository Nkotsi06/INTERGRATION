import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import FormActions from '../../components/common/FormActions';
import Alert from '../../components/common/Alert';
import {
  getBiometricSettings,
  updateBiometricSettings,
} from '../../api/adminApi';
import { useNotification } from '../../context/NotificationContext';

function BiometricConfig() {
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const [config, setConfig] = useState({
    fingerprintEnabled: true,
    facialEnabled: true,
    matchThreshold: 85,
    maxAttempts: 3,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getBiometricSettings();
        if (cancelled) return;
        setConfig((prev) => ({ ...prev, ...(data || {}) }));
      } catch (err) {
        setError('Could not load biometric settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBiometricSettings(config);
      success('Biometric settings saved');
      navigate('/admin/settings');
    } catch (err) {
      showError('Could not save biometric settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper
        title="Biometric Settings"
        showBack
        backPath="/admin/settings"
        accentColour="#2C3E50"
      >
        <p className="text-muted">Loading…</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Biometric Settings"
      showBack
      backPath="/admin/settings"
      accentColour="#2C3E50"
    >
      <h1>Biometric settings</h1>

      {error && <Alert type="error" message={error} />}

      <div className="form-section">
        <h3 className="form-section-title">Capture options</h3>
        <Checkbox
          label="Enable fingerprint capture"
          checked={config.fingerprintEnabled}
          onChange={(e) =>
            setConfig({ ...config, fingerprintEnabled: e.target.checked })
          }
        />
        <Checkbox
          label="Enable facial capture"
          checked={config.facialEnabled}
          onChange={(e) =>
            setConfig({ ...config, facialEnabled: e.target.checked })
          }
        />
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Verification</h3>
        <div className="form-grid">
          <Input
            label="Match threshold (%)"
            type="number"
            value={config.matchThreshold}
            onChange={(e) =>
              setConfig({ ...config, matchThreshold: e.target.value })
            }
          />
          <Input
            label="Maximum attempts"
            type="number"
            value={config.maxAttempts}
            onChange={(e) =>
              setConfig({ ...config, maxAttempts: e.target.value })
            }
          />
        </div>
      </div>

      <FormActions
        primaryLabel="Save settings"
        primaryLoading={saving}
        onPrimary={handleSave}
        onSecondary={() => navigate('/admin/settings')}
      />
    </PageWrapper>
  );
}

export default BiometricConfig;